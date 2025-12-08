from django.shortcuts import render
from django.apps import apps

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from rest_framework.pagination import PageNumberPagination
from rest_framework.settings import api_settings

from django_countries import countries

from libs.permissions import AllowAdminOnly

from .serializers import (
    RewardSettingSerializer,
    RedemptionSettingSerializer
)

class CountriesListView(APIView):

    permission_classes = (permissions.AllowAny,)

    def get(self, request, *args, **kwargs):
        return Response(
            {
                'dict' : dict(countries),
                'list' : list(countries),
            },
            status=200
        )
    
class RewardSettingsView(APIView, PageNumberPagination):

    permission_classes = (*api_settings.DEFAULT_PERMISSION_CLASSES, AllowAdminOnly,)
    page_size = api_settings.PAGE_SIZE

    def get(self, request, *args, **kwargs):
        id = request.GET.get('id', None)
        if id:
            try:
                instance = apps.get_model('SystemSettings.RewardSetting').objects.get(id = id)
            except apps.get_model('SystemSettings.RewardSetting').DoesNotExist as e:
                return Response(status=404)
            except Exception as e:
                return Response(status=500)
            return Response(
                RewardSettingSerializer(instance).data,
                status=200,
            )
        else:
            return self.get_paginated_response(
                RewardSettingSerializer(
                    self.paginate_queryset(
                        apps.get_model('SystemSettings.RewardSetting').objects.all(),
                        request=request,
                        view=self,
                    ),
                    many = True,
                ).data,
            )

    def post(self, request, *args, **kwargs):
        serializer = RewardSettingSerializer(data = request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=200)
    
    def put(self, request, *args, **kwargs):
        id = request.GET.get('id', None)
        if id:
            try:
                instance = apps.get_model('SystemSettings.RewardSetting').objects.get(id = id)
            except apps.get_model('SystemSettings.RewardSetting').DoesNotExist as e:
                return Response(status=404)
            except Exception as e:
                return Response(status=500)
            serializer = RewardSettingSerializer(
                data = request.data, 
                instance=instance,
                partial=True,
                context={'request': request}
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(status=200)
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
                instance = apps.get_model('SystemSettings.RewardSetting').objects.get(id = id)
            except apps.get_model('SystemSettings.RewardSetting').DoesNotExist as e:
                return Response(status=404)
            except Exception as e:
                return Response(status=500)
            if instance.active:
                return Response(
                    {
                        'detail' : "Can not delete active reward settings"
                    },
                    status=400,
                )
            else:
                instance.delete()
                return Response(status=200)
        return Response(
                {
                    'detail' : "invalid id"
                },
                status=400,
            )
        
class RedemptionSettingsView(APIView, PageNumberPagination):

    permission_classes = (*api_settings.DEFAULT_PERMISSION_CLASSES, AllowAdminOnly,)
    page_size = api_settings.PAGE_SIZE

    def get(self, request, *args, **kwargs):
        id = request.GET.get('id', None)
        if id:
            try:
                instance = apps.get_model('SystemSettings.RedemptionSetting').objects.get(id = id)
            except apps.get_model('SystemSettings.RedemptionSetting').DoesNotExist as e:
                return Response(status=404)
            except Exception as e:
                return Response(status=500)
            return Response(
                RedemptionSettingSerializer(instance).data,
                status=200,
            )
        else:
            return self.get_paginated_response(
                RedemptionSettingSerializer(
                    self.paginate_queryset(
                        apps.get_model('SystemSettings.RedemptionSetting').objects.all(),
                        request=request,
                        view=self,
                    ),
                    many = True,
                ).data,
            )

    def post(self, request, *args, **kwargs):
        serializer = RedemptionSettingSerializer(data = request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=200)
    
    def put(self, request, *args, **kwargs):
        id = request.GET.get('id', None)
        if id:
            try:
                instance = apps.get_model('SystemSettings.RedemptionSetting').objects.get(id = id)
            except apps.get_model('SystemSettings.RedemptionSetting').DoesNotExist as e:
                return Response(status=404)
            except Exception as e:
                return Response(status=500)
            serializer = RedemptionSettingSerializer(
                data = request.data, 
                instance= instance,
                partial=True,
                context={'request': request}
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(status=200)
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
                instance = apps.get_model('SystemSettings.RedemptionSetting').objects.get(id = id)
            except apps.get_model('SystemSettings.RedemptionSetting').DoesNotExist as e:
                return Response(status=404)
            except Exception as e:
                return Response(status=500)
            if instance.active:
                return Response(
                    {
                        'detail' : "Can not delete active reward settings"
                    },
                    status=400,
                )
            else:
                instance.delete()
                return Response(status=200)
        else:
            return Response(
                {
                    'detail' : "invalid id"
                },
                status=400,
            )
        
        