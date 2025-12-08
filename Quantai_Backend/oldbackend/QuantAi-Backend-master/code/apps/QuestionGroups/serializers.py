from django.apps import apps
from django.db.models import Q
from rest_framework import serializers

from .models import (
    QuestionGroup,
    QuestionChoicesGroup,
)

from libs.serializers import (
    ModelSerializer,
    Serializer,
    CheckOnlySpecialUndescoreAllowed
)

from apps.Questions.serializers import (
    QuestionAdminSerializer,
    QuestionChoicesQuestionAdminSerializer,
)

class QuestionGroupAdminViewSerializer(ModelSerializer):

    questions = QuestionAdminSerializer(many=True)
    
    class Meta:
        model = QuestionGroup
        exclude = [
            'project',
            'geodata',
            'created_on',
            'updated_on'
        ]

class QuestionGroupAdminAddEditSerializer(ModelSerializer):
    
    class Meta:
        model = QuestionGroup
        exclude = [
            'project',
            'geodata',
            'created_on',
            'updated_on'
        ]

    def __init__(self, *args, **kwargs):
        try:
            id = kwargs['data'].get("id", None)
            if id:
                instance = QuestionGroup.objects.get(id = id)
                super().__init__(instance=instance, *args, **kwargs)
            else:
                super().__init__(*args, **kwargs)
        except Exception as e:
            super().__init__(*args, **kwargs)

    def validate_questions(self, questions):
        for question in questions:
            if self.instance:
                if question.questions_group.filter( ~Q(id = self.instance.id), project__id = self.instance.project.id ).count() > 0 or self.instance.project.id != question.project.id:
                    raise serializers.ValidationError('One or More question associated with other group in same project. or does not belongs to this project.')
            else:
                if question.questions_group.filter( project__id = self.context['project'].id ).count() > 0 or self.context['project'].id != question.project.id:
                    raise serializers.ValidationError('One or More question associated with other group in same project.')
        return questions

    def save(self):
        if self.instance:
            return super().save()
        else:
            questions = self.validated_data.pop('questions')
            question_group = self.context['project'].questions_group.create(
                **self.validated_data
            )
            question_group.questions.set(questions)
            return question_group
        
class QuestionChoicesGroupAdminViewSerializer(ModelSerializer):

    options = QuestionChoicesQuestionAdminSerializer(many=True)
    
    class Meta:
        model = QuestionChoicesGroup
        exclude = [
            'question',
            'geodata',
            'created_on',
            'updated_on'
        ]

class QuestionChoicesGroupAdminAddEditSerializer(ModelSerializer):
    
    class Meta:
        model = QuestionChoicesGroup
        exclude = [
            'question',
            'geodata',
            'created_on',
            'updated_on'
        ]

    def __init__(self, *args, **kwargs):
        try:
            id = kwargs['data'].get("id", None)
            if id:
                instance = QuestionChoicesGroup.objects.get(id = id)
                super().__init__(instance=instance, *args, **kwargs)
            else:
                super().__init__(*args, **kwargs)
        except Exception as e:
            super().__init__(*args, **kwargs)

    def validate_options(self, options):
        for option in options:
            if self.instance:
                if option.options_group.filter( ~Q(id = self.instance.id), question__id = self.instance.question.id ).count() > 0 or self.instance.question.id != option.question.id:
                    raise serializers.ValidationError('One or More option associated with other group in same Question. or does not belongs to this Quesion.')
            else:
                if option.options_group.filter( question__id = self.context['question'].id ).count() > 0 or self.context['question'].id != option.question.id:
                    raise serializers.ValidationError('One or More option associated with other group in same Question.')
        return options

    def save(self):
        if self.instance:
            return super().save()
        else:
            options = self.validated_data.pop('options')
            option_group = self.context['question'].options_group.create(
                **self.validated_data
            )
            option_group.options.set(options)
            return option_group