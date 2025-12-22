from rest_framework import serializers
from .models import (
    Question, QuestionGroup, QuestionChoices,
    QuestionChoicesGroup, QuestionRow, QuestionColumn, Answer
)

from Apps.Projects.models import Project
from .validators import (
    validate_email_answer,
    validate_phone_answer,
    validate_url_answer,
    validate_number_answer,
    validate_address_answer,
    validate_contact_info_answer
)


class QuestionChoicesSerializer(serializers.ModelSerializer):
    """Serializer for QuestionChoices model"""

    class Meta:
        model = QuestionChoices
        fields = ['id', 'text', 'value', 'order', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class QuestionRowSerializer(serializers.ModelSerializer):
    """Serializer for QuestionRow model"""

    class Meta:
        model = QuestionRow
        fields = ['id', 'text', 'order', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class QuestionColumnSerializer(serializers.ModelSerializer):
    """Serializer for QuestionColumn model"""

    class Meta:
        model = QuestionColumn
        fields = ['id', 'text', 'order', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class QuestionChoicesGroupSerializer(serializers.ModelSerializer):
    """Serializer for QuestionChoicesGroup model"""

    options = QuestionChoicesSerializer(many=True, read_only=True)
    option_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=QuestionChoices.objects.all(),
        source='options',
        write_only=True,
        required=False
    )

    class Meta:
        model = QuestionChoicesGroup
        fields = [
            'id', 'question', 'title', 'title_align', 'description',
            'description_align', 'options', 'option_ids', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class QuestionSerializer(serializers.ModelSerializer):
    """Serializer for Question model"""

    choice_groups = QuestionChoicesGroupSerializer(many=True, read_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True)

    class Meta:
        model = Question
        fields = [
            'id', 'project', 'project_title', 'variable_name', 'title', 'description',
            'is_required', 'is_initial_question', 'display_index', 'question_type',
            'widget', 'file_upload_allowed_extention', 'option_rotation',
            'choice_groups', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_project(self, value):
        """Ensure project exists and can have questions"""
        if not value:
            raise serializers.ValidationError('Project is required')
        return value

    def validate(self, data):
        """
        Validate question constraints:
        1. Unique display_index per project
        2. Only one is_initial_question per project
        """
        project = data.get('project')
        if not project and self.instance:
            project = self.instance.project

        if project:
            # Check display_index uniqueness
            if 'display_index' in data:
                qs = Question.objects.filter(project=project, display_index=data['display_index'])
                if self.instance:
                    qs = qs.exclude(pk=self.instance.pk)
                if qs.exists():
                    raise serializers.ValidationError({
                        'display_index': 'A question with this display index already exists in the project.'
                    })

            # Check is_initial_question uniqueness
            if data.get('is_initial_question', False):
                qs = Question.objects.filter(project=project, is_initial_question=True)
                if self.instance:
                    qs = qs.exclude(pk=self.instance.pk)
                if qs.exists():
                    raise serializers.ValidationError({
                        'is_initial_question': 'This project already has an initial question.'
                    })
        
        return data


class QuestionListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing questions"""

    project_title = serializers.CharField(source='project.title', read_only=True)
    choices_count = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = [
            'id', 'project', 'project_title', 'title', 'question_type',
            'is_required', 'display_index', 'choices_count', 'created_at'
        ]
        read_only_fields = fields

    def get_choices_count(self, obj):
        return obj.choice_groups.count()


class QuestionGroupSerializer(serializers.ModelSerializer):
    """Serializer for QuestionGroup model"""

    questions = QuestionSerializer(many=True, read_only=True)
    question_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Question.objects.all(),
        source='questions',
        write_only=True,
        required=False
    )
    project_title = serializers.CharField(source='project.title', read_only=True)

    class Meta:
        model = QuestionGroup
        fields = [
            'id', 'project', 'project_title', 'title', 'title_align',
            'description', 'description_align', 'questions', 'question_ids',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class QuestionGroupListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing question groups"""

    project_title = serializers.CharField(source='project.title', read_only=True)
    questions_count = serializers.SerializerMethodField()

    class Meta:
        model = QuestionGroup
        fields = [
            'id', 'project', 'project_title', 'title',
            'questions_count', 'created_at'
        ]
        read_only_fields = fields

    def get_questions_count(self, obj):
        return obj.questions.count()


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = '__all__'

    def validate(self, data):
        """
        Validate answer submission:
        1. Ensure project is active
        2. Validate answer data based on question type
        3. Ensure required questions are answered
        """
        # Existing validation
        project = data.get('project')
        if project and not project.active:
            raise serializers.ValidationError({
                'project': 'Cannot submit answers for an inactive project.'
            })

        # NEW: Question type-specific validation
        question = data.get('question')
        if not question:
            raise serializers.ValidationError({
                'question': 'Question is required.'
            })

        # Get the answer value from appropriate field
        answer_value = data.get('input')  # New types use 'input' field

        # Required field validation
        if question.is_required and not answer_value:
            raise serializers.ValidationError({
                'input': f'This question is required: {question.title}'
            })

        # Type-specific validation (only if answer provided)
        if answer_value is not None:
            is_valid, error_msg = self._validate_by_question_type(
                question.question_type,
                answer_value
            )
            if not is_valid:
                raise serializers.ValidationError({
                    'input': error_msg
                })

        return data

    def _validate_by_question_type(self, question_type, value):
        """
        Validate answer value based on question type

        Args:
            question_type: The question type code (EML, PHN, etc.)
            value: The answer value to validate

        Returns:
            tuple: (is_valid, error_message)
        """
        # Validation mapping
        validators = {
            'EML': validate_email_answer,
            'PHN': validate_phone_answer,
            'URL': validate_url_answer,
            'NUM': validate_number_answer,
            'ADR': validate_address_answer,
            'CTI': validate_contact_info_answer,
        }

        # Get validator for this question type
        validator = validators.get(question_type)

        if validator:
            return validator(value)

        # No specific validation for this type (existing types)
        return True, None