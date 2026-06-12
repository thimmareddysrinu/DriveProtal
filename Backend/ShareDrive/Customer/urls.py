from django.urls import path
from .views import *

urlpatterns = [
    
   path('rides/',CustomerRidesView.as_view(),name='customer-rides')
   # path('ride/<int:ride_id>/status/')
    
]