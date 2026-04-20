from django.contrib.gis.db import models as gis_models
from django.db import models
from django.conf import settings


# ─── Vehicle Pricing Configuration ────────────────────────────────────────────

class VehiclePricingConfig(models.Model):
    """
    Admin-configurable per-km pricing for each vehicle type and ride mode.
    The platform tax per km goes to the website owner.
    """

    VEHICLE_TYPE_CHOICES = [
        ('bike',        'Bike'),
         ('auto',        'Auto'),
        ('scooty',      'Scooty'),
        ('car_mini',    'Car – Mini '),
        ('car_sedan',   'Car – Sedan '),
        ('car_suv',     'Car – SUV '),
        ('car_premium', 'Car - Premium '),
        
    ]

    RIDE_MODE_CHOICES = [
        ('normal', 'Normal (Private)'),
        ('shared', 'Shared'),
    ]

    vehicle_type = models.CharField(max_length=20, choices=VEHICLE_TYPE_CHOICES)
    ride_mode    = models.CharField(max_length=10, choices=RIDE_MODE_CHOICES)

    # Base fare charged at booking (flat, regardless of distance)
    base_fare = models.DecimalField(
        max_digits=8, decimal_places=2, default=20.00,
        help_text="Flat base fare in ₹ charged at trip start"
    )

    # Per-km rate paid to the driver
    rate_per_km = models.DecimalField(
        max_digits=6, decimal_places=2,
        help_text="Driver earning per km in ₹"
    )

    # Per-km platform tax collected for the website owner
    tax_per_km = models.DecimalField(
        max_digits=6, decimal_places=2, default=1.00,
        help_text="Platform tax per km in ₹ (goes to website owner)"
    )

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Vehicle Pricing Config"
        verbose_name_plural = "Vehicle Pricing Configs"
        unique_together = ('vehicle_type', 'ride_mode')
        ordering = ['vehicle_type', 'ride_mode']

    def __str__(self):
        return f"{self.get_vehicle_type_display()} | {self.get_ride_mode_display()} — ₹{self.rate_per_km}/km (tax ₹{self.tax_per_km}/km)"


# ─── Ride ────────────────────────────────────────────────────────────────────

class Ride(models.Model):
    """
    A single ride request by a customer. Stores start/end locations,
    vehicle preference, calculated distance, and final price breakdown.
    """

    STATUS_CHOICES = [
        ('pending_driver_confirmation', 'Pending Driver Confirmation'),
        ('driver_assigned', 'Driver Assigned'),
        ('driver_arrived', 'Driver Arrived'),
        ('started', 'Ride Started'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    VEHICLE_TYPE_CHOICES = VehiclePricingConfig.VEHICLE_TYPE_CHOICES
    RIDE_MODE_CHOICES    = VehiclePricingConfig.RIDE_MODE_CHOICES

    # Participants
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='rides'
    )
    driver_vehicle = models.ForeignKey(
        'Driver.DriverVehicle',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='rides'
    )

    # Locations
    start_lat     = models.DecimalField(max_digits=9, decimal_places=6)
    start_lon     = models.DecimalField(max_digits=9, decimal_places=6)
    end_lat       = models.DecimalField(max_digits=9, decimal_places=6)
    end_lon       = models.DecimalField(max_digits=9, decimal_places=6)
    start_address = models.CharField(max_length=255, blank=True)
    end_address   = models.CharField(max_length=255, blank=True)

    # GIS points (optional — for spatial queries)
    start_point = gis_models.PointField(geography=True, null=True, blank=True)
    end_point   = gis_models.PointField(geography=True, null=True, blank=True)

    # Ride preferences
    vehicle_type = models.CharField(max_length=20, choices=VEHICLE_TYPE_CHOICES, default='car_mini')
    ride_mode    = models.CharField(max_length=10, choices=RIDE_MODE_CHOICES, default='normal')

    # Pricing breakdown (populated by LangGraph agent)
    distance_km  = models.DecimalField(max_digits=8,  decimal_places=2, null=True, blank=True)
    base_fare    = models.DecimalField(max_digits=8,  decimal_places=2, null=True, blank=True)
    ride_price   = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True,
                                       help_text="Driver earnings portion")
    tax_amount   = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True,
                                       help_text="Platform tax for website owner")
    total_price  = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True,
                                       help_text="Total amount paid by customer")

    # Status
    status = models.CharField(max_length=30, choices=STATUS_CHOICES,default='pending_driver_confirmation')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    driver = models.ForeignKey('Driver.DriverProfile', on_delete=models.CASCADE, null=True, blank=True)
    driver_accepted_at = models.DateTimeField(null=True, blank=True)
    
 
    

    class Meta:
        verbose_name = "Ride"
        verbose_name_plural = "Rides"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['vehicle_type', 'ride_mode']),
        ]

    def __str__(self):
        return (
            f"Ride #{self.id} | {self.get_vehicle_type_display()} "
            f"[{self.get_ride_mode_display()}] | {self.status} | "
            f"₹{self.total_price}"
        )


# ─── Ride Tax Record ──────────────────────────────────────────────────────────

class RideTaxRecord(models.Model):
    """
    Per-ride tax ledger entry for the website owner.
    Automatically created when a Ride is confirmed.
    """
    ride        = models.OneToOneField(Ride, on_delete=models.CASCADE, related_name='tax_record')
    tax_amount  = models.DecimalField(max_digits=10, decimal_places=2)
    distance_km = models.DecimalField(max_digits=8,  decimal_places=2)
    tax_per_km  = models.DecimalField(max_digits=6,  decimal_places=2)
    settled     = models.BooleanField(default=False, help_text="Has this tax been settled/paid out?")
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Ride Tax Record"
        verbose_name_plural = "Ride Tax Records"
        ordering = ['-created_at']

    def __str__(self):
        return f"Tax #{self.id} — Ride #{self.ride_id} — ₹{self.tax_amount}"
