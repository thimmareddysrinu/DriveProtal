from Rides.pricing_agent import estimate_ride_price
from Customer.models import CustomerPassenger, CustomerProfile
from .models import Ride
from rest_framework import serializers
from .models import VehiclePricingConfig, Ride, RideTaxRecord


class VehiclePricingConfigSerializer(serializers.ModelSerializer):
    vehicle_type_display = serializers.CharField(
        source='get_vehicle_type_display', read_only=True)
    ride_mode_display = serializers.CharField(
        source='get_ride_mode_display',    read_only=True)

    class Meta:
        model = VehiclePricingConfig
        fields = [
            'id', 'vehicle_type', 'vehicle_type_display',
            'ride_mode', 'ride_mode_display',
            'base_fare', 'rate_per_km', 'tax_per_km',
            'is_active',
        ]


# ── Price estimate (input only) ───────────────────────────────────────────────

VEHICLE_TYPE_CHOICES = [c[0]
                        for c in VehiclePricingConfig.VEHICLE_TYPE_CHOICES]
RIDE_MODE_CHOICES = [c[0] for c in VehiclePricingConfig.RIDE_MODE_CHOICES]


class RidePriceEstimateSerializer(serializers.Serializer):
    """Input payload for POST /rides/estimate-price/"""
    start_lat = serializers.DecimalField(max_digits=9, decimal_places=6)
    start_lon = serializers.DecimalField(max_digits=9, decimal_places=6)
    end_lat = serializers.DecimalField(max_digits=9, decimal_places=6)
    end_lon = serializers.DecimalField(max_digits=9, decimal_places=6)
    vehicle_type = serializers.ChoiceField(choices=VEHICLE_TYPE_CHOICES)
    ride_mode = serializers.ChoiceField(choices=RIDE_MODE_CHOICES)
    start_address = serializers.CharField(
        max_length=255, required=False, default='')
    end_address = serializers.CharField(
        max_length=255, required=False, default='')


# ── Ride create / detail ──────────────────────────────────────────────────────

# rides/serializers.py

ACTIVE_RIDE_STATUSES = [
    'pending_driver_confirmation',
    'driver_assigned',
    'driver_arrived',
    'ongoing',
]


class RideCreateSerializer(serializers.ModelSerializer):
    passenger_id = serializers.IntegerField(required=False, allow_null=True)
    booking_for = serializers.ChoiceField(
        choices=[('self', 'Self'), ('friend', 'Friend'),
                 ('family', 'Family'), ('other', 'Other')],
        default='self'
    )

    class Meta:
        model = Ride
        fields = [
            'start_address', 'end_address',
            'start_lat', 'start_lon', 'end_lat', 'end_lon',
            'vehicle_type', 'ride_mode',
            'booking_for', 'passenger_id',
        ]

    def validate(self, attrs):
        request = self.context['request']
        customer, _ = CustomerProfile.objects.get_or_create(user=request.user)

        booking_for = attrs.get('booking_for', 'self')
        passenger_id = attrs.get('passenger_id')

        if customer.is_blocked:
            raise serializers.ValidationError("Your account is blocked.")

        if booking_for == 'self':
            if Ride.objects.filter(
                customer=customer,
                booking_for='self',
                status__in=ACTIVE_RIDE_STATUSES
            ).exists():
                raise serializers.ValidationError(
                    "You already have an active ride. Complete or cancel it before booking a new one."
                )

        else:
            if not passenger_id:
                raise serializers.ValidationError(
                    {"passenger_id": "Passenger is required when booking for someone else."}
                )

            passenger = CustomerPassenger.objects.filter(
                id=passenger_id,
                customer=customer,
                is_active=True
            ).first()

            if not passenger:
                raise serializers.ValidationError(
                    {"passenger_id": "Invalid passenger selected."}
                )

            attrs['passenger'] = passenger

        return attrs

    def create(self, validated_data):
     request = self.context['request']
     customer, _ = CustomerProfile.objects.get_or_create(user=request.user)

     passenger = validated_data.pop('passenger', None)
     validated_data.pop('passenger_id', None)

     pricing = estimate_ride_price(
        start_lat=float(validated_data['start_lat']),
        start_lon=float(validated_data['start_lon']),
        end_lat=float(validated_data['end_lat']),
        end_lon=float(validated_data['end_lon']),
        vehicle_type=validated_data['vehicle_type'],
        ride_mode=validated_data['ride_mode'],
    )

     print("==== PRICING DEBUG ====")
     print("validated_data =", validated_data)
     print("pricing =", pricing)

     ride = Ride.objects.create(
        customer=customer,
        passenger=passenger,
        distance_km=pricing['distance_km'],
        base_fare=pricing['base_fare'],
        ride_price=pricing['ride_price'],
        tax_amount=pricing['tax_amount'],
        total_price=pricing['total_price'],
        **validated_data
    )

     print("==== SAVED RIDE VALUES ====")
     print("ride.id =", ride.id)
     print("distance_km =", ride.distance_km)
     print("base_fare =", ride.base_fare)
     print("ride_price =", ride.ride_price)
     print("tax_amount =", ride.tax_amount)
     print("total_price =", ride.total_price)

     return ride

class RideSerializer(serializers.ModelSerializer):
    vehicle_type_display = serializers.CharField(
        source='get_vehicle_type_display', read_only=True)
    ride_mode_display = serializers.CharField(
        source='get_ride_mode_display',    read_only=True)
    status_display = serializers.CharField(
        source='get_status_display',       read_only=True)

    class Meta:
        model = Ride
        fields = [
            'id', 'vehicle_type', 'vehicle_type_display',
            'ride_mode', 'ride_mode_display',
            'start_lat', 'start_lon', 'end_lat', 'end_lon',
            'start_address', 'end_address',
            'distance_km', 'base_fare', 'ride_price',
            'tax_amount', 'total_price',
            'status', 'status_display',
            'created_at',
        ]


class RideTaxRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = RideTaxRecord
        fields = ['id', 'ride', 'tax_amount', 'distance_km',
                  'tax_per_km', 'settled', 'created_at']
