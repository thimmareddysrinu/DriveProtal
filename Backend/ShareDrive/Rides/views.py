from django.contrib.gis.geos import Point
from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.measure import D
from django.utils import timezone
from datetime import timedelta
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db import transaction
from django.shortcuts import get_object_or_404

from .models import VehiclePricingConfig, Ride
from Driver.models import DriverProfile, DriverVehicle
from .serializers import (
    VehiclePricingConfigSerializer,
    RidePriceEstimateSerializer,
    RideCreateSerializer,
    RideSerializer,
)
from .pricing_agent import estimate_ride_price

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
# # ── Helper: get CustomerProfile from request ──────────────────────────────────


def _get_customer(request):
    from Customer.models import CustomerProfile
    customer, _ = CustomerProfile.objects.get_or_create(user=request.user)
    return customer

# # ── 1. Pricing config list (public) ──────────────────────────────────────────

# class PricingConfigListView(generics.ListAPIView):
#     """
#     GET /rides/pricing-config/
#     Returns all active pricing tiers (publicly accessible).
#     """
#     queryset         = VehiclePricingConfig.objects.filter(is_active=True)
#     serializer_class = VehiclePricingConfigSerializer
#     permission_classes = [AllowAny]


# # ── 2. Price estimate (LangGraph) ─────────────────────────────────────────────

# class EstimatePriceView(APIView):
#     """
#     POST /rides/estimate-price/
#     Runs the LangGraph pricing agent and returns a full price breakdown.
#     Does NOT create any DB record.
#     """
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         serializer = RidePriceEstimateSerializer(data=request.data)
#         if not serializer.is_valid():
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#         d = serializer.validated_data
#         try:
#             pricing = estimate_ride_price(
#                 start_lat    = float(d['start_lat']),
#                 start_lon    = float(d['start_lon']),
#                 end_lat      = float(d['end_lat']),
#                 end_lon      = float(d['end_lon']),
#                 vehicle_type = d['vehicle_type'],
#                 ride_mode    = d['ride_mode'],
#             )
#         except ValueError as exc:
#             return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

#         return Response({
#             'input': {
#                 'vehicle_type':  d['vehicle_type'],
#                 'ride_mode':     d['ride_mode'],
#                 'start_address': d.get('start_address', ''),
#                 'end_address':   d.get('end_address', ''),
#             },
#             'pricing': {
#                 'distance_km':  pricing['distance_km'],
#                 'base_fare':    pricing['base_fare'],
#                 'rate_per_km':  pricing['rate_per_km'],
#                 'ride_price':   pricing['ride_price'],
#                 'tax_per_km':   pricing['tax_per_km'],
#                 'tax_amount':   pricing['tax_amount'],
#                 'total_price':  pricing['total_price'],
#             },
#             'info': (
#                 'total_price = base_fare + (distance × rate_per_km) + (distance × tax_per_km). '
#                 'Shared rides are cheaper because they have a lower rate_per_km.'
#             ),
#         }, status=status.HTTP_200_OK)


# # ── 3. Create ride (confirm booking) ─────────────────────────────────────────

# class RideCreateView(generics.CreateAPIView):
#     """
#     POST /rides/request/
#     Confirms the ride — runs LangGraph agent again and persists the Ride + RideTaxRecord.
#     """
#     serializer_class   = RideCreateSerializer
#     permission_classes = [IsAuthenticated]

#     def perform_create(self, serializer):
#         customer = _get_customer(self.request)
#         serializer.save(customer=customer)

#     def create(self, request, *args, **kwargs):
#         serializer = self.get_serializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         try:
#             self.perform_create(serializer)
#         except ValueError as exc:
#             return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
#         ride = serializer.instance
#         return Response(RideSerializer(ride).data, status=status.HTTP_201_CREATED)


# # ── 4. My rides (customer history) ───────────────────────────────────────────

# class MyRidesView(generics.ListAPIView):
#     """
#     GET /rides/my-rides/
#     Returns the authenticated customer's ride history.
#     """
#     serializer_class   = RideSerializer
#     permission_classes = [IsAuthenticated]

