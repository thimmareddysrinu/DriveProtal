from rest_framework import serializers
from .models import DriverProfile, DriverVehicle, SharedRideRoute, SharedRideBooking, FullRideRequest, FullRideAssignment


class DriverProfileSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField(source='user.phone_number', read_only=True)
   
    
    class Meta:
        model = DriverProfile
        fields = [
            'id', 'phone_number', 'full_name', 'license_number', 'license_expiry',
            'license_image', 'verification_status', 'aadhar_number','aadhar_image', 'pan_number',
            "pan_image",
            'is_available', 'is_online',
            'total_rides_completed', 'rating', 'total_earnings',
            'bank_account_number', 'bank_ifsc', 'created_at', 'updated_at'
        ]
        read_only_fields = ['verification_status', 'total_rides_completed', 'rating', 'total_earnings']


class DriverVehiclesSerializer(serializers.ModelSerializer):
    class Meta:
        model = DriverVehicle
        fields = '__all__'
        read_only_fields = ['driver', 'is_verified', 'created_at', 'updated_at']



class DriverVehicleNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = DriverVehicle
        fields ='__all__'


class DriverAdminListSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField(source='user.phone_number', read_only=True)
    

    class Meta:
        model = DriverProfile
        fields = '__all__'


class DriverAdminDetailSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField(source='user.phone_number', read_only=True)
    vehicles = DriverVehicleNestedSerializer(many=True, read_only=True)
    class Meta:
        model = DriverProfile
        fields = [
            'id',
            'phone_number',
            'full_name',
            'license_number',
            'license_expiry',
            'license_image',
            'verification_status',
            'aadhar_number',
            'aadhar_image',
            'pan_number',
            'pan_image',
            'bank_account_number',
            'bank_ifsc',
            'is_available',
            'is_online',
            'total_rides_completed',
            'rating',
            'total_earnings',
            'created_at',
            'updated_at',
            'vehicles',
        ]
# ─── Shared Ride ─────────────────────────────────────────────────────────────

class SharedRideRouteSerializer(serializers.ModelSerializer):
    seats_available = serializers.IntegerField(read_only=True)
    seats_booked_count = serializers.IntegerField(source='seats_booked', read_only=True)
    driver_name = serializers.CharField(source='driver_vehicle.driver.user.full_name', read_only=True)
    driver_phone = serializers.CharField(source='driver_vehicle.driver.user.phone_number', read_only=True)
    vehicle_brand = serializers.CharField(source='driver_vehicle.brand', read_only=True)
    vehicle_model = serializers.CharField(source='driver_vehicle.vehiclemodel', read_only=True)

    class Meta:
        model = SharedRideRoute
        fields = [
            'id', 'driver_vehicle', 'driver_name', 'driver_phone',
            'vehicle_brand', 'vehicle_model',
            'origin_name', 'destination_name',
            'origin_point', 'destination_point',
            'departure_time', 'available_seats', 'seats_booked_count', 'seats_available',
            'price_per_seat', 'status', 'created_at',
        ]
        read_only_fields = ['status', 'created_at']


class SharedRideBookingSerializer(serializers.ModelSerializer):
    route_info = SharedRideRouteSerializer(source='route', read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = SharedRideBooking
        fields = [
            'id', 'route', 'route_info', 'customer',
            'seats_booked', 'total_price',
            'booking_status', 'payment_status',
            'pickup_address', 'pickup_point',
            'notes', 'created_at',
        ]
        read_only_fields = ['customer', 'total_price', 'booking_status', 'payment_status', 'created_at']


# ─── Full Ride ────────────────────────────────────────────────────────────────

class FullRideRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = FullRideRequest
        fields = [
            'id', 'customer',
            'pickup_point', 'drop_point',
            'pickup_address', 'drop_address',
            'vehicle_type_requested',
            'status', 'estimated_price', 'requested_at',
        ]
        read_only_fields = ['customer', 'status', 'estimated_price', 'requested_at']


class FullRideAssignmentSerializer(serializers.ModelSerializer):
    driver_name = serializers.CharField(source='driver.user.full_name', read_only=True)
    driver_phone = serializers.CharField(source='driver.user.phone_number', read_only=True)
    vehicle_brand = serializers.CharField(source='driver_vehicle.brand', read_only=True)
    vehicle_model = serializers.CharField(source='driver_vehicle.vehiclemodel', read_only=True)
    vehicle_number = serializers.CharField(source='driver_vehicle.registration_number', read_only=True)

    class Meta:
        model = FullRideAssignment
        fields = [
            'id', 'ride_request',
            'driver', 'driver_name', 'driver_phone',
            'driver_vehicle', 'vehicle_brand', 'vehicle_model', 'vehicle_number',
            'accepted_at', 'started_at', 'completed_at', 'final_price',
        ]
        read_only_fields = ['driver', 'driver_vehicle', 'accepted_at']
