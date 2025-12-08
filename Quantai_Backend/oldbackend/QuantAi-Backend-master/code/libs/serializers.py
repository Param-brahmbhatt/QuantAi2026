from rest_framework import serializers
from django.core.exceptions import FieldDoesNotExist

import re

def CheckOnlySpecialUndescoreAllowed(value): 
    return False if len(re.sub("[A-Za-z0-9_]", '', value)) > 0 else True
class ModelSerializer(serializers.ModelSerializer):
    pass

    # def to_representation(self, instance):
    #     """
    #     Overwrites choices fields to return their display value instead of their value.
    #     """
    #     data = super().to_representation(instance)
    #     for field in data:
    #         try:
    #             if instance._meta.get_field(field).choices:        
    #                 data[field] = getattr(instance, "get_" + field + "_display")()
    #         except Exception as e:
    #             pass
    #     return data
    
class Serializer(serializers.Serializer):
    pass

    # def to_representation(self, instance):
    #     """
    #     Overwrites choices fields to return their display value instead of their value.
    #     """
    #     data = super().to_representation(instance)
    #     for field in data:
    #         try:
    #             if instance._meta.get_field(field).choices:        
    #                 data[field] = getattr(instance, "get_" + field + "_display")()
    #         except Exception as e:
    #             pass
    #     return data