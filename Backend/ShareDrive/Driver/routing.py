# Driver/routing.py
from django.urls import path, re_path
from .consumer import CustomerRideConsumer, DriverRideConsumer

websocket_urlpatterns = [
    re_path(r'ws/driver/$', DriverRideConsumer.as_asgi()),
     path('ws/customer/', CustomerRideConsumer.as_asgi()),
]