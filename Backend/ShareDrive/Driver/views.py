from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.utils import timezone
from django.contrib.gis.geos import Point
from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.measure import D

from .models import (
    DriverProfile, DriverVehicle,
    SharedRideRoute, SharedRideBooking,
    FullRideRequest, FullRideAssignment
)
from .serializers import (
    DriverProfileSerializer, DriverVehiclesSerializer,
    SharedRideRouteSerializer, SharedRideBookingSerializer,
    FullRideRequestSerializer, FullRideAssignmentSerializer
)


# ─── Helper ───────────────────────────────────────────────────────────────────

def get_driver_profile(request):
    """Returns DriverProfile for the logged-in driver or raises 404."""
    return get_object_or_404(DriverProfile, user=request.user)

def get_customer_profile(request):
    """Returns CustomerProfile for the logged-in customer or raises 404."""
    from Customer.models import CustomerProfile
    return get_object_or_404(CustomerProfile, user=request.user)


# ─── Driver Profile ───────────────────────────────────────────────────────────

class DriverProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = get_driver_profile(request)
        serializer = DriverProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        profile = get_driver_profile(request)
        serializer = DriverProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─── Driver Vehicle ───────────────────────────────────────────────────────────

class DriverVehicleCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            driver_profile = DriverProfile.objects.get(user=request.user)
        except DriverProfile.DoesNotExist:
            return Response({"error": "Driver profile not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = DriverVehiclesSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(driver=driver_profile)
            return Response(
                {"message": "Vehicle submitted for admin verification"},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DriverVehiclesListAdminView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({"error": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)
        data = DriverVehicle.objects.all().order_by("created_at")
        serializer = DriverVehiclesSerializer(data, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class DriverVehicleDetailsAdminView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, vehicle_id):
        if not request.user.is_staff:
            return Response({"error": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)
        vehicle = get_object_or_404(DriverVehicle, id=vehicle_id)
        serializer = DriverVehiclesSerializer(vehicle)
        return Response(serializer.data, status=status.HTTP_200_OK)


class DriverVehicleApprovalAdminView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, vehicle_id):
        if not request.user.is_staff:
            return Response({"error": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)
        vehicle = get_object_or_404(DriverVehicle, id=vehicle_id)

        action = request.data.get("action")
        if action == "approve":
            vehicle.is_verified = True
            vehicle.is_active = "avaliable"
        elif action == "reject":
            vehicle.is_verified = False
            vehicle.is_active = "not avaliable"
        else:
            return Response({"error": "action must be 'approve' or 'reject'"}, status=status.HTTP_400_BAD_REQUEST)

        vehicle.save()
        return Response({"message": "Admin review updated"}, status=status.HTTP_200_OK)


# ─── Shared Ride — Driver side ────────────────────────────────────────────────

class SharedRouteCreateView(APIView):
    """Driver posts a new shared ride route."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        driver_profile = get_driver_profile(request)
        vehicle_id = request.data.get("driver_vehicle")
        if not vehicle_id:
            return Response({"error": "driver_vehicle is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Ensure the vehicle belongs to this driver
        vehicle = get_object_or_404(DriverVehicle, id=vehicle_id, driver=driver_profile)

        serializer = SharedRideRouteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SharedRouteListView(APIView):
    """Driver sees all their own routes."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        driver_profile = get_driver_profile(request)
        routes = SharedRideRoute.objects.filter(
            driver_vehicle__driver=driver_profile
        ).order_by('departure_time')
        serializer = SharedRideRouteSerializer(routes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class SharedRouteUpdateStatusView(APIView):
    """Driver updates status of a shared route (start / cancel / complete)."""
    permission_classes = [IsAuthenticated]

    def patch(self, request, route_id):
        driver_profile = get_driver_profile(request)
        route = get_object_or_404(SharedRideRoute, id=route_id, driver_vehicle__driver=driver_profile)

        new_status = request.data.get("status")
        valid_transitions = {
            'scheduled': ['started', 'cancelled'],
            'started': ['completed', 'cancelled'],
        }
        allowed = valid_transitions.get(route.status, [])
        if new_status not in allowed:
            return Response(
                {"error": f"Cannot move from '{route.status}' to '{new_status}'"},
                status=status.HTTP_400_BAD_REQUEST
            )
        route.status = new_status
        route.save()
        return Response({"message": f"Route status updated to '{new_status}'"}, status=status.HTTP_200_OK)


# ─── Shared Ride — Customer side ─────────────────────────────────────────────

class SharedRouteSearchView(APIView):
    """Customer searches shared routes by origin/destination keyword."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        origin = request.query_params.get("origin", "")
        destination = request.query_params.get("destination", "")
        lat = request.query_params.get("lat")
        lng = request.query_params.get("lng")
        radius_km = float(request.query_params.get("radius_km", 10))

        routes = SharedRideRoute.objects.filter(
            status='scheduled',
            departure_time__gte=timezone.now(),
        )

        if origin:
            routes = routes.filter(origin_name__icontains=origin)
        if destination:
            routes = routes.filter(destination_name__icontains=destination)

        # Geo-filter by nearby origin if lat/lng provided
        if lat and lng:
            customer_point = Point(float(lng), float(lat), srid=4326)
            routes = routes.filter(
                origin_point__distance_lte=(customer_point, D(km=radius_km))
            ).annotate(distance=Distance('origin_point', customer_point)).order_by('distance')

        serializer = SharedRideRouteSerializer(routes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class SharedRideBookView(APIView):
    """Customer books seat(s) on a shared route."""
    permission_classes = [IsAuthenticated]

    def post(self, request, route_id):
        customer_profile = get_customer_profile(request)
        route = get_object_or_404(SharedRideRoute, id=route_id, status='scheduled')

        seats_requested = int(request.data.get("seats_booked", 1))

        if seats_requested > route.seats_available:
            return Response(
                {"error": f"Only {route.seats_available} seat(s) available"},
                status=status.HTTP_400_BAD_REQUEST
            )

        total_price = route.price_per_seat * seats_requested

        booking = SharedRideBooking.objects.create(
            route=route,
            customer=customer_profile,
            seats_booked=seats_requested,
            total_price=total_price,
            pickup_address=request.data.get("pickup_address", ""),
            notes=request.data.get("notes", ""),
            booking_status='confirmed',
        )
        serializer = SharedRideBookingSerializer(booking)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class SharedRideBookingListView(APIView):
    """Customer sees their shared ride bookings."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        customer_profile = get_customer_profile(request)
        bookings = SharedRideBooking.objects.filter(customer=customer_profile).order_by('-created_at')
        serializer = SharedRideBookingSerializer(bookings, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class SharedRideBookingCancelView(APIView):
    """Customer cancels their shared ride booking."""
    permission_classes = [IsAuthenticated]

    def patch(self, request, booking_id):
        customer_profile = get_customer_profile(request)
        booking = get_object_or_404(SharedRideBooking, id=booking_id, customer=customer_profile)

        if booking.booking_status in ['completed', 'cancelled']:
            return Response(
                {"error": f"Cannot cancel a booking with status '{booking.booking_status}'"},
                status=status.HTTP_400_BAD_REQUEST
            )
        booking.booking_status = 'cancelled'
        booking.save()
        return Response({"message": "Booking cancelled"}, status=status.HTTP_200_OK)


# ─── Full Ride — Customer requests ───────────────────────────────────────────

class FullRideRequestView(APIView):
    """Customer requests a full private ride."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        customer_profile = get_customer_profile(request)
        serializer = FullRideRequestSerializer(data=request.data)
        if serializer.is_valid():
            ride = serializer.save(customer=customer_profile)
            return Response(FullRideRequestSerializer(ride).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FullRideStatusView(APIView):
    """Customer or driver checks status of a full ride."""
    permission_classes = [IsAuthenticated]

    def get(self, request, ride_id):
        ride = get_object_or_404(FullRideRequest, id=ride_id)
        # Only the requesting customer or assigned driver can view
        customer_profile = None
        try:
            from Customer.models import CustomerProfile
            customer_profile = CustomerProfile.objects.get(user=request.user)
        except Exception:
            pass

        if customer_profile and ride.customer == customer_profile:
            pass  # allowed
        elif hasattr(request.user, 'driver_profile') and hasattr(ride, 'assignment'):
            if ride.assignment.driver.user != request.user:
                return Response({"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)
        elif not request.user.is_staff:
            return Response({"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)

        data = FullRideRequestSerializer(ride).data
        if hasattr(ride, 'assignment'):
            data['assignment'] = FullRideAssignmentSerializer(ride.assignment).data
        return Response(data, status=status.HTTP_200_OK)


class NearbyDriversView(APIView):
    """Customer queries nearby available drivers for a full ride."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        lat = request.query_params.get("lat")
        lng = request.query_params.get("lng")
        vehicle_type = request.query_params.get("vehicle_type", "car")
        radius_km = float(request.query_params.get("radius_km", 5))

        if not lat or not lng:
            return Response({"error": "lat and lng are required"}, status=status.HTTP_400_BAD_REQUEST)

        customer_point = Point(float(lng), float(lat), srid=4326)

        drivers = DriverProfile.objects.filter(
            is_available=True,
            is_online=True,
            verification_status='approved',
            current_location__isnull=False,
            driver_vehicles__vehicle=vehicle_type,
            driver_vehicles__is_verified=True,
            driver_vehicles__is_active='avaliable',
            current_location__distance_lte=(customer_point, D(km=radius_km))
        ).annotate(
            distance=Distance('current_location', customer_point)
        ).order_by('distance').distinct()

        result = []
        for d in drivers:
            result.append({
                "driver_id": d.id,
                "full_name": d.user.full_name,
                "phone": d.user.phone_number,
                "rating": str(d.rating),
                "distance_km": round(d.distance.km, 2),
                "vehicles": DriverVehiclesSerializer(
                    d.driver_vehicles.filter(vehicle=vehicle_type, is_verified=True), many=True
                ).data
            })

        return Response(result, status=status.HTTP_200_OK)


class DriverAcceptRideView(APIView):
    """Driver accepts a full ride request."""
    permission_classes = [IsAuthenticated]

    def post(self, request, ride_id):
        driver_profile = get_driver_profile(request)

        if not driver_profile.is_available or not driver_profile.is_online:
            return Response({"error": "You must be online and available to accept rides"},
                            status=status.HTTP_400_BAD_REQUEST)

        ride = get_object_or_404(FullRideRequest, id=ride_id, status='searching')

        vehicle_id = request.data.get("driver_vehicle")
        if not vehicle_id:
            return Response({"error": "driver_vehicle is required"}, status=status.HTTP_400_BAD_REQUEST)
        vehicle = get_object_or_404(DriverVehicle, id=vehicle_id, driver=driver_profile, is_verified=True)

        # Check no existing assignment
        if FullRideAssignment.objects.filter(ride_request=ride).exists():
            return Response({"error": "Ride already assigned"}, status=status.HTTP_400_BAD_REQUEST)

        assignment = FullRideAssignment.objects.create(
            ride_request=ride,
            driver=driver_profile,
            driver_vehicle=vehicle,
        )
        ride.status = 'driver_assigned'
        ride.save()

        driver_profile.is_available = False
        driver_profile.save()

        return Response(FullRideAssignmentSerializer(assignment).data, status=status.HTTP_201_CREATED)


class DriverUpdateRideStatusView(APIView):
    """Driver marks a full ride as started or completed."""
    permission_classes = [IsAuthenticated]

    def patch(self, request, ride_id):
        driver_profile = get_driver_profile(request)
        assignment = get_object_or_404(FullRideAssignment, ride_request__id=ride_id, driver=driver_profile)
        ride = assignment.ride_request

        new_status = request.data.get("status")
        valid_transitions = {
            'driver_assigned': 'started',
            'started': 'completed',
        }

        if ride.status not in valid_transitions or valid_transitions[ride.status] != new_status:
            return Response(
                {"error": f"Cannot transition from '{ride.status}' to '{new_status}'"},
                status=status.HTTP_400_BAD_REQUEST
            )

        ride.status = new_status
        ride.save()

        if new_status == 'started':
            assignment.started_at = timezone.now()
        elif new_status == 'completed':
            assignment.completed_at = timezone.now()
            assignment.final_price = request.data.get("final_price", ride.estimated_price)
            # Free up driver
            driver_profile.is_available = True
            driver_profile.total_rides_completed += 1
            driver_profile.save()

        assignment.save()
        return Response({"message": f"Ride marked as '{new_status}'"}, status=status.HTTP_200_OK)