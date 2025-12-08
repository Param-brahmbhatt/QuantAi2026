from rest_framework import serializers
from django.contrib.auth import password_validation as validators
from django.core.validators import validate_email
from django.apps import apps

from .models import (
    LogEntry
)

from libs.serializers import (
    ModelSerializer,
    Serializer
)

class AuditLogsSerializer(ModelSerializer):

    actor = serializers.StringRelatedField()

    class Meta:
        model = LogEntry
        fields = [
            'timestamp',
            'serialized_data',
            'changes_display_dict',
            'actor',
            'geo_data',
            'user_agent_data',
            'timestamp',
            'additional_data',

        ]