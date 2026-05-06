# Backend/ShareDrive/ShareDrive/settings.py

import os
from pathlib import Path
import environ

# Build paths inside the project
BASE_DIR = Path(__file__).resolve().parent.parent

# Initialize environ
env = environ.Env(
    DEBUG=(bool, False)
)

# Read .env file
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env('DEBUG')

ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=['localhost', '127.0.0.1'])

# Application definition
INSTALLED_APPS = [
    'daphne',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    "django.contrib.gis",  
    # Third-party
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    "channels",
    'rest_framework_gis', 
    
    # Your apps
    'authentication',
    "Customer",
    "Driver",
    "Owners",
    "Logistics",
    "Rides",
  
   
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'ShareDrive.urls'
AUTH_USER_MODEL = "authentication.CustomUser"

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'ShareDrive.wsgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': env('DB_ENGINE'),
        'NAME': env('DB_NAME'),
        'USER': env('DB_USER'),
        'PASSWORD': env('DB_PASSWORD'),
        'HOST': env('DB_HOST'),
        'PORT': env('DB_PORT'),
    }
}


import os
import platform

if platform.system() == "Windows":
    os.add_dll_directory(r"C:\OSGeo4W\bin")

GDAL_LIBRARY_PATH = r"C:\OSGeo4W\bin\gdal312.dll"
GEOS_LIBRARY_PATH = r"C:\OSGeo4W\bin\geos_c.dll"


ASGI_APPLICATION = 'ShareDrive.asgi.application'  # your_project name

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',  # For dev, use Redis in prod
    },
}

















# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media files
MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]

# REST Framework
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
   
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "100/day",
        "user": "1000/day",
    },
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
}
# ── JWT ─────────────────────────────────────────────────────
from datetime import timedelta
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME":  timedelta(hours=2),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=30),
    "ROTATE_REFRESH_TOKENS":  True,
    "AUTH_HEADER_TYPES":      ("Bearer",),
}