from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from django_filters.rest_framework import DjangoFilterBackend
from .models import Project, Language, ProjectFilter, ProjectAudianceDetails
from .serializers import (
    ProjectSerializer, ProjectListSerializer,
    LanguageSerializer, ProjectFilterSerializer,
    ProjectAudianceDetailsSerializer
)


class LanguageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Language CRUD operations

    list: Get all languages
    create: Create a new language
    retrieve: Get a specific language
    update: Update a language
    partial_update: Partially update a language
    destroy: Delete a language
    """
    queryset = Language.objects.all()
    serializer_class = LanguageSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'code']
    ordering_fields = ['name', 'code', 'created_at']
    ordering = ['name']


class ProjectViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Project CRUD operations

    list: Get all projects
    create: Create a new project
    retrieve: Get a specific project
    update: Update a project
    partial_update: Partially update a project
    destroy: Delete a project
    activate: Activate a project
    deactivate: Deactivate a project
    """
    queryset = Project.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['project_type', 'mode', 'active']
    search_fields = ['title', 'code', 'description']
    ordering_fields = ['created_at', 'start_time', 'end_time', 'title']
    ordering = ['-created_at']

    def get_serializer_class(self):
        """Use different serializers for list and detail views"""
        if self.action == 'list':
            return ProjectListSerializer
        return ProjectSerializer

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a project"""
        project = self.get_object()
        project.active = True
        project.save()
        serializer = self.get_serializer(project)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate a project"""
        project = self.get_object()
        project.active = False
        project.save()
        serializer = self.get_serializer(project)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def questions(self, request, pk=None):
        """Get all questions for this project"""
        project = self.get_object()
        from Apps.Survey.models import Question
        from Apps.Survey.serializers import QuestionListSerializer

        questions = Question.objects.filter(project=project)
        serializer = QuestionListSerializer(questions, many=True)
        return Response(serializer.data)

    def perform_destroy(self, instance):
        """Custom delete to check if project can be deleted"""
        if instance.active:
            raise ValidationError('Cannot delete an active project. Please deactivate it first.')
        instance.delete()


class ProjectFilterViewSet(viewsets.ModelViewSet):
    queryset = ProjectFilter.objects.all()
    serializer_class = ProjectFilterSerializer
    permission_classes = [IsAuthenticated]


class ProjectAudianceDetailsViewSet(viewsets.ModelViewSet):
    queryset = ProjectAudianceDetails.objects.all()
    serializer_class = ProjectAudianceDetailsSerializer
    permission_classes = [IsAuthenticated]

