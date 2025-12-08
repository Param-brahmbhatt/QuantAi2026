from rest_framework import serializers

from django.db.models import Q
from django.apps import apps

from .models import (
    RewardSetting,
    RedemptionSetting
)

from libs.serializers import (
    ModelSerializer,
    Serializer
)

class RewardSettingSerializer(ModelSerializer):

    def validate_active(self, active):
        if self.instance and active == False:
            if RewardSetting.objects.filter( ~Q(id = self.instance.id) ).filter( reward_for = self.instance.reward_for, active = True ).count() == 0:
                raise serializers.ValidationError("Can not de-activate only active settings from system.")
        return active

    class Meta:
        model = RewardSetting
        exclude = [
            'geodata',
        ]
        read_only_fields = [
            'created_on',
            'updated_on',
            'id',
        ]

class RedemptionSettingSerializer(ModelSerializer):

    def validate_active(self, active):
        if self.instance and active == False:
            if RedemptionSetting.objects.filter( ~Q(id = self.instance.id) ).filter( active = True ).count() == 0:
                raise serializers.ValidationError("Can not de-activate only active settings from system.")
        return active

    def to_representation(self, instance):
        """
        Overwrites choices fields to return their display value instead of their value.
        """
        data = super().to_representation(instance)
        for field in data:
            try:
                if instance._meta.get_field(field).choices:        
                    data[field] = getattr(instance, "get_" + field + "_display")()
            except FieldDoesNotExist:
                pass
        return data

    class Meta:
        model = RedemptionSetting
        exclude = [
            'geodata',
        ]
        read_only_fields = [
            'created_on',
            'updated_on',
            'id',
        ]