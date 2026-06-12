from django.shortcuts import render
from rest_framework.views import APIView, Response
from Rides.serializers import *
from .models import CustomerProfile
from Rides.models import Ride
# Create your views here.
class CustomerRidesView(APIView):
    def get(self,request):
        customer=CustomerProfile.objects.get(user=request.user)
        rides=Ride.objects.filter(customer=customer)
        serializer=RideSerializer(rides,many=True)
        return Response({'rides': serializer.data})


