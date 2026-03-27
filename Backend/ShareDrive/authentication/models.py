from django.db import models
from django.contrib.auth.models import BaseUserManager,AbstractUser,PermissionsMixin
from django.utils import timezone
from datetime import timedelta
import uuid



from django.core.validators import RegexValidator,validate_email
# Create your models here.



phone_regex = RegexValidator(
    regex=r'^\d{10}$',
    message="phone number must be exactly 10 digits"
)
class BaseManager(BaseUserManager):
    def create_user(self, phone_number, password=None, **extra_fields):
        if not phone_number:
            raise ValueError("Phone number is required")
        user = self.model(phone_number=phone_number, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, phone_number, password=None,role='admin', **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        return self.create_user(phone_number, password=password,role=role ,**extra_fields)
       
class CustomUser(AbstractUser):  
    ROLE_CHOICES = (
       ("customer", "Customer"),
        ("driver", "Driver"),
        ("vehicle_owner", "Vehicle Owner"),
        ("admin", "Admin"),
    )
    username=None
    
    phone_number=models.CharField(validators=[phone_regex],max_length=15,blank=False,unique=True)
    email=models.CharField(max_length=60,blank=True,null=True,validators=[validate_email])
    full_name=models.CharField(max_length=70,blank=True,null=True)
    profile_picture=models.ImageField(upload_to='Users/profile_images')
    role=models.CharField(max_length=30,choices=ROLE_CHOICES,default='customer')
    mpin_hash=models.CharField(max_length=256,blank=True)
    is_staff=models.BooleanField(default=False)
    is_active=models.BooleanField(default=True)
    created_at=models.DateTimeField(auto_now_add=True)
    last_login=models.DateTimeField(auto_now=True)
    USERNAME_FIELD='phone_number'
    REQUIRED_FIELDS=[]
    objects=BaseManager()


    class Meta:
        verbose_name = "User"
        indexes = [models.Index(fields=["phone_number"])]
    def __str__(self):
        return f"{self.phone_number} ({self.role})"



class OneTimePassword(models.Model):
    user=models.ForeignKey(CustomUser,on_delete=models.CASCADE)   
    otp=models.CharField(max_length=6)
   
    purpose= models.CharField(
        max_length=20,
        choices=[("register", "Register"), ("login", "Login"), ("reset_mpin", "Reset MPIN")],
        default="register",
    )
    is_used      = models.BooleanField(default=False)
    created_at   = models.DateTimeField(auto_now_add=True)
    expires_at   = models.DateTimeField(null=True,blank=True)

    class Meta:
        ordering = ["-created_at"]
 
    def save(self, *args, **kwargs):
        # Set expiration to 10 minutes from creation if not already set
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=10)
        super().save(*args, **kwargs)
 
    def is_valid(self):
        return not self.is_used and self.expires_at > timezone.now()
 
    def __str__(self):
        return f"OTP for {self.user.phone_number} - {self.purpose}"