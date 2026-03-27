from rest_framework import serializers
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.hashers import check_password
from .models import *

User = get_user_model()


class customuserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['phone_number', 'email', 'full_name', 'role']

    def create(self, validated_data):
        phone_number = validated_data['phone_number']
        role = validated_data.get('role', 'customer')
        email = validated_data.get('email', '')
        full_name = validated_data.get('full_name', '')

        user = CustomUser.objects.create(
            phone_number=phone_number,
            role=role,
            email=email,
            full_name=full_name,
            is_active=False  # Will be activated after OTP verification
        )
        user.set_unusable_password()
        user.save()
        return user


class UserLoginSerializer(serializers.Serializer):
    phone_number = serializers.CharField(required=True)
    mpin = serializers.CharField(required=True)

    def validate(self, attrs):
        phone_number = attrs["phone_number"]
        mpin = attrs["mpin"]

        try:
            user = CustomUser.objects.get(phone_number=phone_number)

            if not user.check_password(mpin):
                raise serializers.ValidationError("Invalid MPIN")

            attrs["user"] = user
            return attrs

        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("User not found")
# Alternative name for backward compatibility
UserLogin = UserLoginSerializer


class OTPVerifySerializer(serializers.Serializer):
    """
    Serializer for OTP verification
    """
    phone_number = serializers.CharField(max_length=15, required=True)
    otp = serializers.CharField(max_length=6, required=True)


class MPINCreateSerializer(serializers.Serializer):
    """
    Serializer for creating MPIN
    """
    phone_number = serializers.CharField(max_length=15, required=True)
    mpin = serializers.CharField(min_length=4, max_length=6, required=True)

    def validate_mpin(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("MPIN must contain only digits")
        return value


class ResendOTPSerializer(serializers.Serializer):
    """
    Serializer for resending OTP
    """
    phone_number = serializers.CharField(max_length=15, required=True)
