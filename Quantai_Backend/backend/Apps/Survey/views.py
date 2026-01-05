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
from .question_type_samples import QUESTION_TYPE_DETAILS



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

    def get_queryset(self):
        """
        Filter question rows based on user role (for matrix questions)
        """
        user = self.request.user
        queryset = super().get_queryset()

        # Admins see all
        if user.profile_type in ['SU', 'DV', 'AD', 'AM']:
            return queryset

        # Clients see only rows from their questions
        if user.profile_type in ['CL', 'CM']:
            return queryset.filter(question__project__created_by=user)

        # Audience and others: no access
        from Apps.Survey.models import QuestionRow
        return QuestionRow.objects.none()


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

    def get_queryset(self):
        """
        Filter question columns based on user role (for matrix questions)
        """
        user = self.request.user
        queryset = super().get_queryset()

        # Admins see all
        if user.profile_type in ['SU', 'DV', 'AD', 'AM']:
            return queryset

        # Clients see only columns from their questions
        if user.profile_type in ['CL', 'CM']:
            return queryset.filter(question__project__created_by=user)

        # Audience and others: no access
        from Apps.Survey.models import QuestionColumn
        return QuestionColumn.objects.none()


class QuestionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Question CRUD operations

    list: Get all questions
    create: Create a new question
    retrieve: Get a specific question
    update: Update a question
    partial_update: Partially update a question
    destroy: Delete a question
    question_types: Get all available question types
    question_type_detail: Get detailed info for a specific question type
    """
    queryset = Question.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['project', 'question_type', 'is_required', 'is_initial_question']
    search_fields = ['title', 'description', 'variable_name']
    ordering_fields = ['display_index', 'created_at']
    ordering = ['display_index']

    def get_queryset(self):
        """
        Filter questions based on user role:
        - Audience (AU): Profiling questions + questions from active public surveys
        - Clients (CL, CM): Only questions from their own projects
        - Admins (SU, DV, AD, AM): All questions
        """
        from django.db.models import Q
        user = self.request.user
        queryset = super().get_queryset()

        # Audience users can see profiling questions + public survey questions
        if user.profile_type == 'AU':
            return queryset.filter(
                Q(is_profiling_question=True) |
                Q(project__active=True, project__mode__in=['PR', 'LI'])
            )

        # Admins see all questions
        if user.profile_type in ['SU', 'DV', 'AD', 'AM']:
            return queryset

        # Clients see only questions from their own projects
        if user.profile_type in ['CL', 'CM']:
            return queryset.filter(project__created_by=user)

        # Default: profiling + public surveys
        return queryset.filter(
            Q(is_profiling_question=True) |
            Q(project__active=True, project__mode__in=['PR', 'LI'])
        )

    def get_serializer_class(self):
        """
        Use different serializers based on action and preview parameter
        
        - list with ?preview=true: Detailed view with choice groups
        - list without preview: Lightweight view
        - retrieve/create/update: Always detailed view
        """
        if self.action == 'list':
            # Check for preview query parameter
            preview = self.request.query_params.get('preview', 'false').lower() == 'true'
            if preview:
                return QuestionSerializer
            return QuestionListSerializer
        return QuestionSerializer

    @action(detail=True, methods=['get'])
    def choices(self, request, pk=None):
        """Get all choice groups for this question"""
        question = self.get_object()
        choice_groups = question.choice_groups.all()
        serializer = QuestionChoicesGroupSerializer(choice_groups, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='question-types')
    def question_types(self, request):
        """
        Get all available question types with their codes and names
        
        Returns:
            List of all 22 question types with code and name
        """
        question_types = [
            {'code': code, 'name': name}
            for code, name in Question.QUESTION_TYPE_CHOICES
        ]
        return Response(question_types)

    @action(detail=False, methods=['get'], url_path='question-types/(?P<type_code>[^/.]+)')
    def question_type_detail(self, request, type_code=None):
        """
        Get detailed information for a specific question type
        
        Args:
            type_code: Question type code (e.g., RDO, CHB, TXT)
            
        Returns:
            Detailed info including description, use cases, sample payload, and answer format
        """
        # Convert to uppercase for consistency
        type_code = type_code.upper()
        
        # Check if question type exists
        valid_codes = [code for code, _ in Question.QUESTION_TYPE_CHOICES]
        if type_code not in valid_codes:
            return Response(
                {
                    'error': f'Invalid question type code: {type_code}',
                    'valid_codes': valid_codes
                },
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get detailed information from samples
        if type_code in QUESTION_TYPE_DETAILS:
            details = QUESTION_TYPE_DETAILS[type_code]
            response_data = {
                'code': type_code,
                'name': details['name'],
                'description': details['description'],
                'use_cases': details['use_cases'],
                'widget': details['widget'],
                'sample_payload': details['sample_payload'],
                'answer_format': details['answer_format']
            }
            return Response(response_data)
        else:
            # Fallback for types without detailed samples
            return Response(
                {
                    'code': type_code,
                    'name': dict(Question.QUESTION_TYPE_CHOICES).get(type_code),
                    'message': 'Detailed sample not available for this question type'
                },
                status=status.HTTP_200_OK
            )



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

    def get_queryset(self):
        """
        Filter question groups based on user role:
        - Audience (AU): No access to question groups
        - Clients (CL, CM): Only groups from their own projects
        - Admins (SU, DV, AD, AM): All groups
        """
        user = self.request.user
        queryset = super().get_queryset()

        # Audience users cannot see question groups
        if user.profile_type == 'AU':
            from Apps.Survey.models import QuestionGroup
            return QuestionGroup.objects.none()

        # Admins see all groups
        if user.profile_type in ['SU', 'DV', 'AD', 'AM']:
            return queryset

        # Clients see only groups from their own projects
        if user.profile_type in ['CL', 'CM']:
            return queryset.filter(project__created_by=user)

        # Default: no access
        from Apps.Survey.models import QuestionGroup
        return QuestionGroup.objects.none()

    def get_serializer_class(self):
        """Use different serializers for list and detail views"""
        if self.action == 'list':
            return QuestionGroupListSerializer
        return QuestionGroupSerializer


class AnswerViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Answer CRUD operations
    
    Supports filtering by:
    - project: Filter answers by project ID
    - question: Filter answers by question ID
    - profile: Filter answers by profile ID
    """
    queryset = Answer.objects.all()
    serializer_class = AnswerSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['project', 'question', 'profile']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']

    def get_queryset(self):
        """
        Filter answers based on user role:
        - Audience (AU): Only their own answers (profiling + public surveys)
        - Clients (CL, CM): Only answers from their own projects
        - Admins (SU, DV, AD, AM): All answers
        """
        user = self.request.user
        queryset = super().get_queryset()

        # Audience users can only see their own answers
        if user.profile_type == 'AU':
            # Get user's profile
            from Apps.Users.models import Profile
            try:
                profile = Profile.objects.get(user=user)
                return queryset.filter(profile=profile)
            except Profile.DoesNotExist:
                from Apps.Survey.models import Answer
                return Answer.objects.none()

        # Admins see all answers
        if user.profile_type in ['SU', 'DV', 'AD', 'AM']:
            return queryset

        # Clients see only answers from their own projects
        if user.profile_type in ['CL', 'CM']:
            return queryset.filter(project__created_by=user)

        # Default: no access
        from Apps.Survey.models import Answer
        return Answer.objects.none()

