from django.db import models
from django.utils import timezone
from django.conf import settings
# If not using Postgres exclusively or want simpler JSON storage for now:
import json

# We will use Apps.Users.models.User. 
# Using string reference to avoid circular imports if possible, though safe here.
from Apps.Users.models import User


class MobileOTP(models.Model):
    """
    Model to store OTPs for mobile/WhatsApp verification.
    """
    PURPOSE_CHOICES = (
        ("mobile_verify", "Mobile Verification"),
        ("whatsapp_verify", "WhatsApp Verification"),
    )

    phone_number = models.CharField(max_length=20)
    code = models.CharField(max_length=10)
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["phone_number", "purpose", "code"]),
        ]

    def is_expired(self):
        return timezone.now() > self.expires_at

    def mark_used(self):
        self.used = True
        self.save()

    def __str__(self):
        return f"{self.phone_number} - {self.code}"


class Profiling(models.Model):
    """
    Model to store extended user profiling information (Questionnaire).
    linked OneToOne with User.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profiling")
    
    # Basic Information
    full_name = models.CharField(max_length=255, blank=True)
    gender = models.CharField(max_length=50, blank=True) # e.g., Male, Female, Other
    date_of_birth = models.DateField(null=True, blank=True)
    
    # Residence
    country = models.CharField(max_length=100, blank=True)
    state_region = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    primary_language = models.CharField(max_length=100, blank=True)

    # Contact & Identity
    mobile_number = models.CharField(max_length=20, blank=True)
    is_mobile_verified = models.BooleanField(default=False)
    
    whatsapp_number = models.CharField(max_length=20, blank=True)
    is_whatsapp_verified = models.BooleanField(default=False)
    
    education_level = models.CharField(max_length=100, blank=True)

    # Survey-Specific
    participated_in_online_surveys = models.BooleanField(default=False)
    
    # Store rewards as a list of strings. Using JSONField for flexibility.
    # In SQLite/Postgres this works fine with Django's JSONField.
    preferred_rewards = models.JSONField(default=list, blank=True) 

    # Consent
    consent_invitations = models.BooleanField(default=False)
    consent_data_usage = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profiling({self.user.email})"

