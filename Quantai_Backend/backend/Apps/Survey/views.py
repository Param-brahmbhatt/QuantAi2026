from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import (
    Question, QuestionGroup, QuestionChoices,
    QuestionChoicesGroup, QuestionRow, QuestionColumn, Answer
)

from .serializers import (
    QuestionSerializer, QuestionListSerializer,
    QuestionGroupSerializer, QuestionGroupListSerializer,
    QuestionChoicesSerializer, QuestionChoicesGroupSerializer,
    QuestionRowSerializer, QuestionColumnSerializer, AnswerSerializer
)



class QuestionChoicesViewSet(viewsets.ModelViewSet):
    """
    ViewSet for QuestionChoices CRUD operations
    """
    queryset = QuestionChoices.objects.all()
    serializer_class = QuestionChoicesSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['text', 'value']
    ordering_fields = ['order', 'created_at']
    ordering = ['order']


class QuestionRowViewSet(viewsets.ModelViewSet):
    """
    ViewSet for QuestionRow CRUD operations (for matrix questions)
    """
    queryset = QuestionRow.objects.all()
    serializer_class = QuestionRowSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['order', 'created_at']
    ordering = ['order']


class QuestionColumnViewSet(viewsets.ModelViewSet):
    """
    ViewSet for QuestionColumn CRUD operations (for matrix questions)
    """
    queryset = QuestionColumn.objects.all()
    serializer_class = QuestionColumnSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['order', 'created_at']
    ordering = ['order']


class QuestionChoicesGroupViewSet(viewsets.ModelViewSet):
    """
    ViewSet for QuestionChoicesGroup CRUD operations
    """
    queryset = QuestionChoicesGroup.objects.all()
    serializer_class = QuestionChoicesGroupSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['question']
    search_fields = ['title', 'description']


class QuestionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Question CRUD operations

    list: Get all questions
    create: Create a new question
    retrieve: Get a specific question
    update: Update a question
    partial_update: Partially update a question
    destroy: Delete a question
    """
    queryset = Question.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['project', 'question_type', 'is_required', 'is_initial_question']
    search_fields = ['title', 'description', 'variable_name']
    ordering_fields = ['display_index', 'created_at']
    ordering = ['display_index']

    def get_serializer_class(self):
        """Use different serializers for list and detail views"""
        if self.action == 'list':
            return QuestionListSerializer
        return QuestionSerializer

    @action(detail=True, methods=['get'])
    def choices(self, request, pk=None):
        """Get all choice groups for this question"""
        question = self.get_object()
        choice_groups = question.choice_groups.all()
        serializer = QuestionChoicesGroupSerializer(choice_groups, many=True)
        return Response(serializer.data)


class QuestionGroupViewSet(viewsets.ModelViewSet):
    """
    ViewSet for QuestionGroup CRUD operations

    list: Get all question groups
    create: Create a new question group
    retrieve: Get a specific question group
    update: Update a question group
    partial_update: Partially update a question group
    destroy: Delete a question group
    """
    queryset = QuestionGroup.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['project']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        """Use different serializers for list and detail views"""
        if self.action == 'list':
            return QuestionGroupListSerializer
        return QuestionGroupSerializer


class AnswerViewSet(viewsets.ModelViewSet):
    queryset = Answer.objects.all()
    serializer_class = AnswerSerializer
    permission_classes = [IsAuthenticated]

