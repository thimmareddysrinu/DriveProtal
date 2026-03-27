from django.shortcuts import render, get_object_or_404
from .Serializers import *
from rest_framework.views import APIView
from rest_framework import status
from django.contrib.auth import get_user_model, login, logout
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
import random
from Customer.models import CustomerProfile
from Owners.models import VehicleOwnerProfile
from Driver.models import DriverProfile

User = get_user_model()


class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = customuserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate OTP
        otp = random.randint(100000, 999999)
        OneTimePassword.objects.create(
            user=user,
            otp=str(otp),
            purpose="register"
        )
        
        print({"otp": otp})  # In production, send this via SMS
        
        return Response({
            "message": "User registered successfully. Please verify OTP.",
            "phone_number": user.phone_number,
        }, status=status.HTTP_201_CREATED)


class OtpVerifyView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        otp = request.data.get("otp")
        phone_number = request.data.get("phone_number")
        
        if not otp or not phone_number:
            return Response(
                {"message": "OTP and phone number are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Get user by phone number
            user = CustomUser.objects.get(phone_number=phone_number)
            
            # Get the latest unused register OTP for this user
            otp_obj = OneTimePassword.objects.filter(
                user=user,
                otp=otp,
                is_used=False,
                purpose="register"
            ).order_by('-created_at').first()
            
            if not otp_obj:
                return Response(
                    {"message": "Invalid or expired OTP"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if OTP is valid (not expired)
            if not otp_obj.is_valid():
                return Response(
                    {"message": "OTP has expired"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Mark OTP as used
            otp_obj.is_used = True
            otp_obj.save()
            
            # Activate user if not already active
            if not user.is_active:
                user.is_active = True
                user.save()
                self._create_role_profile(user)
                return Response(
                    {"message": "OTP verified successfully. Account activated."},
                    status=status.HTTP_200_OK
                )
            
            return Response(
                {"message": "OTP verified successfully"},
                status=status.HTTP_200_OK
            )
            
        except CustomUser.DoesNotExist:
            return Response(
                {"message": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"message": f"Error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    def _create_role_profile(self, user):
        
         try:
            if user.role == 'customer':
                CustomerProfile.objects.get_or_create(user=user)
            elif user.role == 'driver':
                DriverProfile.objects.get_or_create(user=user)
            elif user.role == 'vehicle_owner':
                VehicleOwnerProfile.objects.get_or_create(user=user)
         except Exception as e:
            print(f"Error creating profile: {str(e)}")


class MpinCreateView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        print("DATA:", request.data)
        phone_number = request.data.get("phone_number")
        mpin = request.data.get("mpin")
        
        if not phone_number or not mpin:
            return Response(
                {"message": "Phone number and MPIN are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate MPIN (should be 4-6 digits)
        if not mpin.isdigit() or len(mpin) < 4 or len(mpin) > 6:
            return Response(
                {"message": "MPIN must be 4-6 digits"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = CustomUser.objects.get(phone_number=phone_number)
            
            if not user.is_active:
                return Response(
                    {"message": "Please verify your OTP first"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Set MPIN as password (you can also use a separate mpin_hash field)
            user.set_password(mpin)
            user.save()
            
            return Response(
                {"message": "MPIN created successfully"},
                status=status.HTTP_200_OK
            )
            
        except CustomUser.DoesNotExist:
            return Response(
                {"message": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        profile_data = self._get_profile_data(user)
        return Response({
            "message": "Login successful",
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": {
                "phone_number": user.phone_number,
                "role": user.role,
                "full_name": user.full_name,
                "profile": profile_data
            }
        }, status=status.HTTP_200_OK)
    def _get_profile_data(self,user):
         """Get profile data based on user role"""
         try:
             if user.role == 'customer':
                 profile=CustomerProfile.objects.filter(user=user).first()
                 if profile:
                     return{
                          "address": profile.address,
                        "city": profile.city,
                        "total_rides": profile.total_rides,
                        "rating": str(profile.rating)
                         
                     }
             elif user.role == 'driver':
                 profile=DriverProfile.objects.filter(user=user).first()
                 if profile:
                     return{
                         "license_number": profile.license_number,
                        "verification_status": profile.verification_status,
                        "is_available": profile.is_available,
                        "total_rides_completed": profile.total_rides_completed,
                        "rating": str(profile.rating)
                     }
             elif user.role == 'vehicle_owner':
                 profile=VehicleOwnerProfile.objects.filter(user=user).first()
                 if profile:
                     return{
                         "company_name": profile.company_name,
                        "total_vehicles": profile.total_vehicles,
                        "verified": profile.verified
                         
                     }
         except Exception as e:
            print(f"Error fetching profile: {str(e)}")
        
         return {}   


class ResendOtpView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        phone_number = request.data.get("phone_number")
        
        if not phone_number:
            return Response(
                {"message": "Phone number is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = CustomUser.objects.get(phone_number=phone_number)
            
            # Mark all previous OTPs as used
            OneTimePassword.objects.filter(user=user, is_used=False).update(is_used=True)
            
            # Generate new OTP
            otp = random.randint(100000, 999999)
            OneTimePassword.objects.create(
                user=user,
                otp=str(otp),
                purpose="register"
            )
            
            print({"otp": otp})  # In production, send this via SMS
            
            return Response({
                "message": "New OTP sent successfully",
            }, status=status.HTTP_200_OK)
            
        except CustomUser.DoesNotExist:
            return Response(
                {"message": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )
      