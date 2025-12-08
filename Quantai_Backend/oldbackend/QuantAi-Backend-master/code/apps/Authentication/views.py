from django.conf import settings
from django.utils import timezone
from django.apps import apps

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions

from oauth2_provider.models import AccessToken, Application
from oauthlib.common import generate_client_id, UNICODE_ASCII_CHARACTER_SET
from django_q.tasks import async_task

from uuid import uuid4

from libs.permissions import AllowAdminOnly
from libs.email import (
    WelcomeEmail,
    EmailVerificationEmail,
    PasswordResetEmail,
    QuestionairAssignedEmail
)

from .serializers import (
    SocialAuthTokenSerializer,
    SignUpSerializer,
    LoginSerializer,
    SendPasswordResetSerializer,
    PasswordResetSerializer,
    PasswordChangeSerializer,
    EmailVerificationSerializer,
)

from apps.Projects.tasks import (
    AssignSurveyProjectToPerticularProfile
)

from apps.Profiles.serializers import (
    ProfileSerializer
)

class SignupView(APIView):

    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        serializer = SignUpSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        profile = serializer.save()
        AccessToken.objects.filter(
            user=profile.user,
            application=serializer.get_application()
        ).delete()
        token = AccessToken.objects.create(
            user=profile.user,
            application=serializer.get_application(),
            expires=timezone.now() + settings.TOKEN_EXPIRE_TIMEDELTA,
            scope='read write',
            token=generate_client_id(
                length=40,
                chars=UNICODE_ASCII_CHARACTER_SET
            )
        )
        response_data = {}
        response_data['profile'] = ProfileSerializer(profile).data
        response_data['access_token'] = token.token
        response_data['token_expires'] = token.expires
        return Response(
            response_data,
            status=200
        )


class SocialAuthView(APIView):

    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        serializer = SocialAuthTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token = AccessToken.objects.create(
            user=user,
            application=serializer.get_application(),
            expires=timezone.now() + settings.TOKEN_EXPIRE_TIMEDELTA,
            scope='read write',
            token=generate_client_id(
                length=40,
                chars=UNICODE_ASCII_CHARACTER_SET
            )
        )
        response_data = {}
        response_data['profile'] = ProfileSerializer(user.profile).data
        response_data['access_token'] = token.token
        response_data['token_expires'] = token.expires
        return Response(
            response_data,
            status=200
        )


class LoginView(APIView):
    
    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        if 'mobile_notification_id' in serializer.validated_data.keys():
            user.profile.mobile_notification_id = serializer.validated_data['mobile_notification_id']
            user.profile.save()
        if 'web_notification_id' in serializer.validated_data.keys():
            user.profile.web_notification_id = serializer.validated_data['web_notification_id']
            user.profile.save() 
        token = AccessToken.objects.create(
            user=user,
            application=serializer.get_application(),
            expires=timezone.now() + settings.TOKEN_EXPIRE_TIMEDELTA,
            scope='read write',
            token=generate_client_id(
                length=40,
                chars=UNICODE_ASCII_CHARACTER_SET
            )
        )
        response_data = {}
        response_data['profile'] = ProfileSerializer(user.profile).data
        response_data['access_token'] = token.token
        response_data['token_expires'] = token.expires
        return Response(
            response_data,
            status=200
        )


class LogoutView(APIView):

    def get(self, request, *args, **kwargs):
        AccessToken.objects.get(token=request.META.get('HTTP_AUTHORIZATION').split(" ")[1]).delete()
        return Response(
            status=200
        )
    

class PasswordResetEmailSendView(APIView):

    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        serializer = SendPasswordResetSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.send_password_reset()
        return Response(
            status=200
        )
    

class PasswordResetView(APIView):

    permission_classes = (permissions.AllowAny,)
    
    def post(self, request, *args, **kwargs):
        serializer = PasswordResetSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.update_password()
        return Response(
            status=200
        )


class PasswordChangeView(APIView):

    def post(self, request, *args, **kwargs):
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.update_password()
        return Response(
            status=200
        )


class EmailVerificationView(APIView):

    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        serializer = EmailVerificationSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        profile = serializer.update_token_status()
        async_task(
            WelcomeEmail,
            profile=profile
        )
        async_task(
            AssignSurveyProjectToPerticularProfile,
            profile=profile,
        )
        return Response(
            status=200
        )
        

class ResendVerificationEmailView(APIView):

    def get(self, request, *args, **kwargs):
        if not request.user.profile.is_email_verified:
            profile = request.user.profile
            profile.token = uuid4().hex
            profile.save()
            async_task(
                EmailVerificationEmail,
                profile=profile
            )
            return Response(
                status=200
            )
        else:
            return Response(
                {
                    'non_field_errors' : 'Email already verified.'
                },
                status=400
            )