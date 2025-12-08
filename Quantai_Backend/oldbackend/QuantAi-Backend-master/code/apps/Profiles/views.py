from django.conf import settings
from django.utils import timezone
from django.apps import apps

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from rest_framework.pagination import PageNumberPagination
from rest_framework.settings import api_settings

from oauth2_provider.models import AccessToken, Application
from oauthlib.common import generate_client_id, UNICODE_ASCII_CHARACTER_SET

from libs.permissions import AllowAdminOnly

from .serializers import (
    ProfileSerializer,
    ProfileUpdateSerializer,
    AdminProfileSerializer,
    CreateAdminProfileSerializer,
    EditAdminProfileSerializer,
)

class MyProfileView(APIView):

    def get(self, request, *args, **kwargs):
        return Response(
            ProfileSerializer(request.user.profile).data,
            status=200
        )
    
class MyProfileUpdateView(APIView):

    def post(self, request, *args, **kwargs):
        serializer = ProfileUpdateSerializer(
            data=request.data,
            instance = request.user.profile,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            ProfileSerializer(instance=serializer.instance).data,
            status=200
        )
    
    def put(self, request, *args, **kwargs):
        serializer = ProfileUpdateSerializer(
            data=request.data,
            instance = request.user.profile,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            ProfileSerializer(instance=serializer.instance).data,
            status=200
        )

class AdminProfileView(APIView, PageNumberPagination):

    permission_classes = (*api_settings.DEFAULT_PERMISSION_CLASSES, AllowAdminOnly,)
    # page_size = api_settings.PAGE_SIZE
    page_size = 1000

    def get(self, request, *args, **kwargs):
        ptype = request.GET.get('type', None)
        id = request.GET.get('id', None)
        if not id:
            if ptype:
                return self.get_paginated_response(
                    AdminProfileSerializer(
                        self.paginate_queryset(
                            # apps.get_model('Profiles.Profile').objects.filter(
                            #     profile_type = ptype
                            # ),
                            apps.get_model('Profiles.Profile').objects.all(),
                            request=request,
                            view=self,
                        ),
                        many = True,
                        context={'request': request},
                    ).data,
                )
            else:
                return Response(
                    {
                        'detail' : "Please provide 'type' as get parameter"
                    },
                    status=400
                )
        else:
            try:
                instance = apps.get_model('Profiles.Profile').objects.get(id = id)
            except apps.get_model('Profiles.Profile').DoesNotExist as e:
                return Response(status=404)
            except Exception as e:
                return Response(status=500)
            return Response(
                AdminProfileSerializer(instance, context={'request': request}).data,
                status=200
            )
    
    def post(self, request, *args, **kwargs):
        serializer = CreateAdminProfileSerializer(data = request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        return Response(
            AdminProfileSerializer(instance, context={'request': request}).data,
            status=200,
        )

    def put(self, request, *args , **kwargs):
        id = request.GET.get('id', None)
        if id:
            try:
                instance = apps.get_model('Profiles.Profile').objects.get(id = id)
            except apps.get_model('Profiles.Profile').DoesNotExist as e:
                return Response(status=404)
            except Exception as e:
                return Response(status=500)
            if instance.profile_type not in ["AD","CL"]:
                return Response(
                    {
                        'detail' : 'Can not edit this profile',
                    },
                    status=400,
                )
            serializer = EditAdminProfileSerializer(
                data = request.data, 
                instance= instance,
                partial=True,
                context={'request': request}
            )
            serializer.is_valid(raise_exception=True)
            instance = serializer.save()
            return Response(
                AdminProfileSerializer(instance, context={'request': request}).data,
                status=200
            )
        else:
            return Response(
                {
                    'detail' : "invalid id"
                },
                status=400,
            )

    def delete(self, request, *args, **kwargs):
        id = request.GET.get('id', None)
        if id:
            try:
                instance = apps.get_model('Profiles.Profile').objects.get(id = id)
            except apps.get_model('Profiles.Profile').DoesNotExist as e:
                return Response(status=404)
            except Exception as e:
                return Response(status=500)
            instance.active = False
            instance.save()
            return Response(status=200)
        else:
            return Response(
                {
                    'detail' : "invalid id"
                },
                status=400,
            )

