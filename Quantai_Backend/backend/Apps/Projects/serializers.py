from rest_framework import serializers
from .models import Project, Language, ProjectFilter, ProjectAudianceDetails, ProjectQuota, GlobalFilter


class LanguageSerializer(serializers.ModelSerializer):
    """Serializer for Language model"""

    class Meta:
        model = Language
        fields = ['id', 'code', 'name', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProjectSerializer(serializers.ModelSerializer):
    """Serializer for Project model"""

    languages = LanguageSerializer(many=True, read_only=True)
    language_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Language.objects.all(),
        source='languages',
        write_only=True,
        required=False
    )
    is_active_now = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id', 'uuid', 'title', 'description', 'languages', 'language_ids',
            'active', 'start_time', 'end_time', 'reward_points', 'code',
            'project_type', 'mode',
            # Logo configuration
            'logo', 'logo_url', 'logo_width', 'logo_height', 'logo_location', 'fit_logo',
            # Messages
            'display_welcome_message', 'welcome_message',
            'display_thankyou_message', 'thankyou_message',
            'quotafull_message', 'terminate_message', 'navigation_message',
            # Participant management
            'participant_limit',
            # Quota management
            'quota_full_action', 'is_quota_full',
            # Button texts
            'start_btn_text', 'complete_btn_text', 'previous_btn_text', 'next_btn_text',
            # UI preferences
            'show_progress_bar', 'answer_preview',
            'is_active_now', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'uuid', 'logo_url', 'created_at', 'updated_at']
        extra_kwargs = {
            'logo': {'write_only': True, 'required': False}
        }

    def get_is_active_now(self, obj):
        """Check if project is currently active"""
        return obj.is_active_now()

    def validate(self, data):
        """Validate that start_time is before end_time"""
        if 'start_time' in data and 'end_time' in data:
            if data['start_time'] >= data['end_time']:
                raise serializers.ValidationError({
                    'end_time': 'End time must be after start time'
                })
        return data

    def validate_reward_points(self, value):
        """Ensure reward points are non-negative"""
        if value < 0:
            raise serializers.ValidationError('Reward points cannot be negative')
        return value


class ProjectListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing projects"""

    languages_count = serializers.SerializerMethodField()
    questions_count = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id', 'uuid', 'title', 'code', 'project_type', 'mode',
            'active', 'start_time', 'end_time', 'reward_points',
            'languages_count', 'questions_count', 'created_at'
        ]
        read_only_fields = fields

    def get_languages_count(self, obj):
        return obj.languages.count()

    def get_questions_count(self, obj):
        return obj.questions.count()


class ProjectQuotaSerializer(serializers.ModelSerializer):
    """Serializer for ProjectQuota model"""

    country_name = serializers.CharField(source='country.name', read_only=True)
    remaining = serializers.IntegerField(read_only=True)
    is_full = serializers.BooleanField(read_only=True)

    class Meta:
        model = ProjectQuota
        fields = [
            'id', 'project', 'country', 'country_name', 'limit', 'current_count',
            'action_on_full', 'status', 'remaining', 'is_full',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'status', 'created_at', 'updated_at']

    def update(self, instance, validated_data):
        """Update quota and auto-update status based on current_count"""
        instance = super().update(instance, validated_data)

        # Auto-update status based on current_count
        if instance.is_full:
            instance.status = 'FULL'
        else:
            instance.status = 'ACTIVE'

        instance.save()
        return instance


class ProjectFilterSerializer(serializers.ModelSerializer):
    """Serializer for ProjectFilter model"""

    variable_name = serializers.CharField(source='variable.name', read_only=True)

    class Meta:
        model = ProjectFilter
        fields = [
            'id', 'project', 'filter_type', 'variable', 'variable_name',
            'operator', 'options', 'value', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class GlobalFilterSerializer(serializers.ModelSerializer):
    """Serializer for GlobalFilter model"""

    variable_name = serializers.CharField(source='variable.name', read_only=True)

    class Meta:
        model = GlobalFilter
        fields = [
            'id', 'name', 'description', 'filter_type', 'variable', 'variable_name',
            'operator', 'options', 'value', 'is_active', 'priority',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProjectAudianceDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectAudianceDetails
        fields = '__all__'