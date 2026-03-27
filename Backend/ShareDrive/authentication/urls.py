from django.contrib import admin
from django.urls import path
from .views import RegisterView,OtpVerifyView,MpinCreateView,ResendOtpView,LoginView

urlpatterns = [
    path("register/" ,RegisterView.as_view(),name='User-Register'),
     path("otpverify/" ,OtpVerifyView.as_view(),name='Otp-Verify'),
     path("mpinset/" ,MpinCreateView.as_view(),name='User-mpin-set'),
      path("login/" ,LoginView.as_view(),name='user-login'),
     path("resendotp/" ,ResendOtpView.as_view(),name='resendOtp-Verify')
    ]