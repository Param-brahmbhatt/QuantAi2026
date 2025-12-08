from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VariableViewSet, LogicNodeViewSet, ConditionViewSet, next_question_view

router = DefaultRouter()
router.register(r'variables', VariableViewSet)
router.register(r'logic-nodes', LogicNodeViewSet)
router.register(r'conditions', ConditionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('next-question/', next_question_view, name='next-question'),
]
