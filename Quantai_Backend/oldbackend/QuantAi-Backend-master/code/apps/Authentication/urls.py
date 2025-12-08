from django.contrib import admin
from django.urls import path, include
from oauth2_provider.views import RevokeTokenView

from .views import (
    SocialAuthView,
    SignupView,
    LoginView,
    LogoutView,
    PasswordResetView,
    PasswordResetEmailSendView,
    PasswordChangeView,
    EmailVerificationView,
    ResendVerificationEmailView,
    
)

app_name = 'authentication'
urlpatterns = [
    path('signup/', SignupView.as_view(), name="singup"),
    path('social/', SocialAuthView.as_view(), name="socialauth"),
    path('login/', LoginView.as_view(), name="login"),
    path('logout/', LogoutView.as_view(), name="logout"),
    path('password/change/', PasswordChangeView.as_view(), name="passwordchange"),

    path('password/reset/send/', PasswordResetEmailSendView.as_view(), name="passwordresetsend"),
    path('password/reset/', PasswordResetView.as_view(), name="passwordreset"),
    
    path('email/verification/resend/', ResendVerificationEmailView.as_view(), name="emailverificationresend"),
    path('email/verification/', EmailVerificationView.as_view(), name="emailverification"),
]