from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProfilingView,
    MobileOTPRequestView,
    MobileOTPVerifyView,
    ProfilingQuestionViewSet,
    ProfilingAnswerViewSet
)

app_name = 'profiles'

router = DefaultRouter()
router.register(r'questions', ProfilingQuestionViewSet, basename='profiling-question')
router.register(r'answers', ProfilingAnswerViewSet, basename='profiling-answer')

urlpatterns = [
    path('', ProfilingView.as_view(), name='profiling-detail'),
    path('otp/request/', MobileOTPRequestView.as_view(), name='otp-request'),
    path('otp/verify/', MobileOTPVerifyView.as_view(), name='otp-verify'),
    path('', include(router.urls)),
]
