from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.contrib.gis.geos import Point
from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.measure import D

from .models import GoodsRideRequest
from .serializers import GoodsRideRequestSerializer


def get_customer_profile(request):
    from Customer.models import CustomerProfile
    return get_object_or_404(CustomerProfile, user=request.user)

def get_driver_profile(request):
    from Driver.models import DriverProfile
    return get_object_or_404(DriverProfile, user=request.user)


class GoodsRideRequestView(APIView):
    """Customer creates a goods transport request."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        customer_profile = get_customer_profile(request)
        serializer = GoodsRideRequestSerializer(data=request.data)
        if serializer.is_valid():
            ride = serializer.save(customer=customer_profile)
            return Response(GoodsRideRequestSerializer(ride).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        """Customer views their goods requests."""
        customer_profile = get_customer_profile(request)
        requests = GoodsRideRequest.objects.filter(customer=customer_profile)
        serializer = GoodsRideRequestSerializer(requests, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class GoodsRideDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, ride_id):
        customer_profile = get_customer_profile(request)
        ride = get_object_or_404(GoodsRideRequest, id=ride_id, customer=customer_profile)
        return Response(GoodsRideRequestSerializer(ride).data, status=status.HTTP_200_OK)

    def patch(self, request, ride_id):
        """Customer cancels a goods request."""
        customer_profile = get_customer_profile(request)
        ride = get_object_or_404(GoodsRideRequest, id=ride_id, customer=customer_profile)
        if ride.status not in ['searching']:
            return Response(
                {"error": f"Cannot cancel a ride with status '{ride.status}'"},
                status=status.HTTP_400_BAD_REQUEST
            )
        ride.status = 'cancelled'
        ride.save()
        return Response({"message": "Goods ride cancelled"}, status=status.HTTP_200_OK)


class NearbyGoodsDriversView(APIView):
    """Customer finds nearby goods drivers available for their required vehicle size."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        lat = request.query_params.get("lat")
        lng = request.query_params.get("lng")
        vehicle_size = request.query_params.get("vehicle_size", "mini_truck")
        radius_km = float(request.query_params.get("radius_km", 10))

        if not lat or not lng:
            return Response({"error": "lat and lng are required"}, status=status.HTTP_400_BAD_REQUEST)

        # Map vehicle_size to Driver VEHICLE_Type choices
        size_map = {'mini_truck': 'loory', 'tempo': 'loory', 'lorry': 'loory'}
        driver_vehicle_type = size_map.get(vehicle_size, 'loory')

        from Driver.models import DriverProfile, DriverVehicle
        customer_point = Point(float(lng), float(lat), srid=4326)

        drivers = DriverProfile.objects.filter(
            is_available=True,
            is_online=True,
            verification_status='approved',
            current_location__isnull=False,
            driver_vehicles__vehicle=driver_vehicle_type,
            driver_vehicles__is_verified=True,
            current_location__distance_lte=(customer_point, D(km=radius_km))
        ).annotate(
            distance=Distance('current_location', customer_point)
        ).order_by('distance').distinct()

        result = [
            {
                "driver_id": d.id,
                "full_name": d.user.full_name,
                "phone": d.user.phone_number,
                "rating": str(d.rating),
                "distance_km": round(d.distance.km, 2),
            }
            for d in drivers
        ]
        return Response(result, status=status.HTTP_200_OK)


class GoodsDriverAcceptView(APIView):
    """Driver accepts a goods ride request."""
    permission_classes = [IsAuthenticated]

    def post(self, request, ride_id):
        driver_profile = get_driver_profile(request)

        if not driver_profile.is_available or not driver_profile.is_online:
            return Response({"error": "You must be online and available"}, status=status.HTTP_400_BAD_REQUEST)

        ride = get_object_or_404(GoodsRideRequest, id=ride_id, status='searching')

        from Driver.models import DriverVehicle
        vehicle_id = request.data.get("driver_vehicle")
        vehicle = get_object_or_404(DriverVehicle, id=vehicle_id, driver=driver_profile, is_verified=True)

        ride.driver = driver_profile
        ride.driver_vehicle = vehicle
        ride.status = 'assigned'
        ride.accepted_at = timezone.now()
        ride.save()

        driver_profile.is_available = False
        driver_profile.save()

        return Response(GoodsRideRequestSerializer(ride).data, status=status.HTTP_200_OK)


class GoodsDriverUpdateStatusView(APIView):
    """Driver updates goods ride status (started / completed)."""
    permission_classes = [IsAuthenticated]

    def patch(self, request, ride_id):
        driver_profile = get_driver_profile(request)
        ride = get_object_or_404(GoodsRideRequest, id=ride_id, driver=driver_profile)

        new_status = request.data.get("status")
        valid_transitions = {
            'assigned': 'started',
            'started': 'completed',
        }

        if ride.status not in valid_transitions or valid_transitions[ride.status] != new_status:
            return Response(
                {"error": f"Cannot move from '{ride.status}' to '{new_status}'"},
                status=status.HTTP_400_BAD_REQUEST
            )

        ride.status = new_status
        if new_status == 'started':
            ride.started_at = timezone.now()
        elif new_status == 'completed':
            ride.completed_at = timezone.now()
            ride.final_price = request.data.get("final_price", ride.estimated_price)
            driver_profile.is_available = True
            driver_profile.total_rides_completed += 1
            driver_profile.save()

        ride.save()
        return Response(GoodsRideRequestSerializer(ride).data, status=status.HTTP_200_OK)
