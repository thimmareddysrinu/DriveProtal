import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from Driver.routing import websocket_urlpatterns
from Driver.middleware import JWTAuthMiddleware

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ShareDrive.settings")

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": JWTAuthMiddleware(
        URLRouter(websocket_urlpatterns)
    ),
})