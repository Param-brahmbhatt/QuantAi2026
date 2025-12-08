from django.contrib import admin
from django.urls import path, include

from .views import (
    GeneralLogsView,
)

app_name = 'auditlogs'
urlpatterns = [
    path('<str:model>/', GeneralLogsView.as_view(), name="generallogs"),
]