from django.urls import path
from .views import *

urlpatterns = [
    # ── Driver Profile ────────────────────────────────────────────────
    path('profile/',                        DriverProfileView.as_view(),                name='driver-profile'),

    # ── Driver Vehicle ────────────────────────────────────────────────
   path('vehicle/', DriverVehicleCreateGetUpdateView.as_view(), name='driver-vehicle'),
    # Admin vehicle management
    path('admin/drivervehicles/',           DriverVehiclesListAdminView.as_view(),      name='admin-driver-vehicles'),
    path('admin/drivervehicle/<int:vehicle_id>/',           DriverVehicleDetailsAdminView.as_view(),    name='admin-driver-vehicle-detail'),
    path('admin/drivervehicle/<int:vehicle_id>/approval/',  DriverVehicleApprovalAdminView.as_view(),   name='admin-driver-vehicle-approval'),

    # ── Shared Ride — Driver ──────────────────────────────────────────


    # driver admin list new
    path('admin/drivers/', DriverListAdminView.as_view(), name='admin-driver-list'),
path('admin/drivers/<int:profile_id>/', DriverDetailAdminView.as_view(), name='admin-driver-detail'),
path('admin/drivers/<int:profile_id>/approval/', DriverProfileApprovalAdminView.as_view(), name='admin-driver-profile-approval'),
path('admin/vehicles/<int:vehicle_id>/approval/', DriverVehicleApprovalAdminView.as_view(), name='admin-driver-vehicle-approval'),

    # ------------
    path('shared/routes/create/',           SharedRouteCreateView.as_view(),            name='shared-route-create'),
    path('shared/routes/',                  SharedRouteListView.as_view(),              name='shared-route-list'),
    path('shared/routes/<int:route_id>/status/', SharedRouteUpdateStatusView.as_view(), name='shared-route-status'),

    # ── Shared Ride — Customer ────────────────────────────────────────
    path('shared/search/',                  SharedRouteSearchView.as_view(),            name='shared-route-search'),
    path('shared/routes/<int:route_id>/book/',  SharedRideBookView.as_view(),           name='shared-ride-book'),
    path('shared/bookings/',                SharedRideBookingListView.as_view(),        name='shared-booking-list'),
    path('shared/bookings/<int:booking_id>/cancel/', SharedRideBookingCancelView.as_view(), name='shared-booking-cancel'),

    # ── Full Ride ─────────────────────────────────────────────────────
    path('fullride/nearby/',                NearbyDriversView.as_view(),                name='fullride-nearby'),
    path('fullride/request/',               FullRideRequestView.as_view(),              name='fullride-request'),
    path('fullride/<int:ride_id>/status/',  FullRideStatusView.as_view(),               name='fullride-status'),
    path('fullride/<int:ride_id>/accept/',  DriverAcceptRideView.as_view(),             name='fullride-accept'),
    path('fullride/<int:ride_id>/update/',  DriverUpdateRideStatusView.as_view(),       name='fullride-update'),
]
