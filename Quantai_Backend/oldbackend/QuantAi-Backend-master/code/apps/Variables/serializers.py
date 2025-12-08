from rest_framework import serializers
from django.db.models import Q

from libs.serializers import (
    ModelSerializer,
    Serializer
)

from .models import (
    Variable
)

from libs.serializers import (
    CheckOnlySpecialUndescoreAllowed
)

class VariableGetSerializer(ModelSerializer):

    class Meta:
        model = Variable
        exclude = []

class VariableProjectGetSerializer(ModelSerializer):

    class Meta:
        model = Variable
        exclude = [
            'project',
            'type',
            'question',
        ]

class VariableProjectAddEditSerializer(ModelSerializer):

    value = serializers.CharField(
        required = True,
    )

    def validate_name(self, name):
        if not CheckOnlySpecialUndescoreAllowed(name):
            raise serializers.ValidationError("Only A-Z,a-z,0-9 and _ allowed as variable name.")
        if not self.instance:
            if self.context['project'].variables.filter(
                name = name.upper(),
            ).count() > 0:
                raise serializers.ValidationError("variable already exists.")
        else:
            if self.context['project'].variables.filter(
                ~Q( id = self.instance.id ),
                name = name.upper(),
            ).count() > 0:
                raise serializers.ValidationError("variable already exists.")
        return name
    
    def __init__(self, *args, **kwargs):
        id = kwargs['data'].get("id", None)
        if id:
            instance = Variable.objects.get(id = id)
            super().__init__(instance=instance, *args, **kwargs)
        else:
            super().__init__(*args, **kwargs)


    class Meta:
        model = Variable
        exclude = [
            'question',
        ]