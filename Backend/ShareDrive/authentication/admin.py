from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, OneTimePassword

class CustomUserAdmin(UserAdmin):
   
    
    list_display = ['phone_number', "role",'email', 'first_name', 'is_staff', 'is_active','role']
    
    fieldsets = (
        (None, {'fields': ('phone_number', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'email')}),
        ('Permissions', {'fields': ('is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('phone_number', 'password1', 'password2', 'is_staff', 'is_active'),
        }),
    )
    
    search_fields = ['phone_number', 'email']
    ordering = ['phone_number']

admin.site.register(CustomUser,CustomUserAdmin)  
class OneTimePasswordAdmin(admin.ModelAdmin):
    list_display = ['user', 'otp', 'purpose', 'is_used', 'created_at', 'expires_at', 'is_valid_display']
    list_filter = ['purpose', 'is_used', 'created_at']
    search_fields = ['user__phone_number', 'user__email', 'otp']
    readonly_fields = ['created_at', 'expires_at']
    ordering = ['-created_at']
    
    def is_valid_display(self, obj):
        return obj.is_valid()
    is_valid_display.boolean = True
    is_valid_display.short_description = 'Valid'


admin.site.register(OneTimePassword,OneTimePasswordAdmin)  