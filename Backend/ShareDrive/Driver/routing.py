# Driver/routing.py
from django.urls import re_path
from .consumer import DriverRideConsumer

websocket_urlpatterns = [
    re_path(r'ws/driver/$', DriverRideConsumer.as_asgi()),
]