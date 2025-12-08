from rest_framework import serializers
from django.contrib.auth import password_validation as validators
from django.core.validators import validate_email
from django.apps import apps

from .models import (
    Profile,
)

from apps.Wallets.serializer import (
    WalletSerializer
)

from libs.serializers import (
    ModelSerializer,
    Serializer
)

class ProfileSerializer(ModelSerializer):

    citizen = serializers.StringRelatedField()
    wallet = WalletSerializer()

    class Meta:
        model = Profile
        exclude = [
            'user',
            'geodata',
            'token',
            'mobile_notification_id',
            'web_notification_id',
        ]

class ProfileUpdateSerializer(ModelSerializer):

    # citizen = serializers.StringRelatedField()

    def validate_phone(self, phone):
        index = 0
        for c in phone:
            if index == 0:
                if c in ["+", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]:
                    index += 1
                else:
                    raise serializers.ValidationError("Not a valid phone number")
            else:
                if c in ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]:
                    index += 1
                else:
                    raise serializers.ValidationError("Not a valid phone number")
        return phone

    class Meta:
        model = Profile
        fields = [
            'first_name',
            'last_name',
            'email',
            'phone',
            'citizen',
        ]

class AdminProfileSerializer(ModelSerializer):

    class Meta:
        model = Profile
        exclude = [
            'user',
            'geodata',
            'token',
            'mobile_notification_id',
            'web_notification_id',
            'is_terms_accepted',
            'is_pp_accepted',
            'signup_type',
            'citizen',
        ]

class CreateAdminProfileSerializer(ModelSerializer):

    password = serializers.CharField(
        max_length = 50,
    )
    re_password = serializers.CharField(
        max_length = 50,
    )

    def validate_password(self, password):
        try:
            validators.validate_password(password=password)
        except serializers.ValidationError as e:
            raise serializers.ValidationError(e.messages)
        return password

    def validate_email(self, email):
        if apps.get_model('auth.User').objects.filter(email=email).count() > 0:
            raise serializers.ValidationError("Already associated with other user.")
        try:
            validate_email(email)
        except Exception as e:
            raise serializers.ValidationError("Invalid Email Fromat. Please provide valid email.")
        return email
    
    def create(self, validated_data):
        profile = apps.get_model('Profiles.Profile').objects.create(
            first_name = validated_data['first_name'],
            last_name = validated_data['last_name'],
            email = validated_data['email'],
            is_terms_accepted = True,
            is_pp_accepted = True,
            profile_type="AD",
        )
        profile.user.set_password(validated_data['password'])
        return profile

    class Meta:
        model = Profile
        fields = [
            'first_name',
            'last_name',
            'email',
            'phone',
            'active',
            'password',
            're_password',

        ]

class EditAdminProfileSerializer(ModelSerializer):

    class Meta:
        model = Profile
        fields = [
            'first_name',
            'last_name',
            'phone',
            'active',
        ]