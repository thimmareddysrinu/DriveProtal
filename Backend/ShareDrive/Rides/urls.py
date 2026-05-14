from django.urls import path
from .views import *

urlpatterns = [
    # Public

    path('search/vehicles/',GetAllVehiclesPriceView.as_view(),name='searching-and-vehicles-getting '),
     path('book/vehicles/',RideProccessingView.as_view(),name='processing-book'),
     path('book/vehicles/driveraccepted/',RideAcceptedView.as_view(),name='accepted-ride-booking'),
         path('status/<int:ride_id>/', RideStatusAPIView.as_view(), name='ride-status'),

   
]
