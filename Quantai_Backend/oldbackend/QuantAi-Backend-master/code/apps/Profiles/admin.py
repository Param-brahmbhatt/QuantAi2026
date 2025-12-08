from django.contrib import admin

from .models import (
    Profile,
)


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ["id", "email", "profile_type", "signup_type", "is_email_verified"]
