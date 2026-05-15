from django.contrib.gis.db import models as gis_models
from django.db import models
from django.conf import settings
from .Folders import *
from django.contrib.gis.db import models

class DriverProfile(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending Verification'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('suspended', 'Suspended'),
    )
    DRIVER_RIDE_STATUS_CHOICES = (
       
         ("free",'FREE'),
         ("onride",'ONRIDE'),
         
    )
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='driver_profile'
    )
    
    # Driver verification fields
    license_number = models.CharField(max_length=50, unique=True, blank=True, null=True)
    license_expiry = models.DateField(null=True, blank=True)
    license_image = models.ImageField(upload_to='drivers/licenses/', null=True, blank=True)
    
    # Identity verification
    verification_status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='pending'
    )
    driver_ride_status = models.CharField(
        max_length=20, 
        choices=DRIVER_RIDE_STATUS_CHOICES, 
        default='free'
    )
    driver_image = models.ImageField(upload_to='drivers/profilepicture/', null=True, blank=True)
    
    aadhar_number = models.CharField(max_length=12, blank=True, null=True)
    aadhar_image = models.ImageField(upload_to='drivers/aadhar/', null=True, blank=True)
    pan_number = models.CharField(max_length=10, blank=True, null=True)
    pan_image = models.ImageField(upload_to='drivers/pan/', null=True, blank=True)
    
    # Work status
   
    current_location = models.PointField(
        geography=True,  # ✅ Use geography for accurate distance calculations
              # ✅ WGS84 coordinate system
        null=True, 
        blank=True
    )
    is_online = models.BooleanField(default=False)
    is_available = models.BooleanField(default=False)
    
    # Stats
    total_rides_completed = models.IntegerField(default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
    total_earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    
    # Bank details for payments
    bank_account_number = models.CharField(max_length=20, blank=True, null=True)
    bank_ifsc = models.CharField(max_length=11, blank=True, null=True)
    bank_account_holder_name = models.CharField(max_length=100, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    full_name=models.CharField(max_length=100,default=True)
    class Meta:
        verbose_name = "Driver Profile"
        verbose_name_plural = "Driver Profiles"
        indexes = [
            models.Index(fields=['is_available', 'is_online', 'verification_status']),
        ]

    def __str__(self):
        return f"Driver: {self.user.phone_number} - {self.verification_status}-{self.current_location}"
    
    def get_distance_from(self, point):
        """Calculate distance from a given point"""
        from django.contrib.gis.geos import Point
        
        if self.current_location:
            if isinstance(point, tuple):
                point = Point(point[0], point[1], srid=4326)
            return self.current_location.distance(point) * 100  # Convert to km
        return None

class DriverVehicle(models.Model):
    TYPE_OF_RIDE=[
        ("sharing","SHARING"),
        ("fully","FULLY"),
        ("notmention","NOTMENTION"),
        
    ]
    VEHICLE_Type=[
         ('bike',        'Bike'),
         ('auto',        'Auto'),
        ('scooty',      'Scooty'),
        ('car_mini',    'Car – Mini '),
        ('car_sedan',   'Car – Sedan '),
        ('car_suv',     'Car – SUV '),
        ('car_premium', 'Car - Premium '),
        ('lorry','Lorry')

    ]
    STATUS_CHOICES = [
        ("available", "AVAILABLE"),        # Fixed spelling
        ("notavailable", "NOTAVAILABLE"), 
        ("running", "Running"),
    ]
      # Driver vehicle TYPE
    driver = models.ForeignKey(
        DriverProfile,
        on_delete=models.CASCADE,
        related_name='vehicles',
        help_text="driver_vehicles"
    )
      
    vehicle=models.CharField(max_length=100,choices=VEHICLE_Type)
    registration_number=models.CharField(max_length=70,unique=True,blank=True)
    vehiclemodel=models.CharField(max_length=100,blank=False)
    brand=models.CharField(max_length=100,blank=False)
    year=models.CharField(max_length=100,blank=False)
    colour=models.CharField(max_length=100,blank=False)
    seat_capacity=models.PositiveIntegerField(default=1)
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
     # stats
    is_active = models.CharField(
        default='notavailable', max_length=100, choices=STATUS_CHOICES)
    is_verified = models.BooleanField(default=False)
    sharing_price = models.DecimalField(
         max_digits=10,
         decimal_places=2,
         null=True,
         blank=True,
         help_text="Hourly rental price"

    )
    ride_type=models.CharField(max_length=100,choices=TYPE_OF_RIDE,default='notmention')
    fully_price = models.DecimalField(
         max_digits=10,
         decimal_places=2,
         null=True,
         blank=True,
         help_text="day rental price"
    )
    extra_km_charge = models.DecimalField(
         max_digits=5, decimal_places=2, default=10.00)
   # Features
    has_ac = models.BooleanField(default=True)

     # Stats
    total_rentals = models.IntegerField(default=0)
    total_distance = models.DecimalField(
         max_digits=10, decimal_places=2, default=0.0)
    current_km = models.IntegerField(default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=5.0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
         verbose_name = "Driver Vehicle"
         verbose_name_plural = "Driver Vehicles"
         indexes = [
    models.Index(fields=['is_active', 'is_verified']),
    models.Index(fields=['vehicle']),
]

    def __str__(self):
     return f"{self.driver.user}-----{self.brand} {self.vehiclemodel} - {self.registration_number}"
    def is_available_drvers(self):
     return self.is_active == 'avaliable' and self.is_verified


# ─── Shared Ride ─────────────────────────────────────────────────────────────

class SharedRideRoute(models.Model):
    """A shared route posted by a driver — customers book individual seats."""
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('started', 'Started'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    driver_vehicle = models.ForeignKey(
        DriverVehicle,
        on_delete=models.CASCADE,
        related_name='shared_routes'
    )

    # Route info
    origin_name = models.CharField(max_length=200)
    destination_name = models.CharField(max_length=200)
    origin_point = gis_models.PointField(geography=True, null=True, blank=True)
    destination_point = gis_models.PointField(geography=True, null=True, blank=True)

    departure_time = models.DateTimeField()
    available_seats = models.PositiveIntegerField(default=1)
    price_per_seat = models.DecimalField(max_digits=8, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Shared Ride Route"
        verbose_name_plural = "Shared Ride Routes"
        ordering = ['departure_time']
        indexes = [
            models.Index(fields=['status', 'departure_time']),
        ]

    def __str__(self):
        return f"{self.origin_name} → {self.destination_name} @ {self.departure_time}"

    @property
    def seats_booked(self):
        return self.bookings.filter(
            booking_status__in=['confirmed', 'pending']
        ).aggregate(total=models.Sum('seats_booked'))['total'] or 0

    @property
    def seats_available(self):
        return self.available_seats - self.seats_booked


class SharedRideBooking(models.Model):
    """A customer's booking on a shared route."""
    BOOKING_STATUS = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]
    PAYMENT_STATUS = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('refunded', 'Refunded'),
    ]

    route = models.ForeignKey(
        SharedRideRoute,
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    customer = models.ForeignKey(
        'Customer.CustomerProfile',
        on_delete=models.CASCADE,
        related_name='shared_bookings'
    )

    seats_booked = models.PositiveIntegerField(default=1)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    booking_status = models.CharField(max_length=20, choices=BOOKING_STATUS, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')

    pickup_point = gis_models.PointField(geography=True, null=True, blank=True)
    pickup_address = models.CharField(max_length=200, blank=True, null=True)

    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Shared Ride Booking"
        verbose_name_plural = "Shared Ride Bookings"
        ordering = ['-created_at']

    def __str__(self):
        return f"Booking #{self.id} — {self.route} — {self.seats_booked} seat(s)"


# ─── Full Ride (Cab-style) ────────────────────────────────────────────────────

class FullRideRequest(models.Model):
    """Customer requests a full private ride from point A to B."""
    STATUS_CHOICES = [
        ('searching', 'Searching for Driver'),
        ('driver_assigned', 'Driver Assigned'),
        ('started', 'Ride Started'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    VEHICLE_TYPE_CHOICES = [
        ('bike', 'Bike'),
        ('scooty', 'Scooty'),
        ('car', 'Car'),
        ('lorry', 'Lorry'),
    ]

    customer = models.ForeignKey(
        'Customer.CustomerProfile',
        on_delete=models.CASCADE,
        related_name='full_ride_requests'
    )

    pickup_point = gis_models.PointField(geography=True)
    drop_point = gis_models.PointField(geography=True)
    pickup_address = models.TextField()
    drop_address = models.TextField()

    vehicle_type_requested = models.CharField(max_length=20, choices=VEHICLE_TYPE_CHOICES, default='car')

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='searching')
    estimated_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    requested_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Full Ride Request"
        verbose_name_plural = "Full Ride Requests"
        ordering = ['-requested_at']

    def __str__(self):
        return f"FullRide #{self.id} — {self.pickup_address} → {self.drop_address} [{self.status}]"


class FullRideAssignment(models.Model):
    """Links a FullRideRequest to the driver who accepted it."""
    ride_request = models.OneToOneField(
        FullRideRequest,
        on_delete=models.CASCADE,
        related_name='assignment'
    )
    driver = models.ForeignKey(
        DriverProfile,
        on_delete=models.CASCADE,
        related_name='full_ride_assignments'
    )
    driver_vehicle = models.ForeignKey(
        DriverVehicle,
        on_delete=models.CASCADE,
        related_name='full_ride_assignments'
    )

    accepted_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    final_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    class Meta:
        verbose_name = "Full Ride Assignment"
        verbose_name_plural = "Full Ride Assignments"

    def __str__(self):
        return f"Assignment #{self.id} — Ride #{self.ride_request_id} → Driver {self.driver.user.phone_number}"
