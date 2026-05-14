# Customer/models.py
from django.contrib.gis.db import models as gis_models
from django.db import models
from django.conf import settings


class CustomerProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='customer_profile'
    )
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    pincode = models.CharField(max_length=10, blank=True, null=True)
    home_location = gis_models.PointField(geography=True, null=True, blank=True)

    driving_license_number = models.CharField(max_length=50, blank=True, null=True)
    driving_license_expiry = models.DateField(null=True, blank=True)
    driving_license_image = models.ImageField(upload_to='customers/licenses/', null=True, blank=True)
    is_license_verified = models.BooleanField(default=False)

    aadhar_number = models.CharField(max_length=12, blank=True, null=True)
    aadhar_image = models.ImageField(upload_to='customers/aadhar/', null=True, blank=True)

    emergency_contact_name = models.CharField(max_length=100, blank=True, null=True)
    emergency_contact_number = models.CharField(max_length=15, blank=True, null=True)

    preferred_payment_method = models.CharField(
        max_length=20,
        choices=[('cash', 'Cash'), ('upi', 'UPI'), ('card', 'Card'), ('wallet', 'Wallet')],
        default='cash'
    )

    total_rides = models.IntegerField(default=0)
    cancelled_rides = models.IntegerField(default=0)
    ride_rating = models.DecimalField(max_digits=3, decimal_places=2, default=5.0)
    total_ride_spent = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)

    total_rentals = models.IntegerField(default=0)
    active_rentals = models.IntegerField(default=0)
    total_rental_spent = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)

    is_blocked = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Customer Profile"
        verbose_name_plural = "Customer Profiles"

    def __str__(self):
        return f"Customer: {self.user.phone_number}"

    def can_rent_vehicle(self):
        return (
            self.is_license_verified and
            self.driving_license_number and
            not self.is_blocked
        )


class CustomerPassenger(models.Model):
    BOOKING_FOR_CHOICES = (
        ('self', 'Self'),
        ('friend', 'Friend'),
        ('family', 'Family'),
        ('other', 'Other'),
    )

    customer = models.ForeignKey(
        CustomerProfile,
        on_delete=models.CASCADE,
        related_name='passengers'
    )
    full_name = models.CharField(max_length=120)
    phone_number = models.CharField(max_length=15)
    relationship = models.CharField(max_length=20, choices=BOOKING_FOR_CHOICES, default='self')
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.full_name} ({self.relationship})"