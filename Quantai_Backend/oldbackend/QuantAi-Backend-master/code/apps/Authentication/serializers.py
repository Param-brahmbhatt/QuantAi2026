from django.utils import timezone
from django.conf import settings
from django.contrib.auth import password_validation as validators
from django.core.validators import validate_email
from django.apps import apps
from django.contrib.auth import authenticate
from oauth2_provider.models import AccessToken

from rest_framework.utils import json
from rest_framework import serializers
from oauth2_provider.models import Application
from django_q.tasks import async_task

import facebook
import requests
import jwt
from uuid import uuid4

from libs.email import (
    WelcomeEmail,
    PasswordResetEmail,
    EmailVerificationEmail,
)

from libs.serializers import (
    ModelSerializer,
    Serializer
)

class SocialAuthTokenSerializer(Serializer):
    provider = serializers.ChoiceField(
        choices=(
            ('FB', 'Facebook'),
            ('GO', 'Google'),
            ('AP', 'Apple'),
            ('TW', 'Twitter')
        )
    )
    client_id = serializers.CharField(max_length=2000)
    token = serializers.CharField(max_length=2000)
    mobile_notification_id = serializers.CharField(max_length=50, required=False)
    web_notification_id = serializers.CharField(max_length=50, required=False)

    def validate_client_id(self, client_id):
        try:
            application = Application.objects.get(client_id=client_id)
            return client_id
        except Exception as e:
            raise serializers.ValidationError("Invalid client.")
        
    def get_user_info_from_provider(self):
        provider = self.validated_data['provider']
        access_token = self.validated_data['token']
        
        if provider == 'FB':
            graph = facebook.GraphAPI(access_token=access_token)
            user_info = graph.get_object(id='me',
                fields='email, id, first_name, middle_name, last_name,picture.type(large)'
            )
            return user_info
        elif provider == 'GO':
            payload = {'access_token': access_token }
            res = requests.get('https://www.googleapis.com/oauth2/v2/userinfo', params=payload)
            data = json.loads(res.text)
            # match with our database and facebook fields
            data['first_name'] = data.get('given_name','')
            data['last_name'] = data.get('family_name','')
            return data
        elif  provider == 'AP':

            ACCESS_TOKEN_URL = 'https://appleid.apple.com/auth/token'

            client_secret = self.get_client_secret()

            headers = {'content-type': "application/x-www-form-urlencoded"}
            data = {
                'client_id': settings.CLIENT_ID,
                'client_secret': client_secret,
                'code': access_token,
                'grant_type': 'authorization_code',
            }

            res = requests.post(ACCESS_TOKEN_URL, data=data, headers=headers)
            response_dict = res.json()
            id_token = response_dict.get('id_token', None)

            data = {}
            if id_token:
                decoded = jwt.decode(id_token, '', verify=False)
                data.update({'email': decoded['email']}) if 'email' in decoded else None
                data.update({'id': decoded['sub']}) if 'sub' in decoded else None

            return data

    def get_client_secret(self):
        headers = {
            'kid': settings.SOCIAL_AUTH_APPLE_KEY_ID
        }

        payload = {
            'iss': settings.SOCIAL_AUTH_APPLE_TEAM_ID,
            'iat': timezone.now(),
            'exp': timezone.now() + timezone.timedelta(days=180),
            'aud': 'https://appleid.apple.com',
            'sub': settings.CLIENT_ID,
        }

        client_secret = jwt.encode(
            payload, 
            settings.SOCIAL_AUTH_APPLE_PRIVATE_KEY, 
            algorithm='ES256', 
            headers=headers
        ).decode("utf-8")
        
        return client_secret
    
    def get_application(self):
        return Application.objects.get(client_id=self.validated_data['client_id'])

    def save(self):
        data = self.get_user_info_from_provider()
        provider = self.validated_data['provider']
        if provider == 'GO':
            if apps.get_model('Profiles.Profile').objects.filter( email = data['email'] ).count() > 0:
                profile = apps.get_model('Profiles.Profile').objects.get(email = data['email'])
                if not profile.social_id:
                    profile.social_id = data['id']
                if profile.signup_type != "SO":
                    profile.signup_type == "SO"
                profile.save()
            else:
                profile = apps.get_model('Profiles.Profile').objects.create(
                    first_name = data['first_name'],
                    last_name = data['last_name'],
                    email = data['email'],
                    is_terms_accepted = True,
                    is_pp_accepted = True,
                    profile_type="AU",
                    token = uuid4().hex,
                    signup_type="SO",
                    social_id = data['id']
                )
                # profile.user.set_password(validated_data['password'])
                # profile.user.save()
                # async_task(
                #     EmailVerificationEmail,
                #     profile=profile
                # )
            return profile.user

