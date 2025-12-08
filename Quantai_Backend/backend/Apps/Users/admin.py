from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django import forms
from .models import User, EmailOTP, Profile

# --- User Creation Form for Admin ---
class UserCreationForm(forms.ModelForm):
    password1 = forms.CharField(label="Password", widget=forms.PasswordInput)
    password2 = forms.CharField(label="Password confirmation", widget=forms.PasswordInput)

    class Meta:
        model = User
        fields = ("email", "first_name", "last_name")

    def clean_password2(self):
        p1 = self.cleaned_data.get("password1")
        p2 = self.cleaned_data.get("password2")
        if p1 and p2 and p1 != p2:
            raise forms.ValidationError("Passwords don't match")
        return p2

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user

# --- Custom User Admin ---
class UserAdmin(BaseUserAdmin):
    add_form = UserCreationForm
    model = User
    list_display = ("email", "first_name", "last_name", "profile_type", "signup_type", "is_verified", "is_active", "is_staff")
    list_filter = ("is_staff", "is_verified", "is_active", "profile_type", "signup_type")
    search_fields = ("email", "first_name", "last_name")
    ordering = ("email",)
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal info", {"fields": ("first_name", "last_name")}),
        ("Profile", {"fields": ("profile_type", "signup_type")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "is_verified", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "first_name", "last_name", "profile_type", "signup_type", "password1", "password2"),
        }),
    )

# --- EmailOTP Admin ---
@admin.register(EmailOTP)
class EmailOTPAdmin(admin.ModelAdmin):
    list_display = ("email", "purpose", "code", "used", "created_at", "expires_at")
    search_fields = ("email", "code")
    list_filter = ("purpose", "used")

# --- Profile Admin ---
@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("email", "first_name", "last_name", "phone", "profile_type", "signup_type", "is_mobile_verified", "is_email_verified")
    search_fields = ("email", "first_name", "last_name")
    list_filter = ("profile_type", "signup_type", "is_mobile_verified", "is_email_verified")

# --- Register User with custom admin ---
admin.site.register(User, UserAdmin)
