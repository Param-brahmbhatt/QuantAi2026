from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    QuestionViewSet, QuestionGroupViewSet, QuestionChoicesViewSet,
    QuestionChoicesGroupViewSet, QuestionRowViewSet, QuestionColumnViewSet,
    AnswerViewSet
)


router = DefaultRouter()
router.register(r'questions', QuestionViewSet, basename='question')
router.register(r'question-groups', QuestionGroupViewSet, basename='questiongroup')
router.register(r'question-choices', QuestionChoicesViewSet, basename='questionchoices')
router.register(r'question-choices-groups', QuestionChoicesGroupViewSet, basename='questionchoicesgroup')
router.register(r'question-rows', QuestionRowViewSet, basename='questionrow')
router.register(r'question-columns', QuestionColumnViewSet, basename='questioncolumn')
router.register(r'answers', AnswerViewSet, basename='answer')

urlpatterns = [
    path('', include(router.urls)),
]