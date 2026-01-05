from rest_framework import serializers
from django.utils import timezone
from django.contrib.auth.models import Group, Permission
from .models import User, EmailOTP
from .countries import list_countries


class UserSerializer(serializers.ModelSerializer):
    """
    Enhanced User serializer with comprehensive user information.
    Returns all basic Django user parameters plus role and verification status.
    """
    role = serializers.CharField(source='profile_type', read_only=True)
    role_display = serializers.CharField(source='get_profile_type_display', read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "role",
            "role_display",
            "profile_type",
            "is_verified",
            "is_active",
            "is_staff",
            "is_superuser",
            "signup_type",
            "provider",
            "date_joined",
            "last_login",
        )
        read_only_fields = (
            "id",
            "is_verified",
            "date_joined",
            "last_login",
            "role",
            "role_display",
        )



class SignupSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    country = serializers.CharField(required=False, allow_blank=True)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists")
        return value

    def validate(self, data):
        if data.get("password") != data.get("confirm_password"):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return data

    def validate_country(self, value):
        if not value:
            return value
        countries = list_countries()
        names = [c["name"] for c in countries]
        codes = [c["code"] for c in countries]
        if value in names:
            return value
        if value.upper() in codes:
            # normalize to country name
            idx = codes.index(value.upper())
            return countries[idx]["name"]
        raise serializers.ValidationError("Invalid country")

    def create(self, validated_data):
        password = validated_data.pop("password")
        validated_data.pop("confirm_password", None)
        country = validated_data.pop("country", None)
        user = User.objects.create_user(password=password, **validated_data)
        user.is_active = True
        user.save()
        # Set country in profile if provided
        if country and hasattr(user, "profile"):
            user.profile.citizen = country
            user.profile.save()
        return user


class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField()
    purpose = serializers.ChoiceField(choices=[("signup", "signup"), ("login", "login"), ("reset", "reset")])

    def validate(self, data):
        try:
            otp = EmailOTP.objects.filter(email__iexact=data["email"], purpose=data["purpose"], code=data["code"], used=False).latest("created_at")
        except EmailOTP.DoesNotExist:
            raise serializers.ValidationError("Invalid or expired code")
        if otp.is_expired() or otp.used:
            raise serializers.ValidationError("Invalid or expired code")
        data["otp_obj"] = otp
        return data


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, required=False)
    use_otp = serializers.BooleanField(default=False)


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=8)


# ===== ADMIN SERIALIZERS =====

class AdminUserCreateSerializer(serializers.ModelSerializer):
    """
    Admin serializer for creating users with role assignment.
    Allows admin to set all user fields including role, groups, and permissions.
    """
    password = serializers.CharField(write_only=True, required=False, min_length=8)
    groups = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Group.objects.all(), required=False
    )
    user_permissions = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Permission.objects.all(), required=False
    )

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "password",
            "first_name",
            "last_name",
            "profile_type",
            "signup_type",
            "is_active",
            "is_staff",
            "is_superuser",
            "is_verified",
            "provider",
            "provider_id",
            "groups",
            "user_permissions",
        )
        read_only_fields = ("id",)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists")
        return value

    def create(self, validated_data):
        groups = validated_data.pop("groups", [])
        user_permissions = validated_data.pop("user_permissions", [])
        password = validated_data.pop("password", None)

        # Create user
        user = User.objects.create(**validated_data)

        # Set password if provided
        if password:
            user.set_password(password)
        else:
            # Generate a random unusable password if not provided
            user.set_unusable_password()

        user.save()

        # Assign groups and permissions
        if groups:
            user.groups.set(groups)
        if user_permissions:
            user.user_permissions.set(user_permissions)

        return user


class AdminUserUpdateSerializer(serializers.ModelSerializer):
    """
    Admin serializer for updating users with role and permission management.
    Allows admin to update user fields, roles, groups, and permissions.
    """
    password = serializers.CharField(write_only=True, required=False, min_length=8)
    groups = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Group.objects.all(), required=False
    )
    user_permissions = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Permission.objects.all(), required=False
    )
    role_display = serializers.CharField(source='get_profile_type_display', read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "password",
            "first_name",
            "last_name",
            "profile_type",
            "role_display",
            "signup_type",
            "is_active",
            "is_staff",
            "is_superuser",
            "is_verified",
            "provider",
            "provider_id",
            "groups",
            "user_permissions",
            "date_joined",
            "last_login",
        )
        read_only_fields = ("id", "date_joined", "last_login", "role_display")

    def validate_email(self, value):
        # Allow same email for current user, but check for duplicates
        if self.instance and self.instance.email.lower() == value.lower():
            return value
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists")
        return value

    def update(self, instance, validated_data):
        groups = validated_data.pop("groups", None)
        user_permissions = validated_data.pop("user_permissions", None)
        password = validated_data.pop("password", None)

        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Update password if provided
        if password:
            instance.set_password(password)

        instance.save()

        # Update groups and permissions if provided
        if groups is not None:
            instance.groups.set(groups)
        if user_permissions is not None:
            instance.user_permissions.set(user_permissions)

        return instance


class AdminUserListSerializer(serializers.ModelSerializer):
    """
    Admin serializer for listing users with comprehensive information including groups and permissions.
    """
    role_display = serializers.CharField(source='get_profile_type_display', read_only=True)
    groups = serializers.StringRelatedField(many=True, read_only=True)
    user_permissions_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "profile_type",
            "role_display",
            "is_verified",
            "is_active",
            "is_staff",
            "is_superuser",
            "signup_type",
            "provider",
            "date_joined",
            "last_login",
            "groups",
            "user_permissions_count",
        )

    def get_user_permissions_count(self, obj):
        return obj.user_permissions.count()
