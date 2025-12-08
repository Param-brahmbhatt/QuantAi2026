from rest_framework import serializers
from .models import Variable, LogicNode, Condition

class VariableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Variable
        fields = '__all__'

class ConditionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Condition
        fields = '__all__'

class LogicNodeSerializer(serializers.ModelSerializer):
    conditions = ConditionSerializer(many=True, read_only=True)

    class Meta:
        model = LogicNode
        fields = '__all__'

    def validate(self, data):
        """Ensure target question belongs to the same project"""
        if 'target_question' in data and data['target_question']:
            source_project = data['question'].project
            target_project = data['target_question'].project
            if source_project != target_project:
                raise serializers.ValidationError({
                    'target_question': 'Target question must belong to the same project.'
                })
        return data
