import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ShareDrive.settings')
django.setup()

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application
from Driver.middleware import JWTAuthMiddleware
import Driver.routing

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AllowedHostsOriginValidator(
        JWTAuthMiddleware(
            URLRouter(Driver.routing.websocket_urlpatterns)
        )
    ),
})