from django.contrib.gis.geos import Point
from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.measure import D
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import VehiclePricingConfig, Ride
from Driver.models import DriverProfile
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
    return CustomerProfile.objects.get(user=request.user)


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
            data=request.data, context={'request': request}
        )

        if serializer.is_valid():
            ride = serializer.save()
            self.notify_avaliable_drivers(ride)
            return Response({"ride": RideSerializer(ride).data}, status=201)

        return Response(serializer.errors, status=400)

    def notify_avaliable_drivers(self, ride):
        channel_layer = get_channel_layer()

        # Get pickup coordinates from ride (adjust field names to match your model)
        pickup_lng = ride.start_lat  # or ride.start_longitude
        pickup_lat = ride.start_lon   # or ride.start_latitude

        # Create pickup point as (longitude, latitude) = (x, y)
        pickup_point = Point(float(pickup_lng), float(pickup_lat), srid=4326)

        nearby_drivers = DriverProfile.objects.filter(
            is_online=True,
            is_available=True,
            current_location__isnull=False,
            current_location__distance_lte=(pickup_point, D(km=5))
        )

        print("Pickup point:", pickup_point)
        print("Pickup lat/lng:", pickup_lat, pickup_lng)
        print("Nearby drivers count:", nearby_drivers.count())

        driver_data = {
            "type": "ride_request",
            "ride_id": ride.id,
            "pickup": ride.start_address,
            "drop": ride.end_address,
            "vehicle_type": ride.vehicle_type,
            "ride_mode": ride.ride_mode,
            "customer_name": ride.customer.first_name,
            "customer_phone": ride.customer.phone_number,
            "distance_km": float(ride.distance_km),
            "price_breakdown": {
                "base_fare": float(ride.base_fare),
                "ride_price": float(ride.ride_price),
                "tax_amount": float(ride.tax_amount),
                "total_price": float(ride.total_price),
                "driver_earnings": float(ride.ride_price * 0.8),
            },
            "expires_in": 90,
        }

        for driver in nearby_drivers:
            group_name = f"driver_{driver.user.id}"
            print("Sending to group:", group_name)
            async_to_sync(channel_layer.group_send)(group_name, driver_data)
# class RideAcceptedView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         # Validate required fields


#         return Response(
#             {
#                 "message": "Ride Accepted By Driver suCCesfully",

#             }
#         )
