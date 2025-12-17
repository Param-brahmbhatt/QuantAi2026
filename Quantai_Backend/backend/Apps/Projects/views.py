from rest_framework import viewsets, filters, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from django_filters.rest_framework import DjangoFilterBackend
from .models import Project, Language, ProjectFilter, ProjectAudianceDetails, ProjectQuota, GlobalFilter
from .serializers import (
    ProjectSerializer, ProjectListSerializer,
    LanguageSerializer, ProjectFilterSerializer,
    ProjectAudianceDetailsSerializer, ProjectQuotaSerializer,
    GlobalFilterSerializer
)
from .services import QuotaFilterService


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

    def perform_create(self, serializer):
        """Auto-set created_by to current user when creating project"""
        serializer.save(created_by=self.request.user)

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


class ProjectQuotaViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ProjectQuota CRUD operations

    list: Get all quotas
    create: Create a new quota
    retrieve: Get a specific quota
    update: Update a quota
    partial_update: Partially update a quota
    destroy: Delete a quota
    """
    queryset = ProjectQuota.objects.all()
    serializer_class = ProjectQuotaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['project', 'country', 'status']
    ordering_fields = ['created_at', 'limit', 'current_count']
    ordering = ['-created_at']

    def get_queryset(self):
        """Filter by project if provided in query params"""
        queryset = super().get_queryset()
        project_id = self.request.query_params.get('project')

        if project_id:
            queryset = queryset.filter(project_id=project_id)

        return queryset


class ProjectFilterViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ProjectFilter CRUD operations

    Role-based access control:
    - Regular users (audience): DENIED - Cannot view or manage filters
    - Staff/Admins: Can view and manage filters for THEIR OWN projects only
    - Superusers: Full access to ALL project filters

    list: Get project filters (based on role)
    create: Create a new filter (staff+ only)
    retrieve: Get a specific filter (staff+ only)
    update: Update a filter (staff+ only)
    partial_update: Partially update a filter (staff+ only)
    destroy: Delete a filter (staff+ only)
    """
    queryset = ProjectFilter.objects.all()
    serializer_class = ProjectFilterSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['project', 'filter_type', 'is_active']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        """
        Role-based filtering:
        - Superusers: See ALL project filters
        - Staff/Admins: See filters for projects they created only
        - Regular users: Empty queryset (denied)
        """
        queryset = super().get_queryset()
        user = self.request.user

        # Regular users cannot see filters at all
        if not user.is_staff and not user.is_superuser:
            return ProjectFilter.objects.none()

        # Superusers see everything
        if user.is_superuser:
            project_id = self.request.query_params.get('project')
            if project_id:
                queryset = queryset.filter(project_id=project_id)
            return queryset

        # Staff/Admins see only filters for their own projects
        queryset = queryset.filter(project__created_by=user)

        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)

        return queryset

    def check_permissions(self, request):
        """Block regular users from accessing this endpoint"""
        super().check_permissions(request)

        if not request.user.is_staff and not request.user.is_superuser:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You do not have permission to access project filters.")


class GlobalFilterViewSet(viewsets.ModelViewSet):
    """
    ViewSet for GlobalFilter CRUD operations

    Role-based access control:
    - Regular users & Staff: DENIED - Cannot access global filters
    - Superusers ONLY: Full access to manage platform-wide filters

    list: Get all global filters (superuser only)
    create: Create a new global filter (superuser only)
    retrieve: Get a specific global filter (superuser only)
    update: Update a global filter (superuser only)
    partial_update: Partially update a global filter (superuser only)
    destroy: Delete a global filter (superuser only)
    """
    queryset = GlobalFilter.objects.all()
    serializer_class = GlobalFilterSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['filter_type', 'is_active']
    ordering_fields = ['priority', 'created_at']
    ordering = ['priority']

    def get_queryset(self):
        """Only superusers can see global filters"""
        if not self.request.user.is_superuser:
            return GlobalFilter.objects.none()
        return super().get_queryset()

    def check_permissions(self, request):
        """Block non-superusers from accessing global filters"""
        super().check_permissions(request)

        if not request.user.is_superuser:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only superusers can manage global filters.")


class ProjectAudianceDetailsViewSet(viewsets.ModelViewSet):
    queryset = ProjectAudianceDetails.objects.all()
    serializer_class = ProjectAudianceDetailsSerializer
    permission_classes = [IsAuthenticated]


@api_view(['POST'])
def check_survey_access(request):
    """
    Check if user can access a survey based on quotas and filters

    Payload:
    {
        "project_id": 1,
        "profile_id": 123
    }

    Returns:
    {
        "allowed": bool,
        "reason": str,
        "message": str,
        "details": dict
    }
    """
    project_id = request.data.get('project_id')
    profile_id = request.data.get('profile_id')

    if not project_id or not profile_id:
        return Response(
            {'error': 'project_id and profile_id are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        from Apps.Users.models import Profile
        profile = Profile.objects.get(id=profile_id)

        result = QuotaFilterService.can_user_access_survey(project_id, profile)

        return Response(result)

    except Profile.DoesNotExist:
        return Response(
            {'error': 'Profile not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Project.DoesNotExist:
        return Response(
            {'error': 'Project not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

