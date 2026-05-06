from django.urls import path
from .views import *


urlpatterns = [
    # ── Owner Profile ─────────────────────────────────────────────────
    path('profile/',
         VehicleOwnerProfileView.as_view(),      name='owner-profile'),

    # ── Owner Vehicles ────────────────────────────────────────────────
    path('vehicles/add/',
         VehicleCreationView.as_view(),          name='owner-vehicle-add'),
          path('vehicles/<int:id>/',
         VehicleCreationView.as_view(),          name='owner-vehicle-update'),
    path('vehicles/',
         OwnerVehicleListView.as_view(),         name='owner-vehicle-list'),

    # ── Admin Vehicle Management ──────────────────────────────────────
    path('admin/vehicles/',
         VehicleListAdminView.as_view(),         name='admin-rental-vehicles'),
    path('admin/vehicle/<int:vehicle_id>/',
         VehicleDetailsAdminView.as_view(),      name='admin-rental-vehicle-detail'),
    path('admin/vehicle/<int:vehicle_id>/approval/',
         VehicleApprovalAdminView.as_view(), name='admin-rental-vehicle-approval'),

    # # ── Customer Browse ───────────────────────────────────────────────
    # path('vehicles/available/',                 AvailableRentalVehiclesView.as_view(),  name='rental-vehicles-available'),
    # path('vehicles/<int:vehicle_id>/',          RentalVehicleDetailView.as_view(),      name='rental-vehicle-detail'),

    # # ── Customer Booking ──────────────────────────────────────────────
    # path('vehicles/<int:vehicle_id>/book/',     RentalBookingView.as_view(),            name='rental-book'),
    # path('bookings/',                           CustomerRentalBookingListView.as_view(), name='customer-rental-bookings'),
    # path('bookings/<int:booking_id>/',          RentalBookingDetailView.as_view(),      name='rental-booking-detail'),

    # # ── Owner Booking Management ──────────────────────────────────────
    # path('mybookings/',                         OwnerBookingsView.as_view(),            name='owner-bookings'),
    # path('mybookings/<int:booking_id>/action/', OwnerBookingActionView.as_view(),       name='owner-booking-action'),
]
