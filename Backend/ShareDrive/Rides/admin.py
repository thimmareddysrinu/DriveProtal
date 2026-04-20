from django.contrib import admin
from .models import VehiclePricingConfig, Ride, RideTaxRecord


@admin.register(VehiclePricingConfig)
class VehiclePricingConfigAdmin(admin.ModelAdmin):
    list_display  = ['vehicle_type', 'ride_mode',  'rate_per_km', 'tax_per_km', 'is_active',"base_fare"]
    list_filter   = ['vehicle_type', 'ride_mode', 'is_active']
    search_fields = ['vehicle_type', 'ride_mode']
    list_editable = ['base_fare', 'rate_per_km', 'tax_per_km', 'is_active']
    ordering      = ['vehicle_type', 'ride_mode']


@admin.register(Ride)
class RideAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'customer', 'vehicle_type', 'ride_mode',
        'distance_km', 'base_fare', 'ride_price', 'tax_amount', 'total_price',
        'status', 'created_at',
    ]
    list_filter   = ['vehicle_type', 'ride_mode', 'status']
    search_fields = ['customer__user__phone_number', 'start_address', 'end_address']
    readonly_fields = [
        'distance_km', 'base_fare', 'ride_price', 'tax_amount', 'total_price',
        'start_point', 'end_point', 'created_at', 'updated_at',
    ]
    ordering = ['-created_at']

    fieldsets = (
        ('Customer & Driver', {
            'fields': ('customer', 'driver_vehicle')
        }),
        ('Trip Details', {
            'fields': (
                'vehicle_type', 'ride_mode', 'status',
                'start_lat', 'start_lon', 'start_address', 'start_point',
                'end_lat',   'end_lon',   'end_address',   'end_point',
            )
        }),
        ('Pricing Breakdown', {
            'fields': ('distance_km', 'base_fare', 'ride_price', 'tax_amount', 'total_price')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(RideTaxRecord)
class RideTaxRecordAdmin(admin.ModelAdmin):
    list_display  = ['id', 'ride', 'tax_amount', 'distance_km', 'tax_per_km', 'settled', 'created_at']
    list_filter   = ['settled']
    list_editable = ['settled']
    search_fields = ['ride__id']
    readonly_fields = ['ride', 'tax_amount', 'distance_km', 'tax_per_km', 'created_at']
    ordering = ['-created_at']
