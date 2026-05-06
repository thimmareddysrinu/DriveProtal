import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from django.contrib.gis.geos import Point
from Driver.models import DriverProfile


class DriverRideConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        self.driver_group_name = f"driver_{self.user.id}"

        await self.channel_layer.group_add(
            self.driver_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.driver_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        print(f"Received data: {data}")

        if data['type'] == 'location_update':
            await self.update_driver_location(data['lat'], data['lng'])
        elif data['type'] == 'online_status':
            await self.update_online_status(data['is_online'])
        elif data['type'] == 'available_status':
            await self.update_available_status(data['is_available'])

    @sync_to_async
    def update_driver_location(self, lat, lng):
        driver = DriverProfile.objects.filter(user=self.user).first()
        if driver:
            print(f"BEFORE - Driver location: {driver.current_location}")
            driver.current_location = Point(float(lng), float(lat), srid=4326)
            driver.save()
            print(f"AFTER - Driver location: {driver.current_location}")
        else:
            print("❌ No driver profile found!")

    @sync_to_async
    def update_online_status(self, is_online):
        driver = DriverProfile.objects.filter(user=self.user).first()
        if driver:
            driver.is_online = is_online
            driver.save()
            print(f"Driver online status: {is_online}")

    @sync_to_async
    def update_available_status(self, is_available):
        driver = DriverProfile.objects.filter(user=self.user).first()
        if driver:
            driver.is_available = is_available
            driver.save()
            print(f"Driver available status: {is_available}")

    async def ride_request(self, event):
        await self.send(text_data=json.dumps(event))

    async def connect(self):
     user = self.scope["user"]
     print(
        f"🔍 CONNECT DEBUG - User: {user}, Authenticated: {user.is_authenticated}")

     if user.is_authenticated:
        self.user = user
        self.driver_group = f"driver_{user.id}"
        await self.channel_layer.group_add(self.driver_group, self.channel_name)
        await self.accept()
        print(f"✅ WebSocket connected for driver {user.id}")

        # Send heartbeat to confirm connection stays open
        await self.send(text_data=json.dumps({
            "type": "connection_ok",
            "timestamp": "ok"
        }))
     else:
        print("❌ Anonymous user rejected")
        await self.close(code=4001)

    async def disconnect(self, close_code):
        if hasattr(self, "driver_group"):
            await self.channel_layer.group_discard(
                self.driver_group,
                self.channel_name
            )
        print("🔌 WebSocket disconnected")

    async def ride_request(self, event):
        await self.send(text_data=json.dumps({
            "type": "ride_request",
            "ride_id": event["ride_id"],
            "pickup": event["pickup"],
            "drop": event["drop"],
            "vehicle_type": event["vehicle_type"],
            "ride_mode": event["ride_mode"],
            "customer_name": event["customer_name"],
            "customer_phone": event["customer_phone"],
            "distance_km": event["distance_km"],
            "price_breakdown": event["price_breakdown"],
            "expires_in": event.get("expires_in", 90),
        }))

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get("type")

        if message_type == "driver_status":
            await self.update_driver_status(
                is_online=data.get("is_online", False),
                is_available=data.get("is_available", False),
            )
            await self.send(text_data=json.dumps({
                "type": "status_updated",
                "is_online": data.get("is_online", False),
                "is_available": data.get("is_available", False),
            }))

        elif message_type == "update_location":
            lat = data.get("lat")
            lng = data.get("lng")

            if lat is not None and lng is not None:
                await self.update_driver_location(lat, lng)
                await self.send(text_data=json.dumps({
                    "type": "location_updated",
                    "lat": lat,
                    "lng": lng
                }))

    @sync_to_async
    def update_driver_status(self, is_online, is_available):
        DriverProfile.objects.filter(user=self.user).update(
            is_online=is_online,
            is_available=is_available
        )

    @sync_to_async
    def update_driver_location(self, lat, lng):
        DriverProfile.objects.filter(user=self.user).update(
            current_location=Point(float(lng), float(lat), srid=4326)
        )
