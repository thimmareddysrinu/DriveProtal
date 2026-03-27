from django.contrib import admin
from .models import VehicleOwnerProfile,VehicleRental

admin.site.register(VehicleOwnerProfile)



@admin.register(VehicleRental)
class VehicleRentalAdmin(admin.ModelAdmin):

    list_display = [
        "registration_number",
        "brand",
        "vehiclemodel",
        "owner",
        "is_verified",
        "is_active"
    ]

    list_filter = ["is_verified","is_active","vehicle"]

    search_fields = ["registration_number","brand","vehiclemodel"]

    list_editable = ["is_verified","is_active"]

