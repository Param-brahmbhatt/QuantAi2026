from django.shortcuts import render
from django.apps import apps

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from rest_framework.pagination import PageNumberPagination
from rest_framework.settings import api_settings

from django_countries import countries

from libs.permissions import AllowAdminAndAudianceOnly
from libs.request import RequestDefaultDataMapper

from .serializers import (
    TransactionAudianceSerializer,
    TransactionAdminSerializer,
    TransactionAudianceDepositeAddSerializer,
    TransactionAdminEditSerializer,
)

class TransactionsView(APIView, PageNumberPagination):
    
    permission_classes = (*api_settings.DEFAULT_PERMISSION_CLASSES, AllowAdminAndAudianceOnly,)
    page_size = api_settings.PAGE_SIZE

    def get(self, request, *args, **kwargs):
        id = request.GET.get('id', None)
        if id:
            try:
                instance = apps.get_model('Transactions.Transaction').objects.get(id = id)
            except apps.get_model('Transactions.Transaction').DoesNotExist as e:
                return Response(status=404)
            except Exception as e:
                return Response(status=500)
            if request.user.profile.profile_type == "AU":
                return Response(
                    TransactionAudianceSerializer(instance).data,
                    status=200,
                )
            else:
                return Response(
                    TransactionAdminSerializer(instance).data,
                    status=200,
                )
        else:
            if request.user.profile.profile_type == "AU":
                return self.get_paginated_response(
                    TransactionAudianceSerializer(
                        self.paginate_queryset(
                            apps.get_model('Transactions.Transaction').objects.filter( profile = request.user.profile ),
                            request=request,
                            view=self,
                        ),
                        many = True,
                    ).data,
                )
            else:
                return self.get_paginated_response(
                    TransactionAdminSerializer(
                        self.paginate_queryset(
                            apps.get_model('Transactions.Transaction').objects.all(),
                            request=request,
                            view=self,
                        ),
                        many = True,
                    ).data,
                )
            
    def post(self, request, *args, **kwargs):
        if request.user.profile.profile_type == "AD":
            return Response(
                {
                    "detail": "Method \"POST\" not allowed."
                },
                status=405,
            )
        serializer = TransactionAudianceDepositeAddSerializer(
            data = RequestDefaultDataMapper( request.data, {'t_type' : 'WID', 'profile' : request.user.profile.id }),
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        return Response(
            TransactionAudianceSerializer(instance).data,
            status=200,
        ) 
    
    def put(self, request, *args, **kwargs):
        if request.user.profile.profile_type == "AU":
            return Response(
                {
                    "detail": "Method \"PUT\" not allowed."
                },
                status=405,
            )
        id = request.GET.get('id', None)
        if id:
            try:
                instance = apps.get_model('Transactions.Transaction').objects.get(id = id, status="PE")
            except apps.get_model('Transactions.Transaction').DoesNotExist as e:
                return Response(status=404)
            except Exception as e:
                return Response(status=500)
        else:
            return Response(
                {
                    'detail' : 'Need transaction ID'
                },
                status=400,
            ) 
        serializer = TransactionAdminEditSerializer(
            data = request.data,
            context={'request': request},
            instance=instance
        )
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        return Response(
            TransactionAdminSerializer(instance).data,
            status=200,
        ) 

    def delete(self, request, *args, **kwargs):
        id = request.GET.get('id', None)
        if id:
            try:
                instance = apps.get_model('Transactions.Transaction').objects.get(id = id, status="PE")
            except apps.get_model('Transactions.Transaction').DoesNotExist as e:
                return Response(status=404)
            except Exception as e:
                return Response(status=500)
        else:
            return Response(
                {
                    'detail' : 'Need transaction ID'
                },
                status=400,
            )
        instance.status = "CA"
        instance.save()
        return Response(status=200)