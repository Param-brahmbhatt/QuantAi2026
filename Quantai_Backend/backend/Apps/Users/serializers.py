from rest_framework import serializers
from django.utils import timezone
from .models import User, EmailOTP
from .countries import list_countries


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "first_name", "last_name", "is_verified")
        read_only_fields = ("id", "is_verified")



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
