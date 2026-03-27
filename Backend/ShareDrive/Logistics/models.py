from django.db import models
from django.contrib.gis.db import models as gis_models


class GoodsRideRequest(models.Model):
    """Customer books a goods/logistics vehicle for transporting items."""
    GOODS_TYPE = [
        ('household', 'Household Items'),
        ('commercial', 'Commercial Goods'),
        ('fragile', 'Fragile Items'),
        ('electronics', 'Electronics'),
        ('furniture', 'Furniture'),
        ('other', 'Other'),
    ]
    VEHICLE_SIZE = [
        ('mini_truck', 'Mini Truck'),
        ('tempo', 'Tempo'),
        ('lorry', 'Lorry'),
    ]
    STATUS_CHOICES = [
        ('searching', 'Searching for Driver'),
        ('assigned', 'Driver Assigned'),
        ('started', 'Trip Started'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    customer = models.ForeignKey(
        'Customer.CustomerProfile',
        on_delete=models.CASCADE,
        related_name='goods_requests'
    )
    driver = models.ForeignKey(
        'Driver.DriverProfile',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='goods_assignments'
    )
    driver_vehicle = models.ForeignKey(
        'Driver.DriverVehicle',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='goods_trips'
    )

    # Route
    pickup_point = gis_models.PointField(geography=True)
    drop_point = gis_models.PointField(geography=True)
    pickup_address = models.TextField()
    drop_address = models.TextField()

    # Goods info
    goods_type = models.CharField(max_length=20, choices=GOODS_TYPE, default='household')
    estimated_weight_kg = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    goods_description = models.TextField(blank=True, null=True)
    vehicle_size_required = models.CharField(max_length=20, choices=VEHICLE_SIZE, default='mini_truck')

    # Pricing
    estimated_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    final_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='searching')

    # Timestamps
    requested_at = models.DateTimeField(auto_now_add=True)
    accepted_at = models.DateTimeField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Goods Ride Request"
        verbose_name_plural = "Goods Ride Requests"
        ordering = ['-requested_at']

    def __str__(self):
        return f"GoodsRide #{self.id} — {self.pickup_address} → {self.drop_address} [{self.status}]"
