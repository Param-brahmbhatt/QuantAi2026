from django.contrib import admin
from django.urls import path, include

from .views import (
    MyProfileView,
    MyProfileUpdateView,
    AdminProfileView,
)

app_name = 'profile'
urlpatterns = [
    path('myprofile/', MyProfileView.as_view(), name="myprofile"),
    path('myprofile/update/', MyProfileUpdateView.as_view(), name="myprofileupdate"),
    # admin urls
    path('profile/', AdminProfileView.as_view(), name="profile"), # type = 
]