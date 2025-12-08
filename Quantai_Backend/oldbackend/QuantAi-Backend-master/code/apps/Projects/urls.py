from django.contrib import admin
from django.urls import path, include

from .views import (
    ProjectAdminView,
    ProjectDashboardAdminView,
    ProjectAudianceView,
    ProjectFilterAdminView,
    ProjectVariablesAdminView,
    ProjectAudianceAnswerView,
    ProjectReportsTabularAdminView,
    ProjectReportsGraphAdminView
)

app_name = 'settings'
urlpatterns = [
    path('admin/', ProjectAdminView.as_view(), name="projectadmin"),
    path('admin/dashboard/', ProjectDashboardAdminView.as_view(), name="projectadmindashboard"),
    path('admin/filters/', ProjectFilterAdminView.as_view(), name="projectfiltersadmin"),
    path('admin/variables/', ProjectVariablesAdminView.as_view(), name="projectvariablesadmin"),
    path('admin/reports/table/', ProjectReportsTabularAdminView.as_view(), name="projectreportstableadmin"),
    path('admin/reports/graph/', ProjectReportsGraphAdminView.as_view(), name="projectreportsgraphadmin"),

    path('audiance/', ProjectAudianceView.as_view(), name="projectaudiance"),
    path('audiance/answer/', ProjectAudianceAnswerView.as_view(), name="projectaudianceanswer"),
]