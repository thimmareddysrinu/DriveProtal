from rest_framework import serializers
from .models import VehicleOwnerProfile, VehicleRental


class VehicleOwnerProfileSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField(source='user.phone_number', read_only=True)
    full_name = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model = VehicleOwnerProfile
        fields = "__all__"
        read_only_fields = ['total_vehicles', 'verified', 'total_earnings', 'user']


class VehicleRentalSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.user.full_name', read_only=True)

    class Meta:
        model = VehicleRental
        fields = "__all__"
        read_only_fields = ["owner", "is_verified", "created_at", "updated_at"]


# class VehicleRentalBookingSerializer(serializers.ModelSerializer):
#     vehicle_info = VehicleRentalSerializer(source='vehicle', read_only=True)
#     customer_name = serializers.CharField(source='customer.user.full_name', read_only=True)
#     customer_phone = serializers.CharField(source='customer.user.phone_number', read_only=True)

#     class Meta:
#         model = VehicleRentalBooking
#         fields = [
#             'id', 'vehicle', 'vehicle_info',
#             'customer', 'customer_name', 'customer_phone',
#             'rental_type', 'start_datetime', 'end_datetime',
#             'total_cost', 'security_deposit', 'security_deposit_paid',
#             'pickup_otp', 'return_otp',
#             'status', 'payment_status',
#             'customer_notes', 'cancellation_reason',
#             'created_at',
#         ]
#         read_only_fields = [
#             'customer', 'total_cost', 'security_deposit',
#             'pickup_otp', 'return_otp',
#             'status', 'payment_status', 'created_at',
#         ]
