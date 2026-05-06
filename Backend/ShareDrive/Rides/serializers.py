from rest_framework import serializers
from .models import VehiclePricingConfig, Ride, RideTaxRecord


class VehiclePricingConfigSerializer(serializers.ModelSerializer):
    vehicle_type_display = serializers.CharField(source='get_vehicle_type_display', read_only=True)
    ride_mode_display    = serializers.CharField(source='get_ride_mode_display',    read_only=True)

    class Meta:
        model  = VehiclePricingConfig
        fields = [
            'id', 'vehicle_type', 'vehicle_type_display',
            'ride_mode', 'ride_mode_display',
            'base_fare', 'rate_per_km', 'tax_per_km',
            'is_active',
        ]


# ── Price estimate (input only) ───────────────────────────────────────────────

VEHICLE_TYPE_CHOICES = [c[0] for c in VehiclePricingConfig.VEHICLE_TYPE_CHOICES]
RIDE_MODE_CHOICES    = [c[0] for c in VehiclePricingConfig.RIDE_MODE_CHOICES]


class RidePriceEstimateSerializer(serializers.Serializer):
    """Input payload for POST /rides/estimate-price/"""
    start_lat    = serializers.DecimalField(max_digits=9, decimal_places=6)
    start_lon    = serializers.DecimalField(max_digits=9, decimal_places=6)
    end_lat      = serializers.DecimalField(max_digits=9, decimal_places=6)
    end_lon      = serializers.DecimalField(max_digits=9, decimal_places=6)
    vehicle_type = serializers.ChoiceField(choices=VEHICLE_TYPE_CHOICES)
    ride_mode    = serializers.ChoiceField(choices=RIDE_MODE_CHOICES)
    start_address = serializers.CharField(max_length=255, required=False, default='')
    end_address   = serializers.CharField(max_length=255, required=False, default='')


# ── Ride create / detail ──────────────────────────────────────────────────────

class RideCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Ride
        fields = [
            'start_lat', 'start_lon', 'end_lat', 'end_lon',
            'start_address', 'end_address',
            'vehicle_type', 'ride_mode',
        ]

    def create(self, validated_data):
        from django.contrib.gis.geos import Point
        from .pricing_agent import estimate_ride_price
        from .models import RideTaxRecord


              # Get authenticated user from request context
        request = self.context.get('request')
        customer = request.user if request and request.user.is_authenticated else None
        # Run LangGraph agent
        pricing = estimate_ride_price(
            start_lat    = float(validated_data['start_lat']),
            start_lon    = float(validated_data['start_lon']),
            end_lat      = float(validated_data['end_lat']),
            end_lon      = float(validated_data['end_lon']),
            vehicle_type = validated_data['vehicle_type'],
            ride_mode    = validated_data['ride_mode'],
        )

        # Build GIS points
        start_point = Point(float(validated_data['start_lon']), float(validated_data['start_lat']), srid=4326)
        end_point   = Point(float(validated_data['end_lon']),   float(validated_data['end_lat']),   srid=4326)
        start_address = validated_data['start_address']
        end_address = validated_data['end_address']

        ride = Ride.objects.create(
            **validated_data,
            customer=customer,
            start_point  = start_point,
            end_point    = end_point,
           
            distance_km  = pricing['distance_km'],
            base_fare    = pricing['base_fare'],
            ride_price   = pricing['ride_price'],
            tax_amount   = pricing['tax_amount'],
            total_price  = pricing['total_price'],
        )

        # Create tax ledger entry
        RideTaxRecord.objects.create(
            ride        = ride,
            tax_amount  = pricing['tax_amount'],
            distance_km = pricing['distance_km'],
            tax_per_km  = pricing['tax_per_km'],
        )

        return ride


class RideSerializer(serializers.ModelSerializer):
    vehicle_type_display = serializers.CharField(source='get_vehicle_type_display', read_only=True)
    ride_mode_display    = serializers.CharField(source='get_ride_mode_display',    read_only=True)
    status_display       = serializers.CharField(source='get_status_display',       read_only=True)

    class Meta:
        model  = Ride
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
        model  = RideTaxRecord
        fields = ['id', 'ride', 'tax_amount', 'distance_km', 'tax_per_km', 'settled', 'created_at']
