from django.urls import path
from .views import (
    GoodsRideRequestView, GoodsRideDetailView,
    NearbyGoodsDriversView, GoodsDriverAcceptView, GoodsDriverUpdateStatusView,
)

urlpatterns = [
    # Customer
    path('request/',                        GoodsRideRequestView.as_view(),         name='goods-request'),
    path('request/<int:ride_id>/',          GoodsRideDetailView.as_view(),          name='goods-request-detail'),
    path('nearby/',                         NearbyGoodsDriversView.as_view(),       name='goods-nearby-drivers'),

    # Driver
    path('<int:ride_id>/accept/',           GoodsDriverAcceptView.as_view(),        name='goods-driver-accept'),
    path('<int:ride_id>/status/',           GoodsDriverUpdateStatusView.as_view(),  name='goods-driver-status'),
]
