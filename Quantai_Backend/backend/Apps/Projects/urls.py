from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProjectViewSet, LanguageViewSet,
    ProjectFilterViewSet, ProjectAudianceDetailsViewSet
)

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'languages', LanguageViewSet, basename='language')
router.register(r'filters', ProjectFilterViewSet, basename='project-filter')
router.register(r'audience-details', ProjectAudianceDetailsViewSet, basename='project-audience-details')

urlpatterns = [
    path('', include(router.urls)),
]