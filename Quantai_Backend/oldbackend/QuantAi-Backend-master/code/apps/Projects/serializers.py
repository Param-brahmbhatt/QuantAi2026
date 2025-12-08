from rest_framework import serializers

from .models import (
    Project,
    ProjectAudianceDetails,
    ProjectFilter
)

from libs.serializers import (
    ModelSerializer,
    Serializer
)

from apps.Variables.serializers import (
    VariableGetSerializer
)

from apps.Questions.serializers import (
    QuestionChoicesQuestionAdminSerializer
)
class ProjectAdminSerializer(ModelSerializer):

    audiance_counter = serializers.ReadOnlyField()
    
    class Meta:
        model = Project
        exclude = [
            'languages',
        ]

class ProjectAdminAddSerializer(ModelSerializer):
    
    class Meta:
        model = Project
        exclude = [
            'languages',
            'uuid',
            'mode',
        ]

class ProjectAdminEditSerializer(ModelSerializer):

    def validate_mode(self, mode):
        status = {
            "DE": "Development",
            "PR": "Preview",
            "DM": "Demo",
            "LI": "Live",
            "CO": "Complete",
        }
        if self.instance:
            if mode in ['PR', 'DM', 'LI'] and self.instance.mode == "DE":
                if self.instance.questions.count() == 0:
                    raise serializers.ValidationError(f"Project does not contains any questions to go in {status[mode]} mode")
                for question in self.instance.questions.all():
                    if not hasattr(question, 'default_route'):
                        raise serializers.ValidationError(f"Not all project questions has default route set to go in {status[mode]} mode")
                if self.instance.questions.filter(is_initial_question = True).count() == 0:
                    raise serializers.ValidationError(f"Project does not contains any initial question to go in {status[mode]} mode")
        return mode
    
    class Meta:
        model = Project
        exclude = [
            'project_type',
            'languages',
            'uuid',
        ]

class ProjectAudianceSubSerializer(ModelSerializer):
    class Meta:
        model = Project
        fields = [
            'id',
            'code',
            'title',
            'project_type',
            'active',
            'uuid',
        ]
class ProjectAudianceDetailsListSerializer(ModelSerializer):

    project = ProjectAudianceSubSerializer()

    class Meta:
        model = ProjectAudianceDetails
        fields = [
            'id',
            'project',
            'status',
            'answered_questions',
            'total_questions',
            'created_on',
            'updated_on',
            'time_consumed',
            'total_rewards',
        ]

class ProjectFilterDetailsListSerializer(ModelSerializer):

    variable = VariableGetSerializer()
    options = QuestionChoicesQuestionAdminSerializer(many=True)

    class Meta:
        model = ProjectFilter
        exclude = [
            'created_on',
            'updated_on',
            'geodata',
        ]

class ProjectFilterAddEditSerializer(ModelSerializer):

    class Meta:
        model = ProjectFilter
        exclude = [
            'created_on',
            'updated_on',
            'geodata',
        ]
    
    def __init__(self, *args, **kwargs):
        try:
            id = kwargs['data'].get("id", None)
            if id:
                instance = ProjectFilter.objects.get(id = id)
                super().__init__(instance=instance, *args, **kwargs)
            else:
                super().__init__(*args, **kwargs)
        except Exception as e:
            print (e)
            super().__init__(*args, **kwargs)
