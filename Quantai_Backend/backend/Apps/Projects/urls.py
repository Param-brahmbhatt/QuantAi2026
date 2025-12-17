from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProjectViewSet, LanguageViewSet,
    ProjectFilterViewSet, ProjectAudianceDetailsViewSet,
    ProjectQuotaViewSet, GlobalFilterViewSet,
    check_survey_access
)

router = DefaultRouter()
router.register(r'surveys', ProjectViewSet, basename='project')  # /api/projects/surveys/
router.register(r'languages', LanguageViewSet, basename='language')  # /api/projects/languages/
router.register(r'quotas', ProjectQuotaViewSet, basename='project-quota')  # /api/projects/quotas/
router.register(r'filters', ProjectFilterViewSet, basename='project-filter')  # /api/projects/filters/
router.register(r'global-filters', GlobalFilterViewSet, basename='global-filter')  # /api/projects/global-filters/
router.register(r'audience-details', ProjectAudianceDetailsViewSet, basename='project-audience-details')  # /api/projects/audience-details/

urlpatterns = [
    path('', include(router.urls)),
    path('check-access/', check_survey_access, name='check-survey-access'),
]