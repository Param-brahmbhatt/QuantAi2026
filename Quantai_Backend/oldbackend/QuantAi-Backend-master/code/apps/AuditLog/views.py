from django.conf import settings

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from rest_framework.pagination import PageNumberPagination
from rest_framework.settings import api_settings

from libs.permissions import AllowAdminOnly

from .serializers import (
    AuditLogsSerializer
)

from .models import (
    LogEntry
)   

class GeneralLogsView(APIView, PageNumberPagination):

    page_size = settings.LOG_PAGE_SIZE

    def get(self, request, model, *args, **kwargs):
        if model == "profile":
            if request.user.profile.profile_type == "AD":
                id = request.GET.get("id", request.user.profile.id)
            else:
                id = request.user.profile.id
        else:
            id = request.GET.get("id", None)
        if not id:
            return Response(
                {
                    'detail' : 'id required'
                },
                status=400,
            )
        return self.get_paginated_response(
            AuditLogsSerializer(
                self.paginate_queryset(
                    LogEntry.objects.filter(
                        content_type__model=model, object_id=id
                    ).order_by('-id'),
                    request=request,
                    view=self,
                ),
                many = True,
            ).data,
        )