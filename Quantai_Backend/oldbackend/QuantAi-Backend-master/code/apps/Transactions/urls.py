from django.contrib import admin
from django.urls import path, include

from .views import (
    TransactionsView
)

app_name = 'transactions'
urlpatterns = [
    path('', TransactionsView.as_view(), name="transactions"),
]