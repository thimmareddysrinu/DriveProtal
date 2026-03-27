from django.db import models
from django.conf import settings
import uuid
from .Folders import *


class VehicleOwnerProfile(models.Model):
    """Profile for vehicle owners who rent vehicles to customers"""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='owner_profile'
    )

    # Business details
    company_name = models.CharField(max_length=200, blank=True, null=True)
    business_license = models.CharField(max_length=100, blank=True, null=True)
    business_license_image = models.ImageField(
        upload_to='owners/licenses/', null=True, blank=True)
    gst_number = models.CharField(max_length=15, blank=True, null=True)

    # Office/Pickup location
    office_address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    pincode = models.CharField(max_length=10, blank=True, null=True)

    # Bank details
    bank_account_number = models.CharField(
        max_length=20, blank=True, null=True)
    bank_ifsc = models.CharField(max_length=11, blank=True, null=True)
    bank_account_holder_name = models.CharField(
        max_length=100, blank=True, null=True)

    # Business stats
    total_vehicles = models.IntegerField(default=0)
    vehicles_on_rent = models.IntegerField(default=0)
    verified = models.BooleanField(default=False)
    total_earnings = models.DecimalField(
        max_digits=12, decimal_places=2, default=0.0)

    # Rating
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=5.0)
    total_rentals = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Vehicle Owner Profile"
        verbose_name_plural = "Vehicle Owner Profiles"

    def __str__(self):
        return f"Owner: {self.user.phone_number} - {self.company_name or 'Individual'}"


class VehicleRental(models.Model):
    VEHICLE_TYPE_CHOICES = [
          ('bike', 'Bike'),
        ('sedan', 'Sedan'),
         ('suv', 'SUV'),
        ('mini', 'Mini Car'),
        ('hatchback', 'Hatchback'),
        ('luxury', 'Luxury Car'),

    ]
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('rented', 'Currently Rented'),
        ('maintenance', 'Under Maintenance'),
        ('unavaliable', 'Unavaliable'),
    ]

    owner = models.ForeignKey(
        VehicleOwnerProfile, on_delete=models.CASCADE,
          related_name='rental_vehicles',
          help_text="Vehicle owner"
    )

    # vehicle TYPE
    vehicle = models.CharField(max_length=70, choices=VEHICLE_TYPE_CHOICES)
    registration_number = models.CharField(
        max_length=70, unique=True, blank=False)
    vehiclemodel = models.CharField(max_length=70, blank=False)
    brand = models.CharField(max_length=70, blank=False)
    year = models.CharField(max_length=70, blank=False)
    colour = models.CharField(max_length=70, blank=False)
    seat_capacity = models.PositiveIntegerField(default=4)
    fuel_type = models.CharField(max_length=20,
       choices=[('petrol', 'Petrol'), ('diesel', 'Diesel'),
                 ('cng', 'CNG'), ('electric', 'Electric')],
        default='petrol')
    transmission_type = models.CharField(max_length=100,
                                       choices=[("manual", "MANUAL"), ("automatic", "AUTOMATIC")])

   # VEHICLE DOCUMENTS
    rc_book_image = models.ImageField(
        upload_to=rc_book_upload_path, blank=True, null=True)
    insurance_image = models.ImageField(
        upload_to=insurance_upload_path, null=True, blank=True)
    insurance_expiary = models.ImageField(
        upload_to=insurance_upload_path, null=True, blank=True)
    pollution_image = models.ImageField(
        upload_to=pollution_upload_path, null=True, blank=True)
    pollution_expiary = models.ImageField(
        upload_to=pollution_upload_path, null=True, blank=True)

 # vehicle Photos
    vehicle_front = models.ImageField(
        upload_to=vehicle_photo_upload_path, null=True, blank=True)
    vehicle_right = models.ImageField(
        upload_to=vehicle_photo_upload_path, null=True, blank=True)
    Vehicle_left = models.ImageField(
        upload_to=vehicle_photo_upload_path, null=True, blank=True)
    vehicle_back = models.ImageField(
        upload_to=vehicle_photo_upload_path, null=True, blank=True)
    vehicle_seats_front = models.ImageField(
        upload_to=vehicle_photo_upload_path, null=True, blank=True)
    vehicle_trumpat = models.ImageField(
        upload_to=vehicle_photo_upload_path, null=True, blank=True)

    vehicle_Seats_back = models.ImageField(
        upload_to=vehicle_photo_upload_path, null=True, blank=True)

   # stats
    is_active = models.CharField(
        default='available', max_length=100, choices=STATUS_CHOICES)
    is_verified = models.BooleanField(default=False)

    # price
    rental_price_per_hour = models.DecimalField(
         max_digits=10,
         decimal_places=2,
         null=True,
         blank=True,
         help_text="Hourly rental price"

    )
    rental_price_per_day = models.DecimalField(
         max_digits=10,
         decimal_places=2,
         null=True,
         blank=True,
         help_text="day rental price"
    )
    security_depoist = models.DecimalField(
         max_digits=10,
         decimal_places=2,
         null=True,
         blank=True,
         help_text="Security Depoist"
    )
     # Rental policies
    min_rental_hours = models.IntegerField(
         default=6, help_text="Minimum rental duration in hours")
    max_rental_days = models.IntegerField(
         default=30, help_text="Maximum rental duration in days")
    km_limit_per_day = models.IntegerField(
         default=200, help_text="KM limit per day")
    extra_km_charge = models.DecimalField(
         max_digits=5, decimal_places=2, default=10.00)

    # Features
    has_ac = models.BooleanField(default=True)
    has_music_system = models.BooleanField(default=True)
    has_gps = models.BooleanField(default=False)
    has_bluetooth = models.BooleanField(default=True)

