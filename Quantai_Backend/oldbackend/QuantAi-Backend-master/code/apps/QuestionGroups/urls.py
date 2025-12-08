from django.contrib import admin
from django.urls import path, include

from .views import (
    QuestionGroupView,
    OptionGroupView
)

app_name = 'groups'
urlpatterns = [
    path('questions/admin/', QuestionGroupView.as_view(), name="questiongroupadmin"),

    path('options/admin/', OptionGroupView.as_view(), name="optiongroupadmin"),
]