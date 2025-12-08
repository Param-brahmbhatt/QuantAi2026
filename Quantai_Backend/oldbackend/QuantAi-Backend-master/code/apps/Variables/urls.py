from django.contrib import admin
from django.urls import path, include

from .views import (
    VariablesCheckView,
    VariablesView,
    VariableOptionsView,
    VariablesProfilingWithOptionsView,
    MyProfillingVariables
)

app_name = 'variables'
urlpatterns = [
    path('check/', VariablesCheckView.as_view(), name="variablescheck"),
    path('list/', VariablesView.as_view(), name="variableslist"),
    path('list/profiling/withoptions/', VariablesProfilingWithOptionsView.as_view(), name="variablesprofilingwithoptionslist"),
    path('options/', VariableOptionsView.as_view(), name="variableoptions"),
    path('my/', MyProfillingVariables.as_view(), name="myvariables"),
]