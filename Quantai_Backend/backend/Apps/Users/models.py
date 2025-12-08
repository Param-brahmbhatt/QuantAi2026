from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.utils import timezone
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django_countries.fields import CountryField
import uuid as uuid_lib


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_SUPERUSER = "SU"
    ROLE_DEVELOPER = "DV"
    ROLE_ADMIN = "AD"
    ROLE_ADMIN_MANAGER = "AM"
    ROLE_CLIENT = "CL"
    ROLE_CLIENT_MANAGER = "CM"
    ROLE_AUDIENCE = "AU"
    ROLE_CHOICES = [
        (ROLE_SUPERUSER, "Superuser"),
        (ROLE_DEVELOPER, "Developer"),
        (ROLE_ADMIN, "Admin"),
        (ROLE_ADMIN_MANAGER, "Admin Manager"),
        (ROLE_CLIENT_MANAGER, "Client Manager"),
        (ROLE_CLIENT, "Client"),
        (ROLE_AUDIENCE, "Audience"),
    ]
    SIGNUP_SO = "SO"
    SIGNUP_SF = "SF"
    SIGNUP_TYPE_CHOICES = [
        (SIGNUP_SO, "Social"),
        (SIGNUP_SF, "Self"),
    ]

    email = models.EmailField(unique=True, max_length=255)
    first_name = models.CharField(max_length=120, blank=True)
    last_name = models.CharField(max_length=120, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    profile_type = models.CharField(
        max_length=3, choices=ROLE_CHOICES, default=ROLE_AUDIENCE
    )
    signup_type = models.CharField(max_length=2, choices=SIGNUP_TYPE_CHOICES, default=SIGNUP_SF)
    provider = models.CharField(max_length=50, blank=True, null=True)
    provider_id = models.CharField(max_length=255, blank=True, null=True)

    objects = UserManager()
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []
    def __str__(self):
        return self.email

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    uuid = models.UUIDField(default=uuid_lib.uuid4, editable=False, unique=True)
    first_name = models.CharField(max_length=120, blank=True)
    last_name = models.CharField(max_length=120, blank=True)
    phone = models.CharField(max_length=25, blank=True)
    citizen = CountryField(blank=True, null=True)
    social_id = models.CharField(max_length=255, blank=True)
    mobile_notification_id = models.CharField(max_length=255, blank=True)
    web_notification_id = models.CharField(max_length=255, blank=True)
    is_mobile_verified = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)
    is_terms_accepted = models.BooleanField(default=False)
    is_pp_accepted = models.BooleanField(default=False) # privacy policy
    email = models.EmailField(unique=True)
    profile_type = models.CharField(max_length=3, choices=User.ROLE_CHOICES)
    signup_type = models.CharField(max_length=2, choices=User.SIGNUP_TYPE_CHOICES)
    
    def __str__(self):
        return self.email
    
    def save(self, *args, **kwargs):
        # Auto-fill from User model if not already set
        if self.user:
            if not self.first_name and self.user.first_name:
                self.first_name = self.user.first_name
            if not self.last_name and self.user.last_name:
                self.last_name = self.user.last_name
            if not self.email and self.user.email:
                self.email = self.user.email
            if not self.profile_type and self.user.profile_type:
                self.profile_type = self.user.profile_type
            if not self.signup_type and self.user.signup_type:
                self.signup_type = self.user.signup_type
            if not self.social_id and self.user.provider_id:
                self.social_id = self.user.provider_id
        super().save(*args, **kwargs)

class EmailOTP(models.Model):
    PURPOSE_CHOICES = (
        ("signup", "Signup"),
        ("login", "Login"),
        ("reset", "Password Reset"),
    )

    user = models.ForeignKey(
        "User", related_name="otps", on_delete=models.CASCADE, null=True, blank=True
    )
    email = models.EmailField()
    code = models.CharField(max_length=10)
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)

    class Meta:
        indexes = [models.Index(fields=["email", "purpose"])]

    def is_expired(self):
        return timezone.now() > self.expires_at

    def mark_used(self):
        self.used = True
        self.save()


# Django Signals to auto-create and sync Profile with User
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Signal to automatically create a Profile when a User is created.
    """
    if created:
        Profile.objects.create(
            user=instance,
            first_name=instance.first_name,
            last_name=instance.last_name,
            email=instance.email,
            profile_type=instance.profile_type,
            signup_type=instance.signup_type,
            social_id=instance.provider_id or '',
        )


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """
    Signal to automatically update Profile when User is updated.
    """
    if hasattr(instance, 'profile'):
        profile = instance.profile
        profile.first_name = instance.first_name
        profile.last_name = instance.last_name
        profile.email = instance.email
        profile.profile_type = instance.profile_type
        profile.signup_type = instance.signup_type
        if instance.provider_id:
            profile.social_id = instance.provider_id
        profile.save()
    else:
        # If profile doesn't exist, create it
        Profile.objects.create(
            user=instance,
            first_name=instance.first_name,
            last_name=instance.last_name,
            email=instance.email,
            profile_type=instance.profile_type,
            signup_type=instance.signup_type,
            social_id=instance.provider_id or '',
        )


