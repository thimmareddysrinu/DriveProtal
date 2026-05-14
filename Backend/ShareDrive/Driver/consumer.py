import json

from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from django.contrib.gis.geos import Point
from langchain_openai import data

from Driver.models import DriverProfile, DriverVehicle


class DriverRideConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        user = self.scope["user"]

        if user.is_authenticated:
            self.user = user
            self.driver_group = f"driver_{user.id}"

            await self.channel_layer.group_add(
                self.driver_group,
                self.channel_name
            )

            await self.accept()

            await self.send(text_data=json.dumps({
                "type": "connection_ok",
                "message": "Connected to Driver Stream",
            }))
        else:
            await self.close(code=4001)

    async def disconnect(self, close_code):
     if hasattr(self, "driver_group"):
        await self.channel_layer.group_discard(
            self.driver_group,
            self.channel_name
        )
     print(f"🔌 Driver socket disconnected: user={getattr(self, 'user', None)} code={close_code}")

    async def receive(self, text_data):
        data = json.loads(text_data)

        message_type = data.get("type")

        if message_type == "driver_status":
            await self.update_driver_status(
                is_online=data.get("is_online", False),
                is_available=data.get("is_available", False),
            )
        elif message_type == "update_location":
         lat = data.get("lat")
         lng = data.get("lng")

         print("📍 Received location payload:", lat, lng)

         if lat is not None and lng is not None:
            await self.update_driver_location(lat, lng)
         else:
            print("❌ Invalid location payload")
        elif message_type == "ping":
            await self.send(text_data=json.dumps({
                "type": "pong"
            }))

    @sync_to_async
    def update_driver_status(self, is_online, is_available):
        try:
            driver = DriverProfile.objects.get(user=self.user)

            driver.is_online = is_online
            driver.is_available = is_available
            driver.save(update_fields=['is_online', 'is_available'])

            # ✅ Update vehicle status
            DriverVehicle.objects.filter(driver=driver).update(
                is_active='available' if is_available else 'notavailable'
            )

            print(
                f"✅ Driver {driver.user.phone_number} status: Online={is_online}, Available={is_available}")

        except DriverProfile.DoesNotExist:
            print(f"❌ DriverProfile not found for user {self.user.id}")
        except Exception as e:
            print(f"❌ Error updating driver status: {e}")

    @sync_to_async
    def update_driver_location(self, lat, lng):
        try:
            driver = DriverProfile.objects.get(user=self.user)

            # ✅ Update location with proper Point geometry
            driver.current_location = Point(
                float(lng),
                float(lat),
                srid=4326
            )

            # ✅ DON'T auto-set is_online/is_available here
            # Let the frontend explicitly control online status
            # Only update if they're already online
            driver.save(update_fields=['current_location'])

            print(
                f"✅ Location saved for driver {driver.user.phone_number}: ({lat}, {lng})")

        except DriverProfile.DoesNotExist:
            print(f"❌ DriverProfile not found for user {self.user.id}")
        except Exception as e:
            print(f"❌ Error updating location: {e}")

    @sync_to_async
    def set_driver_offline(self):
        """
        ✅ Set driver offline when WebSocket disconnects
        """
        try:
            driver = DriverProfile.objects.get(user=self.user)

            driver.is_online = False
            driver.is_available = False
            driver.save(update_fields=['is_online', 'is_available'])

            # ✅ Also mark vehicle as not available
            DriverVehicle.objects.filter(driver=driver).update(
                is_active='notavailable'
            )

            print(
                f"✅ Driver {driver.user.phone_number} set to OFFLINE on disconnect")

        except DriverProfile.DoesNotExist:
            print(f"❌ DriverProfile not found for user {self.user.id}")
        except Exception as e:
            print(f"❌ Error setting driver offline: {e}")

    async def ride_request(self, event):
        """
        ✅ Handle ride requests sent from backend
        """
        await self.send(text_data=json.dumps(event))


class CustomerRideConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for customers to receive real-time ride updates
    """

    async def connect(self):
        user = self.scope["user"]

        if user.is_authenticated:
            self.user = user
            self.customer_group = f"customer_{user.id}"

            await self.channel_layer.group_add(
                self.customer_group,
                self.channel_name
            )

            await self.accept()

            await self.send(text_data=json.dumps({
                "type": "connection_ok",
                "message": "Connected to Customer Stream",
            }))

            print(f"✅ Customer {user.id} connected to WebSocket")
        else:
            await self.close(code=4001)

    async def disconnect(self, close_code):
        if hasattr(self, "customer_group"):
            await self.channel_layer.group_discard(
                self.customer_group,
                self.channel_name
            )
            print(f"🔌 Customer {self.user.id} disconnected from WebSocket")

    async def receive(self, text_data):
        """
        Handle messages from customer
        """
        data = json.loads(text_data)
        message_type = data.get("type")

        if message_type == "ping":
            await self.send(text_data=json.dumps({
                "type": "pong"
            }))

    async def ride_accepted(self, event):
        """
        ✅ Send driver acceptance notification to customer
        """
        print(f"📤 Sending ride_accepted event to customer: {event}")

        await self.send(text_data=json.dumps({
            "type": "ride_accepted",
            "message": event.get("message"),
            "ride": event.get("ride"),
            "driver": event.get("driver"),
            "driver_vehicle": event.get("driver_vehicle"),
        }))
