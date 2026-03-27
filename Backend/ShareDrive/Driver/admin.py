from django.contrib import admin
from .models import DriverProfile,DriverVehicle


class DriverAdmin(admin.ModelAdmin):
    list_display = [
        "user",
        "license_number",
        "license_expiry",
        "verification_status",
        "is_available",
        "is_online",
        "created_at",
        
    ]

    list_filter = [
        "verification_status",
        "is_available",
        "is_online"
    ]

    search_fields = [
        "user__phone_number",
        "license_number",
        "aadhar_number",
        "pan_number"
    ]

    ordering = ["-created_at"]


admin.site.register(DriverProfile, DriverAdmin)
class DriverVehicleAdmin(admin.ModelAdmin):
    list_display = [
        "driver",
        "vehicle",
        "registration_number",
        "seat_capacity",
       
        "created_at",
        
    ]

    list_filter = [
        "is_active",
        "is_verified",
        "vehicle"
        
    ]

    search_fields = [
        "user__phone_number",
        "license_number",
        "auser__adhar_number",
        "user__pan_number"
    ]

    ordering = ["-created_at"]

admin.site.register(DriverVehicle, DriverVehicleAdmin)    