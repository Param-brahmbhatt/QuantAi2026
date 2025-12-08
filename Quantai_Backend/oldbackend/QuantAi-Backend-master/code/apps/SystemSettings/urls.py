from django.contrib import admin
from django.urls import path, include

from .views import (
    CountriesListView,
    RewardSettingsView,
    RedemptionSettingsView
)

app_name = 'systemsettings'
urlpatterns = [
    path('countries/list/', CountriesListView.as_view(), name="countrieslist"),
    path('rewards/', RewardSettingsView.as_view(), name="rewards"),
    path('redemptions/', RedemptionSettingsView.as_view(), name="redemptions"),
]
