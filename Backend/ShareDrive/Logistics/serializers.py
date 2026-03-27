from rest_framework import serializers
from .models import GoodsRideRequest


class GoodsRideRequestSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.user.full_name', read_only=True)
    customer_phone = serializers.CharField(source='customer.user.phone_number', read_only=True)
    driver_name = serializers.CharField(source='driver.user.full_name', read_only=True, allow_null=True)
    driver_phone = serializers.CharField(source='driver.user.phone_number', read_only=True, allow_null=True)

    class Meta:
        model = GoodsRideRequest
        fields = [
            'id',
            'customer', 'customer_name', 'customer_phone',
            'driver', 'driver_name', 'driver_phone',
            'driver_vehicle',
            'pickup_point', 'drop_point',
            'pickup_address', 'drop_address',
            'goods_type', 'estimated_weight_kg', 'goods_description',
            'vehicle_size_required',
            'estimated_price', 'final_price',
            'status',
            'requested_at', 'accepted_at', 'started_at', 'completed_at',
        ]
        read_only_fields = [
            'customer', 'driver', 'driver_vehicle',
            'estimated_price', 'final_price',
            'status',
            'requested_at', 'accepted_at', 'started_at', 'completed_at',
        ]
