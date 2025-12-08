from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = "users"

# Router for ViewSets
router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='user')

urlpatterns = [
    # Authentication endpoints
    path("signup/", views.SignupView.as_view(), name="signup"),
    path("verify-otp/", views.VerifyOTPView.as_view(), name="verify_otp"),
    path("request-otp-login/", views.RequestOTPLoginView.as_view(), name="request_otp_login"),
    path("login-with-otp/", views.LoginWithOTPView.as_view(), name="login_with_otp"),
    path("password-reset/request/", views.PasswordResetRequestView.as_view(), name="password_reset_request"),
    path("password-reset/confirm/", views.PasswordResetConfirmView.as_view(), name="password_reset_confirm"),
    path("social/<str:provider>/", views.SocialAuthView.as_view(), name="social_auth"),
    path("login/", views.LoginView.as_view(), name="login"),

    # Utility endpoints
    path("countries/", views.CountriesView.as_view(), name="countries"),

    # User CRUD endpoints (from ViewSet router)
    path("", include(router.urls)),
]