#     def get_queryset(self):
#         customer = _get_customer(self.request)
#         return Ride.objects.filter(customer=customer).order_by('-created_at')


# # ── 5. Cancel a ride ──────────────────────────────────────────────────────────

# class CancelRideView(APIView):
#     """
#     PATCH /rides/<pk>/cancel/
#     Cancels a pending ride for the authenticated customer.
#     """
#     permission_classes = [IsAuthenticated]

#     def patch(self, request, pk):
#         customer = _get_customer(request)
#         try:
#             ride = Ride.objects.get(pk=pk, customer=customer)
#         except Ride.DoesNotExist:
#             return Response({'error': 'Ride not found.'}, status=status.HTTP_404_NOT_FOUND)

#         if ride.status not in ('pending', 'driver_assigned'):
#             return Response(
#                 {'error': f'Cannot cancel a ride with status "{ride.status}".'},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )

#         ride.status = 'cancelled'
#         ride.save(update_fields=['status', 'updated_at'])
#         return Response(RideSerializer(ride).data, status=status.HTTP_200_OK)


class GetAllVehiclesPriceView(APIView):
    """
    POST /rides/search/vehicles/
    Get pricing for all available vehicles (Normal and Shared modes).
    Now with duplicate prevention!
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Validate required fields
        required_fields = ["start_lat", "start_lon", "end_lat", "end_lon"]

        for field in required_fields:
            if field not in request.data:
                return Response(
                    {"error": f"{field} is required."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Parse coordinates and addresses
        try:
            start_lat = float(request.data["start_lat"])
            start_lon = float(request.data["start_lon"])
            end_lat = float(request.data["end_lat"])
            end_lon = float(request.data["end_lon"])

            start_address = request.data.get("start_address", "")
            end_address = request.data.get("end_address", "")

        except (ValueError, TypeError) as e:
            return Response(
                {"error": f"Invalid coordinate format: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get UNIQUE vehicle types only (this prevents duplicates)
        vehicle_types = list(
            VehiclePricingConfig.objects
            .filter(is_active=True)
            .values_list("vehicle_type", flat=True)
            .distinct()  # This ensures uniqueness
        )

        vehicles_data = []
        distance_km = None

        # Track which vehicles we've already added
        added_vehicles = set()

        for vehicle_type in vehicle_types:
            # Skip if we've already added this vehicle type
            if vehicle_type in added_vehicles:
                continue

            vehicle_info = {
                'vehicle_type': vehicle_type,
                'vehicle_name': dict(VehiclePricingConfig.VEHICLE_TYPE_CHOICES).get(
                    vehicle_type, vehicle_type.title()
                ),
            }

            # Get pricing for Normal mode
            try:
                normal_pricing = estimate_ride_price(
                    start_lat=start_lat,
                    start_lon=start_lon,
                    end_lat=end_lat,
                    end_lon=end_lon,
                    vehicle_type=vehicle_type,
                    ride_mode='normal'
                )
                vehicle_info['normal'] = {
                    'distance_km': normal_pricing['distance_km'],
                    'base_fare': float(normal_pricing['base_fare']),
                    'ride_price': float(normal_pricing['ride_price']),
                    'tax_amount': float(normal_pricing['tax_amount']),
                    'total_price': float(normal_pricing['total_price']),
                    'rate_per_km': float(normal_pricing['rate_per_km']),
                    'tax_per_km': float(normal_pricing['tax_per_km']),
                }
                if distance_km is None:
                    distance_km = normal_pricing['distance_km']
            except ValueError as e:
                vehicle_info['normal'] = {'error': str(e)}

            # Get pricing for Shared mode
            try:
                shared_pricing = estimate_ride_price(
                    start_lat=start_lat,
                    start_lon=start_lon,
                    end_lat=end_lat,
                    end_lon=end_lon,
                    vehicle_type=vehicle_type,
                    ride_mode='shared'
                )
                vehicle_info['shared'] = {
                    'distance_km': shared_pricing['distance_km'],
                    'base_fare': float(shared_pricing['base_fare']),
                    'ride_price': float(shared_pricing['ride_price']),
                    'tax_amount': float(shared_pricing['tax_amount']),
                    'total_price': float(shared_pricing['total_price']),
                    'rate_per_km': float(shared_pricing['rate_per_km']),
                    'tax_per_km': float(shared_pricing['tax_per_km']),
                }
            except ValueError as e:
                vehicle_info['shared'] = {'error': str(e)}

            vehicles_data.append(vehicle_info)
            added_vehicles.add(vehicle_type)  # Mark as added

        return Response({
            'success': True,
            'distance_km': distance_km,
            'start_address': start_address,
            'end_address': end_address,
            'vehicles': vehicles_data
        }, status=status.HTTP_200_OK)


class RideProccessingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = RideCreateSerializer(
            data=request.data,
            context={'request': request}
        )

        if serializer.is_valid():
            ride = serializer.save()
            self.notify_avaliable_drivers(ride)
            return Response({"ride": RideSerializer(ride).data}, status=201)

        return Response(serializer.errors, status=400)

    def notify_avaliable_drivers(self, ride):
        channel_layer = get_channel_layer()
        # Extract pickup coordinates from the ride
        pickup_lat = ride.start_lat
        pickup_lng = ride.start_lon

        # Build GIS point (lon, lat)
        pickup_point = Point(float(pickup_lng), float(pickup_lat), srid=4326)

        # Determine requested vehicle type (FullRideRequest field)
        vehicle_type = getattr(ride, "vehicle_type_requested", None) or getattr(
            ride, "vehicle_type", None)
        print("Requested vehicle type =>", vehicle_type)

        print("Matching vehicles =>",
              DriverVehicle.objects.filter(
                  vehicle__iexact=vehicle_type,
                  is_active='available',
                  is_verified=True
              ))

        print("All drivers =>", DriverProfile.objects.values(
            'id',
            'is_online',
            'is_available',
            'current_location'
        ))

        # Find driver IDs that own an active, verified vehicle of this type

        matching_driver_ids = DriverVehicle.objects.filter(
            vehicle__iexact=vehicle_type,
            is_active='available',
            is_verified=True,
        ).values_list('driver_id', flat=True)

        nearby_drivers = DriverProfile.objects.filter(
            id__in=matching_driver_ids,
            is_online=True,
            is_available=True,
            verification_status='approved',
            driver_ride_status='free',
            current_location__isnull=False,
            current_location__distance_lte=(pickup_point, D(km=5))
        )
        print("Pickup point:", pickup_point)
        print("Pickup lat/lng:", pickup_lat, pickup_lng)
        print("Nearby drivers count:", nearby_drivers.count())
        print("Nearby drivers:", [
              driver.user.phone_number for driver in nearby_drivers])
        driver_data = {
            "type": "ride_request",
            "ride_id": ride.id,
            "pickup": ride.start_address,
            "drop": ride.end_address,
            "vehicle_type": ride.vehicle_type,
            "ride_mode": ride.ride_mode,
            "status": ride.status,
            "customer_name": getattr(ride.customer.user, "full_name", "") or getattr(ride.customer.user, "name", ""),
            "customer_phone": getattr(ride.customer.user, "phone_number", ""),
            "distance_km": float(ride.distance_km),
            "price_breakdown": {
                "base_fare": float(ride.base_fare),
                "ride_price": float(ride.ride_price),
                "tax_amount": float(ride.tax_amount),
                "total_price": float(ride.total_price),
                "driver_earnings": float(ride.ride_price * 0.8),
            },
            "expires_in": 900,
        }
        for driver in nearby_drivers:
            group_name = f"driver_{driver.user.id}"
            print("Sending to group:", group_name)
            async_to_sync(channel_layer.group_send)(group_name, driver_data)


class RideAcceptedView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        print("\n========== RIDE ACCEPT API START ==========")
        print("request.data =>", request.data)
        print("request.user =>", request.user, "| id =>",
              getattr(request.user, "id", None))

        ride_id = request.data.get("ride_id")
        print("ride_id raw =>", ride_id, "| type =>", type(ride_id))

        if isinstance(ride_id, dict):
            ride_id = ride_id.get("ride_id")
            print("ride_id extracted from nested dict =>", ride_id)

        if ride_id in [None, ""]:
            print("❌ FAILED: ride_id missing in request")
            return Response(
                {
                    "success": False,
                    "error": "ride_id is required.",
                    "stage": "request_validation"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            ride_id = int(ride_id)
            print("✅ Parsed ride_id =>", ride_id)
        except (TypeError, ValueError) as e:
            print("❌ FAILED: invalid ride_id format =>", str(e))
            return Response(
                {
                    "success": False,
                    "error": "ride_id must be a valid integer.",
                    "stage": "request_validation"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            driver_profile = request.user.driver_profile
            print("✅ driver_profile found =>", driver_profile.id)
        except Exception as e:
            print("❌ FAILED: driver profile not found =>", str(e))
            return Response(
                {
                    "success": False,
                    "error": "Driver profile not found for this user.",
                    "stage": "driver_profile_lookup"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                print("🔒 Transaction started")

                ride = Ride.objects.select_for_update().filter(id=ride_id).first()
                print("ride =>", ride)

                if not ride:
                    print("❌ FAILED: ride not found for id =>", ride_id)
                    return Response(
                        {
                            "success": False,
                            "error": "Ride not found.",
                            "stage": "ride_lookup"
                        },
                        status=status.HTTP_404_NOT_FOUND
                    )

                print("ride.status =>", ride.status)

                if ride.status != "pending_driver_confirmation":
                    print("❌ FAILED: ride not available for acceptance")
                    return Response(
                        {
                            "success": False,
                            "error": f"Ride is not available for acceptance. Current status: {ride.status}",
                            "stage": "ride_status_check"
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )

                driver_vehicle = DriverVehicle.objects.filter(
                    driver=driver_profile,
                    is_active='available'
                ).first()

                print("driver_vehicle query result =>", driver_vehicle)

                if not driver_vehicle:
                    print(
                        "❌ FAILED: no available vehicle found for driver =>", driver_profile.id)
                    return Response(
                        {
                            "success": False,
                            "error": "No available vehicle found for this driver.",
                            "stage": "driver_vehicle_lookup"
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )

                print("✅ vehicle found =>", driver_vehicle.id)

                if hasattr(driver_vehicle, "driver") and driver_vehicle.driver != driver_profile:
                    print("❌ FAILED: vehicle does not belong to this driver")
                    return Response(
                        {
                            "success": False,
                            "error": "Selected vehicle does not belong to this driver.",
                            "stage": "driver_vehicle_validation"
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # Update ride
                ride.driver = driver_profile
                ride.driver_vehicle = driver_vehicle
                ride.status = 'driver_assigned'
                ride.driver_accepted_at = timezone.now()
                ride.save(update_fields=[
                          'driver', 'driver_vehicle', 'status', 'driver_accepted_at'])

                # Update driver status
                driver_profile.driver_ride_status = 'onride'
                driver_profile.save(update_fields=['driver_ride_status'])

                print(
                    "💾 Saving ride with values =>",
                    {
                        "ride_id": ride.id,
                        "driver_id": ride.driver.id if ride.driver else None,
                        "driver_vehicle_id": ride.driver_vehicle.id if ride.driver_vehicle else None,
                        "status": ride.status,
                        "driver_accepted_at": ride.driver_accepted_at,
                    }
                )

                # Prepare response data
                response_data = {
                    "success": True,
                    "message": "Ride accepted successfully.",
                    "ride": {
                        "id": ride.id,
                        "status": ride.status,
                        "status_display": ride.get_status_display() if hasattr(ride, 'get_status_display') else ride.status,
                        "total_price": str(ride.total_price),
                        "vehicle_type": ride.vehicle_type,
                        "vehicle_type_display": ride.get_vehicle_type_display() if hasattr(ride, 'get_vehicle_type_display') else ride.vehicle_type,
                        "ride_mode": ride.ride_mode,
                        "pickup_address": ride.start_address,
                        "drop_address": ride.end_address,
                    },
                    "driver": {
                        "id": driver_profile.id,
                        "full_name": driver_profile.full_name if hasattr(driver_profile, 'full_name') else "",
                        "phone_number": driver_profile.user.phone_number if hasattr(driver_profile.user, 'phone_number') else "",
                        "name": driver_profile.full_name if hasattr(driver_profile, 'full_name') else "",
                    },
                    "driver_vehicle": {
                        "id": driver_vehicle.id,
                        "registration_number": driver_vehicle.registration_number,
                        "brand": driver_vehicle.brand if hasattr(driver_vehicle, 'brand') else "",
                        "vehicle_model": driver_vehicle.vehiclemodel if hasattr(driver_vehicle, 'vehiclemodel') else "",
                        "vehicle_front": request.build_absolute_uri(driver_vehicle.vehicle_front.url) if getattr(driver_vehicle, "vehicle_front", None) else None,
                    }
                }

                # ✅ Send WebSocket notification to customer
                try:
                    channel_layer = get_channel_layer()
                    customer_group = f"customer_{ride.customer.id}"

                    print(
                        f"📡 Sending WebSocket notification to customer group: {customer_group}")

                    async_to_sync(channel_layer.group_send)(
                        customer_group,
                        {
                            'type': 'ride_accepted',
                            'message': 'Driver has accepted your ride!',
                            'ride': response_data['ride'],
                            'driver': response_data['driver'],
                            'driver_vehicle': response_data['driver_vehicle'],
                        }
                    )

                    print(
                        f"✅ WebSocket notification sent successfully to customer {ride.customer.id}")
                except Exception as ws_error:
                    print(
                        f"⚠️ WebSocket notification failed (non-critical): {ws_error}")
                    # Don't fail the request if WebSocket fails

                print("✅ SUCCESS: ride accepted successfully")
                print("========== RIDE ACCEPT API END ==========\n")

                return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            print("❌ EXCEPTION in RideAcceptedView =>", str(e))
            print("========== RIDE ACCEPT API END WITH ERROR ==========\n")
            return Response(
                {
                    "success": False,
                    "error": "Something went wrong while accepting the ride.",
                    "details": str(e),
                    "stage": "unexpected_exception"
                },
                status=status.HTTP_400_BAD_REQUEST
            )


class RideStatusAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, ride_id, format=None):
        customer = _get_customer(request)

        ride = get_object_or_404(
            Ride,
            id=ride_id,
            customer=customer
        )

        driver_data = None
        vehicle_data = None

        if ride.driver:
            driver_data = {
                "id": ride.driver.id,
                "full_name": getattr(ride.driver.user, "full_name", None) or getattr(ride.driver.user, "name", None),
                "phone_number": getattr(ride.driver.user, "phone_number", None),
                "name": getattr(ride.driver.user, "name", None),
            }

        if ride.driver_vehicle:
            vehicle_data = {
                "id": ride.driver_vehicle.id,
                "registration_number": ride.driver_vehicle.registration_number,
                "brand": ride.driver_vehicle.brand,
                "vehicle_model": ride.driver_vehicle.vehiclemodel,
            }

        passenger_data = None
        if ride.passenger:
            passenger_data = {
                "id": ride.passenger.id,
                "full_name": ride.passenger.full_name,
                "phone_number": ride.passenger.phone_number,
                "relationship": ride.passenger.relationship,
            }

        return Response({
            "success": True,
            "ride": {
                "id": ride.id,
                "status": ride.status,
                "status_display": ride.get_status_display() if hasattr(ride, "get_status_display") else ride.status,
                "total_price": str(ride.total_price),
                "vehicle_type": ride.vehicle_type,
                "vehicle_type_display": getattr(ride, "get_vehicle_type_display", lambda: ride.vehicle_type)(),
                "pickup_address": ride.start_address,
                "drop_address": ride.end_address,
                "ride_mode": ride.ride_mode,
                "booking_for": ride.booking_for,
            },
            "passenger": passenger_data,
            "driver": driver_data,
            "driver_vehicle": vehicle_data,
        }, status=status.HTTP_200_OK)