class SignUpSerializer(Serializer):
    client_id = serializers.CharField(
        max_length=50,
    )
    first_name = serializers.CharField(
        max_length=50,
        write_only=True,
    )
    last_name = serializers.CharField(
        max_length=50,
        write_only=True,
    )
    email = serializers.CharField(
        max_length=50
    )
    password = serializers.CharField(
        max_length=50
    )
    citizen = serializers.CharField(
        max_length=50
    )
    re_password = serializers.CharField(
        max_length=50
    )
    is_terms_accepted = serializers.BooleanField(
        default=False
    )
    is_pp_accepted = serializers.BooleanField(
        default=False
    )

    def validate_client_id(self, client_id):
        try:
            Application.objects.get(client_id=client_id)
        except Exception as e: 
            raise serializers.ValidationError("Invalid Client ID")
        return client_id
        
    def validate_password(self, password):
        try:
            validators.validate_password(password=password)
        except serializers.ValidationError as e:
            raise serializers.ValidationError(e.messages)
        return password
    
    def validate_re_password(self, re_password):
        password = self.initial_data.get('password')
        if password != re_password:
            raise serializers.ValidationError("Passwords does not match.")
        return re_password

    def validate_email(self, email):
        if apps.get_model('auth.User').objects.filter(email=email).count() > 0:
            raise serializers.ValidationError("Already associated with other user.")
        try:
            validate_email(email)
        except Exception as e:
            raise serializers.ValidationError("Invalid Email Fromat. Please provide valid email.")
        return email

    def validate_is_terms_accepted(self, is_terms_accepted): 
        if not is_terms_accepted:
            raise serializers.ValidationError("Please accept terms and conditions")
        return is_terms_accepted
    
    def validate_is_pp_accepted(self, is_pp_accepted): 
        if not is_pp_accepted:
            raise serializers.ValidationError("Please accept Privacy Policy")
        return is_pp_accepted
    
    def get_application(self):
        return Application.objects.get(client_id=self.validated_data['client_id'])
    
    def create(self, validated_data):
        profile = apps.get_model('Profiles.Profile').objects.create(
            first_name = validated_data['first_name'],
            last_name = validated_data['last_name'],
            email = validated_data['email'],
            is_terms_accepted = validated_data['is_terms_accepted'],
            is_pp_accepted = validated_data['is_pp_accepted'],
            profile_type="AU",
            token = uuid4().hex,
            signup_type="SF",
            citizen = validated_data['citizen'],
        )
        profile.user.set_password(validated_data['password'])
        profile.user.save()
        # async_task(
        #     EmailVerificationEmail,
        #     profile=profile
        # )
        return profile

class LoginSerializer(Serializer):
    client_id = serializers.CharField(
        max_length=50,
    )
    email = serializers.CharField(max_length=255)
    password = serializers.CharField(
        trim_whitespace=False,
        max_length=128,
        write_only=True
    )
    mobile_notification_id = serializers.CharField(
        max_length=100,
        required = False,
    )
    web_notification_id = serializers.CharField(
        max_length=100,
        required = False,
    )

    def validate_client_id(self, client_id):
        try:
            application = Application.objects.get(client_id=client_id)
            return client_id
        except Exception as e:
            raise serializers.ValidationError("Invalid client")

    def get_application(self):
        return Application.objects.get(client_id=self.validated_data['client_id'])

    def validate(self, data):
        username = data.get('email')
        password = data.get('password')

        if username and password:
            user = authenticate(request=self.context.get('request'),
                                username=username, password=password)
            if not user:
                msg = 'Unable to log in with provided credentials.'
                raise serializers.ValidationError(msg, code='authorization')
            if not user.profile.active:
                msg = 'Account disabled, Please contact admin.'
                raise serializers.ValidationError(msg, code='authorization')
        else:
            msg = 'Must include "username" and "password".'
            raise serializers.ValidationError(msg, code='authorization')

        data['user'] = user
        return data
    
