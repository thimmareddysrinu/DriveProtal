from rest_framework import serializers
from .models import CustomerProfile

class CustomerProfileSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField(source='user.phone_number', read_only=True)
    full_name = serializers.CharField(source='user.full_name', read_only=True)
    
    class Meta:
        model = CustomerProfile
        fields = [
            'id', 'phone_number', 'full_name', 'address', 'city', 
            'state', 'pincode', 'emergency_contact', 'preferred_payment_method',
            'total_rides', 'rating', 'created_at', 'updated_at'
        ]
        read_only_fields = ['total_rides', 'rating', 'created_at', 'updated_at']