#     # Stats
    total_rentals = models.IntegerField(default=0)
    total_distance = models.DecimalField(
         max_digits=10, decimal_places=2, default=0.0)
    current_km = models.IntegerField(default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=5.0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
         verbose_name = "Rental Vehicle"
         verbose_name_plural = "Rental Vehicles"
         indexes = [
    models.Index(fields=['is_active', 'is_verified']),
    models.Index(fields=['vehicle']),
]

    def __str__(self):
     return f"{self.brand} {self.vehiclemodel} - {self.registration_number}"
    def is_available_for_rental(self):
     return self.is_active == 'available' and self.is_verified


# # ─── Vehicle Rental Booking ───────────────────────────────────────────────────

# class VehicleRentalBooking(models.Model):
#     """Customer books an owner's rental vehicle for self-drive."""
#     RENTAL_TYPE = [
#         ('hourly', 'Hourly'),
#         ('daily', 'Daily'),
#     ]
#     STATUS_CHOICES = [
#         ('pending', 'Pending Confirmation'),
#         ('confirmed', 'Confirmed'),
#         ('active', 'Active - Vehicle Picked Up'),
#         ('completed', 'Completed'),
#         ('cancelled', 'Cancelled'),
#     ]
#     PAYMENT_STATUS = [
#         ('pending', 'Pending'),
#         ('deposit_paid', 'Deposit Paid'),
#         ('full_paid', 'Full Payment Done'),
#         ('refund_pending', 'Refund Pending'),
#         ('refunded', 'Refunded'),
#     ]

#     vehicle = models.ForeignKey(
#         VehicleRental,
#         on_delete=models.CASCADE,
#         related_name='bookings'
#     )
#     customer = models.ForeignKey(
#         'Customer.CustomerProfile',
#         on_delete=models.CASCADE,
#         related_name='rental_bookings'
#     )

#     rental_type = models.CharField(max_length=10, choices=RENTAL_TYPE, default='daily')
#     start_datetime = models.DateTimeField()
#     end_datetime = models.DateTimeField()

#     # Calculated cost
#     total_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
#     security_deposit = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
#     security_deposit_paid = models.BooleanField(default=False)

#     # OTP-based handover
#     pickup_otp = models.CharField(max_length=6, blank=True, null=True)
#     return_otp = models.CharField(max_length=6, blank=True, null=True)

#     status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
#     payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')

#     customer_notes = models.TextField(blank=True, null=True)
#     cancellation_reason = models.TextField(blank=True, null=True)

#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     class Meta:
#         verbose_name = "Vehicle Rental Booking"
#         verbose_name_plural = "Vehicle Rental Bookings"
#         ordering = ['-created_at']

#     def __str__(self):
#         return f"RentalBooking #{self.id} — {self.vehicle} [{self.status}]"

#     def calculate_cost(self):
#         """Auto-calculate cost based on rental type and duration."""
#         if not self.start_datetime or not self.end_datetime:
#             return
#         duration = self.end_datetime - self.start_datetime
#         hours = duration.total_seconds() / 3600

#         if self.rental_type == 'hourly' and self.vehicle.rental_price_per_hour:
#             self.total_cost = round(self.vehicle.rental_price_per_hour * hours, 2)
#         elif self.rental_type == 'daily' and self.vehicle.rental_price_per_day:
#             days = max(1, hours / 24)
#             self.total_cost = round(self.vehicle.rental_price_per_day * days, 2)

#         self.security_deposit = self.vehicle.security_depoist






