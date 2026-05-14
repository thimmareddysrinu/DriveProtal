from django.contrib import admin
from .models import VehiclePricingConfig, Ride, RideTaxRecord


@admin.register(VehiclePricingConfig)
class VehiclePricingConfigAdmin(admin.ModelAdmin):
    list_display  = ['vehicle_type', 'ride_mode',  'rate_per_km', 'tax_per_km', 'is_active',"base_fare"]
    list_filter   = ['vehicle_type', 'ride_mode', 'is_active']
    search_fields = ['vehicle_type', 'ride_mode']
    list_editable = ['base_fare', 'rate_per_km', 'tax_per_km', 'is_active']
    ordering      = ['vehicle_type', 'ride_mode']


from django.contrib import admin
from .models import Ride

@admin.register(Ride)
class RideAdmin(admin.ModelAdmin):
    readonly_fields = (
        'status',
        'total_price',
        'start_address',
        'end_address',
        'created_at',
        'customer_name',
        'driver_name',
    )

    def customer_name(self, obj):
        if obj.customer and obj.customer.user:
            return obj.customer.user.phone_number
        return "-"
    customer_name.short_description = "Customer"

    def driver_name(self, obj):
        if obj.driver and obj.driver.user:
            return obj.driver.user.phone_number
        return "-"
    driver_name.short_description = "Driver"
@admin.register(RideTaxRecord)
class RideTaxRecordAdmin(admin.ModelAdmin):
    list_display  = ['id', 'ride', 'tax_amount', 'distance_km', 'tax_per_km', 'settled', 'created_at']
    list_filter   = ['settled']
    list_editable = ['settled']
    search_fields = ['ride__id']
    readonly_fields = ['ride', 'tax_amount', 'distance_km', 'tax_per_km', 'created_at']
    ordering = ['-created_at']
