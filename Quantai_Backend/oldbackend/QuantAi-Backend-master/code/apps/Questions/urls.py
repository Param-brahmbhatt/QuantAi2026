from django.contrib import admin
from django.urls import path, include

from .views import (
    QuestionsView,
    QuestionsReindexView,
    QuestionsDefaultLogicView,
    QuestionsLogicView
)

app_name = 'questions'
urlpatterns = [
    path('admin/', QuestionsView.as_view(), name="questionadmin"),
    path('admin/reindex/', QuestionsReindexView.as_view(), name="questionadminreindex"),
    path('admin/logic/', QuestionsLogicView.as_view(), name="questionlogicadmin"),
    path('admin/logic/default/', QuestionsDefaultLogicView.as_view(), name="questionlogicadmindefault")
]