class SendPasswordResetSerializer(Serializer):
    client_id = serializers.CharField(
        max_length=50,
    )
    email = serializers.CharField(max_length=255)

    def validate_client_id(self, client_id):
        try:
            application = Application.objects.get(client_id=client_id)
            return client_id
        except Exception as e:
            raise serializers.ValidationError("Invalid client.")
        
    def validate_email(self, email):
        try:
            self.profile = apps.get_model('Profiles.Profile').objects.get(email=email)
        except Exception as e:
            raise serializers.ValidationError("Email ID is not registered with us.")

    def send_password_reset(self):
        async_task(
            PasswordResetEmail,
            profile=self.profile
        ) 

class PasswordResetSerializer(Serializer):
    client_id = serializers.CharField(
        max_length=50,
    )
    password = serializers.CharField(
        max_length=50
    )
    re_password = serializers.CharField(
        max_length=50
    )
    token = serializers.CharField(
        max_length=100
    )

    def validate_token(self, token):
        try:
            self.profile = apps.get_model('Profiles.Profile').objects.get( token = token )
        except apps.get_model('Profiles.Profile').DoesNotExist as e:
            raise serializers.ValidationError("Invalid Token")
        except serializers.ValidationError as e:
            raise serializers.ValidationError("Invalid Token")
        return token

    def validate_client_id(self, client_id):
        try:
            application = Application.objects.get(client_id=client_id)
            return client_id
        except Exception as e:
            raise serializers.ValidationError("Invalid client.")

    def validate_password(self, password):
        try:
            validators.validate_password(password=password)
        except serializers.ValidationError as e:
            raise serializers.ValidationError(e.messages)
        return password
    
    def validate_re_password(self, re_password):
        password = self.initial_data.get('password')
        if password != re_password:
            raise serializers.ValidationError("Passwords does not match.")
        return re_password
    
    def update_password(self):
        self.profile.user.set_password(self.validated_data['password'])
        self.profile.user.save()

class PasswordChangeSerializer(Serializer):

    password = serializers.CharField(
        max_length=50
    )
    re_password = serializers.CharField(
        max_length=50
    )

    def validate_password(self, password):
        try:
            validators.validate_password(password=password)
        except serializers.ValidationError as e:
            raise serializers.ValidationError(e.messages)
        
        return password
    
    def validate_re_password(self, re_password):
        password = self.initial_data.get('password')
        if password != re_password:
            raise serializers.ValidationError("Passwords does not match.")
        return re_password
    
    def update_password(self):
        self.context.get('request').user.set_password(self.validated_data['password'])
        self.context.get('request').user.save()
        AccessToken.objects.get(token=self.context.get('request').META.get('HTTP_AUTHORIZATION').split(" ")[1]).delete()

class EmailVerificationSerializer(Serializer):

    client_id = serializers.CharField(
        max_length=50,
    )

    token = serializers.CharField(
        max_length=100
    )

    def validate_token(self, token):
        try:
            apps.get_model('Profiles.Profile').objects.get( token = token )
        except apps.get_model('Profiles.Profile').DoesNotExist as e:
            raise serializers.ValidationError("Invalid Token")
        except serializers.ValidationError as e:
            raise serializers.ValidationError("Invalid Token")
        return token
    
    def validate_client_id(self, client_id):
        try:
            application = Application.objects.get(client_id=client_id)
            return client_id
        except Exception as e:
            raise serializers.ValidationError("Invalid client")
    
    def update_token_status(self):
        profile = apps.get_model('Profiles.Profile').objects.get( token = self.validated_data['token'] )
        profile.is_email_verified = True
        profile.email_verification_token = False
        profile.save()
        tx = profile.transactions.create(
            total_amount = settings.INITIAL_LOGIN_REWARDS,
            t_type = "DEP",
        )
        tx.status = "SU"
        tx.save()
        return profile

