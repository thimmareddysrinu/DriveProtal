from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.contrib.gis.geos import Point
from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.measure import D
import random

from .models import VehicleOwnerProfile, VehicleRental
from .serializers import VehicleOwnerProfileSerializer,VehicleRentalSerializer


def get_owner_profile(request):
    return get_object_or_404(VehicleOwnerProfile, user=request.user)

def get_customer_profile(request):
    from Customer.models import CustomerProfile
    return get_object_or_404(CustomerProfile, user=request.user)


# ─── Owner Profile ────────────────────────────────────────────────────────────

class VehicleOwnerProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        owner_profile = get_owner_profile(request)
        serializer = VehicleOwnerProfileSerializer(owner_profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        owner_profile = get_owner_profile(request)
        serializer = VehicleOwnerProfileSerializer(owner_profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─── Owner Vehicle CRUD ───────────────────────────────────────────────────────

class VehicleCreationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            owner_profile = VehicleOwnerProfile.objects.get(user=request.user)
        except VehicleOwnerProfile.DoesNotExist:
            return Response({"error": "Owner profile not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = VehicleRentalSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(owner=owner_profile)
            return Response(
                {"message": "Vehicle submitted for admin verification"},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class OwnerVehicleListView(APIView):
    """Owner sees their own vehicles."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        owner_profile = get_owner_profile(request)
        vehicles = VehicleRental.objects.filter(owner=owner_profile)
        serializer = VehicleRentalSerializer(vehicles, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ─── Admin Vehicle Management ─────────────────────────────────────────────────

class VehicleListAdminView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({"error": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)
        data = VehicleRental.objects.all().order_by("created_at")
        serializer = VehicleRentalSerializer(data, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class VehicleDetailsAdminView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, vehicle_id):
        if not request.user.is_staff:
            return Response({"error": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)
        vehicle = get_object_or_404(VehicleRental, id=vehicle_id)
        serializer = VehicleRentalSerializer(vehicle)
        return Response(serializer.data, status=status.HTTP_200_OK)


class VehicleApprovalAdminView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, vehicle_id):
        if not request.user.is_staff:
            return Response({"error": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)

        vehicle = get_object_or_404(VehicleRental, id=vehicle_id)
        action = request.data.get("action")

        if action == "approve":
            vehicle.is_verified = True
            vehicle.is_active = "available"
        elif action == "reject":
            vehicle.is_verified = False
            vehicle.is_active = "unavaliable"
        else:
            return Response({"error": "action must be 'approve' or 'reject'"}, status=status.HTTP_400_BAD_REQUEST)

        vehicle.save()
        return Response({"message": "Admin review updated"}, status=status.HTTP_200_OK)


# # ─── Customer — Browse & Search Rental Vehicles ───────────────────────────────

# class AvailableRentalVehiclesView(APIView):
#     """Customer searches for available rental vehicles near them."""
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         lat = request.query_params.get("lat")
#         lng = request.query_params.get("lng")
#         vehicle_type = request.query_params.get("type")
#         radius_km = float(request.query_params.get("radius_km", 20))

#         vehicles = VehicleRental.objects.filter(
#             is_active='available',
#             is_verified=True,
#         )

#         if vehicle_type:
#             vehicles = vehicles.filter(vehicle=vehicle_type)

#         # Note: VehicleRental doesn't have a location field yet — filtered by owner city for now
#         # (PostGIS location field can be added to VehicleRental in a future migration)

#         serializer = VehicleRentalSerializer(vehicles, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)


# class RentalVehicleDetailView(APIView):
#     """Customer views details of a specific rental vehicle."""
#     permission_classes = [IsAuthenticated]

#     def get(self, request, vehicle_id):
#         vehicle = get_object_or_404(VehicleRental, id=vehicle_id, is_verified=True, is_active='available')
#         serializer = VehicleRentalSerializer(vehicle)
#         return Response(serializer.data, status=status.HTTP_200_OK)


# # ─── Customer — Rental Bookings ───────────────────────────────────────────────

# class RentalBookingView(APIView):
#     """Customer books a rental vehicle."""
#     permission_classes = [IsAuthenticated]

#     def post(self, request, vehicle_id):
#         customer_profile = get_customer_profile(request)

#         # Check driving license
#         if not customer_profile.is_license_verified:
#             return Response(
#                 {"error": "Driving license must be verified before renting a vehicle"},
#                 status=status.HTTP_403_FORBIDDEN
#             )

#         vehicle = get_object_or_404(VehicleRental, id=vehicle_id, is_verified=True, is_active='available')

#         serializer = VehicleRentalBookingSerializer(data=request.data)
#         if serializer.is_valid():
#             booking = serializer.save(
#                 customer=customer_profile,
#                 vehicle=vehicle,
#                 pickup_otp=str(random.randint(100000, 999999)),
#                 return_otp=str(random.randint(100000, 999999)),
#             )
#             # Auto-calculate cost
#             booking.calculate_cost()
#             booking.save()

#             return Response(
#                 VehicleRentalBookingSerializer(booking).data,
#                 status=status.HTTP_201_CREATED
#             )
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# class CustomerRentalBookingListView(APIView):
#     """Customer views their rental bookings."""
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         customer_profile = get_customer_profile(request)
#         bookings = VehicleRentalBooking.objects.filter(customer=customer_profile)
#         serializer = VehicleRentalBookingSerializer(bookings, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)


# class RentalBookingDetailView(APIView):
#     """Customer views a single rental booking."""
#     permission_classes = [IsAuthenticated]

#     def get(self, request, booking_id):
#         customer_profile = get_customer_profile(request)
#         booking = get_object_or_404(VehicleRentalBooking, id=booking_id, customer=customer_profile)
#         serializer = VehicleRentalBookingSerializer(booking)
#         return Response(serializer.data, status=status.HTTP_200_OK)

#     def patch(self, request, booking_id):
#         """Customer cancels booking."""
#         customer_profile = get_customer_profile(request)
#         booking = get_object_or_404(VehicleRentalBooking, id=booking_id, customer=customer_profile)

#         if booking.status not in ['pending', 'confirmed']:
#             return Response(
#                 {"error": f"Cannot cancel booking with status '{booking.status}'"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
#         booking.status = 'cancelled'
#         booking.cancellation_reason = request.data.get("reason", "")
#         booking.save()
#         return Response({"message": "Booking cancelled"}, status=status.HTTP_200_OK)


# # ─── Owner — Manage Bookings ──────────────────────────────────────────────────

# class OwnerBookingsView(APIView):
#     """Owner views all bookings on their vehicles."""
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         owner_profile = get_owner_profile(request)
#         bookings = VehicleRentalBooking.objects.filter(vehicle__owner=owner_profile)
#         serializer = VehicleRentalBookingSerializer(bookings, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)


# class OwnerBookingActionView(APIView):
#     """Owner confirms or rejects a booking; verifies pickup/return OTP."""
#     permission_classes = [IsAuthenticated]

#     def patch(self, request, booking_id):
#         owner_profile = get_owner_profile(request)
#         booking = get_object_or_404(VehicleRentalBooking, id=booking_id, vehicle__owner=owner_profile)

#         action = request.data.get("action")

#         if action == "confirm":
#             if booking.status != 'pending':
#                 return Response({"error": "Booking is not pending"}, status=status.HTTP_400_BAD_REQUEST)
#             booking.status = 'confirmed'

#         elif action == "pickup_verify":
#             otp = request.data.get("otp")
#             if booking.pickup_otp != otp:
#                 return Response({"error": "Invalid pickup OTP"}, status=status.HTTP_400_BAD_REQUEST)
#             booking.status = 'active'
#             booking.vehicle.is_active = 'rented'
#             booking.vehicle.save()

#         elif action == "return_verify":
#             otp = request.data.get("otp")
#             if booking.return_otp != otp:
#                 return Response({"error": "Invalid return OTP"}, status=status.HTTP_400_BAD_REQUEST)
#             booking.status = 'completed'
#             booking.vehicle.is_active = 'available'
#             booking.vehicle.save()

#         elif action == "reject":
#             booking.status = 'cancelled'
#             booking.cancellation_reason = request.data.get("reason", "Rejected by owner")

#         else:
#             return Response(
#                 {"error": "action must be 'confirm', 'pickup_verify', 'return_verify', or 'reject'"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         booking.save()
#         return Response(
#             VehicleRentalBookingSerializer(booking).data,
#             status=status.HTTP_200_OK
#         )
