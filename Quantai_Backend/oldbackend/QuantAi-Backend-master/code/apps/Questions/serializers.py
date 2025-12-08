from django.apps import apps

from rest_framework import serializers
from rest_framework.fields import empty

from .models import (
    Question,
    QuestionChoices,
    QuestionColumn,
    QuestionMasterChoices,
    QuestionRow,
    DefaultLogicRoute,
    LogicGroup,
    LogicCondition,
    LogicRoute
)

from libs.serializers import (
    ModelSerializer,
    Serializer,
    CheckOnlySpecialUndescoreAllowed
)

class QuestionGroupAdminViewSerializer(ModelSerializer):

    # questions = QuestionAdminSerializer(many=True)
    
    class Meta:
        model = model = apps.get_model('QuestionGroups.QuestionGroup')
        exclude = [
            'questions',
            'project',
            'geodata',
            'created_on',
            'updated_on'
        ]

class QuestionChoicesRowAdminSerializer(ModelSerializer):
    
    class Meta:
        model = QuestionChoices
        exclude = [
            'row',
            'question',
            'geodata',
            'created_on',
            'updated_on'
        ]

class QuestionChoicesRowAdminSerializer(ModelSerializer):
    
    class Meta:
        model = QuestionChoices
        exclude = [
            'row',
            'question',
            'geodata',
            'created_on',
            'updated_on'
        ]

class QuestionRowAdminSerializer(ModelSerializer):

    options = QuestionChoicesRowAdminSerializer(many=True)
    
    class Meta:
        model = QuestionRow
        exclude = [
            'question',
            'geodata',
            'created_on',
            'updated_on'
        ]

class QuestionChoicesColumnAdminSerializer(ModelSerializer):
    
    class Meta:
        model = QuestionChoices
        exclude = [
            'column',
            'question',
            'geodata',
            'created_on',
            'updated_on'
        ]


class QuestionMasterChoicesColumnAdminSerializer(ModelSerializer):
    
    class Meta:
        model = QuestionMasterChoices
        exclude = [
            'column',
            'geodata',
            'created_on',
            'updated_on'
        ]

class QuestionColumnAdminSerializer(ModelSerializer):

    options = QuestionChoicesColumnAdminSerializer(many=True)
    master_options = QuestionMasterChoicesColumnAdminSerializer(many=True)
    
    class Meta:
        model = QuestionColumn
        exclude = [
            'question',
            'geodata',
            'created_on',
            'updated_on'
        ]

class QuestionChoicesQuestionAdminListSerializer(serializers.ListSerializer):

    def to_representation(self, data):
        try:
            options = self.context.get('options', None)
            if options:
                data = data.filter(id__in = options.values_list('id', flat=True))
        except Exception as e:
            pass
        return super().to_representation(data)
    
    
class QuestionChoicesQuestionAdminSerializer(ModelSerializer):

    class Meta:
        model = QuestionChoices
        list_serializer_class = QuestionChoicesQuestionAdminListSerializer
        exclude = [
            'question',
            'geodata',
            'created_on',
            'updated_on'
        ]


class QuestionChoicesGroupAdminViewSerializer(ModelSerializer):

    options = QuestionChoicesQuestionAdminSerializer(many=True)
    
    class Meta:
        model = apps.get_model('QuestionGroups.QuestionChoicesGroup')
        exclude = [
            # 'question',
            'geodata',
            'created_on',
            'updated_on'
        ]

class QuestionAdminSerializer(ModelSerializer):

    rows = QuestionRowAdminSerializer(many=True)
    columns = QuestionColumnAdminSerializer(many=True)
    options_non_group = serializers.SerializerMethodField()
    options = QuestionChoicesQuestionAdminSerializer(many=True)
    questions_group = QuestionGroupAdminViewSerializer(many=True)
    options_group = QuestionChoicesGroupAdminViewSerializer(many=True)

    def get_options_non_group(self, obj):
        items = obj.options.filter(options_group=None)
        serializer = QuestionChoicesQuestionAdminSerializer(instance=items, many=True)
        return serializer.data
    
    class Meta:
        model = Question
        exclude = [
            'geodata',
            'project',
            'created_on',
            'updated_on'
        ]

class QuestionAdminAddEditBasicSerializer(ModelSerializer):

    def validate_variable_name(self, variable_name):
        if not CheckOnlySpecialUndescoreAllowed(variable_name):
            raise serializers.ValidationError("Only A-Z,a-z,0-9 and _ allowed as variable name.")
        else:
            project = None
            try:
                project = apps.get_model('Projects.Project').objects.get(id = self.initial_data['project'])
            except Exception as e:
                pass
            if project:
                if project.project_type == "SU":
                    if project.variables.filter( name=variable_name.upper() ).count() > 0 :
                        raise serializers.ValidationError("variable already exists in project")
                if project.project_type == "PR":
                    if apps.get_model('Variables.Variable').objects.filter( type = "PV", name = variable_name.upper() ).count() > 0:
                        raise serializers.ValidationError("variable already exists in system")
        return variable_name
    
    class Meta:
        model = Question
        exclude = [
            'geodata',
            'created_on',
            'updated_on'
        ]

    def __init__(self, *args, **kwargs):
        id = kwargs['data'].get("id", None)
        if id:
            instance = Question.objects.get(id = id)
            super().__init__(instance=instance, *args, **kwargs)
        else:
            super().__init__(*args, **kwargs)

class QuestionRowAddEditAdminSerializer(ModelSerializer):
    
    class Meta:
        model = QuestionRow
        exclude = [
            'geodata',
            'created_on',
            'updated_on'
        ]

    def __init__(self, *args, **kwargs):
        try:
            id = kwargs['data'].get("id", None)
            if id:
                instance = QuestionRow.objects.get(id = id)
                super().__init__(instance=instance, *args, **kwargs)
            else:
                super().__init__(*args, **kwargs)
        except Exception as e:
            super().__init__(*args, **kwargs)
    
class QuestionColumnAddEditAdminSerializer(ModelSerializer):
    
    class Meta:
        model = QuestionColumn
        exclude = [
            'geodata',
            'created_on',
            'updated_on'
        ]

    def __init__(self, *args, **kwargs):
        try:
            id = kwargs['data'].get("id", None)
            if id:
                instance = QuestionColumn.objects.get(id = id)
                super().__init__(instance=instance, *args, **kwargs)
                print (instance)
            else:
                super().__init__(*args, **kwargs)
        except Exception as e:
            super().__init__(*args, **kwargs)

class QuestionMasterChoicesAddEditAdminSerializer(ModelSerializer):
    
    class Meta:
        model = QuestionMasterChoices
        exclude = [
            'variable_name',
            'geodata',
            'created_on',
            'updated_on'
        ]

    def __init__(self, *args, **kwargs):
        try:
            id = kwargs['data'].get("id", None)
            if id:
                instance = QuestionMasterChoices.objects.get(id = id)
                super().__init__(instance=instance, *args, **kwargs)
            else:
                super().__init__(*args, **kwargs)
        except Exception as e:
            super().__init__(*args, **kwargs)

class QuestionChoicesColumnGetAdminSerializer(ModelSerializer):
    
    class Meta:
        model = QuestionChoices
        exclude = [
            'geodata',
            'created_on',
            'updated_on'
        ]


class QuestionChoicesColumnAddEditAdminSerializer(ModelSerializer):
    
    class Meta:
        model = QuestionChoices
        exclude = [
            'variable_name',
            'geodata',
            'created_on',
            'updated_on'
        ]

    def __init__(self, *args, **kwargs):
        try:
            id = kwargs['data'].get("id", None)
            if id:
                instance = QuestionChoices.objects.get(id = id)
                super().__init__(instance=instance, *args, **kwargs)
            else:
                super().__init__(*args, **kwargs)
        except Exception as e:
            super().__init__(*args, **kwargs)

class DefaultLogicRouteGetAdminSerializer(ModelSerializer):

    next_options = QuestionChoicesColumnGetAdminSerializer(many=True)
    next_rows = QuestionRowAdminSerializer(many=True)
    next_columns = QuestionColumnAdminSerializer(many=True)

    class Meta:
        model = DefaultLogicRoute
        exclude = [
            'question',
            'created_on',
            'updated_on',
            'geodata',
        ]

class DefaultLogicRouteAddEditAdminSerializer(ModelSerializer):

    def validate(self, data):
        # if data['next_type'] == "QUE" and ( not data.get('next_question', None) or not data.get('next_options', None)) :
        #     raise serializers.ValidationError("next_question and next_options both require in case of next_type is QUE")
        return data

    def validate_next_options(self, next_options):
        for option in next_options:
            if option.question.id != self.initial_data['next_question']:
                raise serializers.ValidationError("Not all selected options belongs to next_question.") 
        return next_options

    class Meta:
        model = DefaultLogicRoute
        exclude = [
            # 'question',
            'created_on',
            'updated_on',
            'geodata',
        ]

class LogicConditionInlineGetAdminSerializerForLogicGroup(ModelSerializer):

    class Meta:
        model = LogicCondition
        exclude = [
            'logic_group',
            'created_on',
            'updated_on',
            'geodata',
        ]

class LogicRouteInlineGetAdminSerializerForLogicGroup(ModelSerializer):

    next_options = QuestionChoicesQuestionAdminSerializer(many=True)
    next_rows = QuestionRowAdminSerializer(many=True)
    next_columns = QuestionColumnAdminSerializer(many=True)

    class Meta:
        model = LogicRoute
        exclude = [
            'logic_group',
            'created_on',
            'updated_on',
            'geodata',
        ]

class LogicGroupGetAdminSerializer(ModelSerializer):

    conditions = LogicConditionInlineGetAdminSerializerForLogicGroup(many=True)
    route = LogicRouteInlineGetAdminSerializerForLogicGroup()

    class Meta:
        model = LogicGroup
        exclude = [
            'question',
            'created_on',
            'updated_on',
            'geodata',
        ]

class LogicGroupAddEditAdminSerializer(ModelSerializer):

    class Meta:
        model = LogicGroup
        exclude = [
            'created_on',
            'updated_on',
            'geodata',
        ]

    def __init__(self, *args, **kwargs):
        try:
            id = kwargs['data'].get("id", None)
            if id:
                instance = LogicGroup.objects.get(id = id)
                super().__init__(instance=instance, *args, **kwargs)
            else:
                super().__init__(*args, **kwargs)
        except Exception as e:
            super().__init__(*args, **kwargs)

class LogicRouteAddEditAdminSerializer(ModelSerializer):

    class Meta:
        model = LogicRoute
        exclude = [
            'created_on',
            'updated_on',
            'geodata',
        ]

    def __init__(self, *args, **kwargs):
        try:
            id = kwargs['data'].get("id", None)
            if id:
                instance = LogicRoute.objects.get(id = id)
                super().__init__(instance=instance, *args, **kwargs)
            else:
                super().__init__(*args, **kwargs)
        except Exception as e:
            super().__init__(*args, **kwargs)

class LogicConditionAddEditAdminSerializer(ModelSerializer):

    class Meta:
        model = LogicCondition
        exclude = [
            'created_on',
            'updated_on',
            'geodata',
        ]

    # def validate_variable_type(self, variable_type):
    #     print (self.initial_data)
    #     return variable_type

    # def validate_variable_value(self, variable_value):
    #     if type(self.initial_data) == list:
    #         initial_data = self.initial_data[0]
    #     else:
    #         initial_data = self.initial_data
    #     print (initial_data)
    #     if initial_data['logic_type'] in ['QV','SV']:
    #         if variable_value in ['', None]:
    #             raise serializers.ValidationError("Value needed in case of logic type is Question variable or Survey Variable")

    # def validate_comparison_input(self, comparison_input):
    #     if type(self.initial_data) == list:
    #         initial_data = self.initial_data[0]
    #     else:
    #         initial_data = self.initial_data
    #     if initial_data['comparison_to_variable'] == False:
    #         if comparison_input not in ["", None]:
    #             if initial_data['condition'] in ["GT", "LT", "GTE", "LTE"]:
    #                 if not comparison_input.isnumeric():
    #                     raise serializers.ValidationError("In case of comparision condition, Input must be number.")
    #                 if not initial_data['variable_value'].value.isnumeric():
    #                     raise serializers.ValidationError("Can not compare non-numeric variable value with comparision operator.")
    #         else:
    #             raise serializers.ValidationError("Need value to compare.")
    #     return comparison_input
    
    # def validate_comparison_value(self, comparison_value):
    #     if type(self.initial_data) == list:
    #         initial_data = self.initial_data[0]
    #     else:
    #         initial_data = self.initial_data
    #     if initial_data['comparison_to_variable'] == True:
    #         if comparison_value not in ["", None]:
    #             if initial_data['condition'] in ["GT", "LT", "GTE", "LTE"]:
    #                 if not comparison_value.value.isnumeric() or not initial_data['variable_value'].value.isnumeric():
    #                     raise serializers.ValidationError("Can not compare non-numeric variable value with comparision operator.")
    #         else:
    #             raise serializers.ValidationError("Need value to compare.")
    #     return comparison_value

    def __init__(self, *args, **kwargs):
        try:
            id = kwargs['data'].get("id", None)
            if id:
                instance = LogicCondition.objects.get(id = id)
                super().__init__(instance=instance, *args, **kwargs)
            else:
                super().__init__(*args, **kwargs)
        except Exception as e:
            print (e)
            super().__init__(*args, **kwargs)



"""
Audiance Serializer section
"""

def QuestionObjectScrambler(itmes, item_type, option_rotation, question): 
    """
    items : objets of rows, column, options
    item_type : RO = rows, CO = Column, OP = Options
    question : question object
    """
    if option_rotation == "RT":
        options = list(itmes.filter(option_rotation_anchor = False))
        initial_id = options[0].id
        while True:
            if item_type == "OP":
                if options[0].id == question.last_rotate_options or \
                    question.last_rotate_options == 0 \
                    or options[0].id == initial_id:
                    # logic here
                    question.last_rotate_options = options[0].id
                    question.save()
                    for anc_options in itmes.filter(option_rotation_anchor = True):
                        options.insert(anc_options.ui_index, anc_options)
                    break
                else:
                    options = options[1:] + options[:1]
            if item_type == "CO":
                if options[0].id == question.last_rotate_columns or \
                    question.last_rotate_columns == 0 \
                    or options[0].id == initial_id:
                    # logic here
                    question.last_rotate_columns = options[0].id
                    question.save()
                    for anc_options in itmes.filter(option_rotation_anchor = True):
                        options.insert(anc_options.ui_index, anc_options)
                    break
                else:
                    options = options[1:] + options[:1]
            if item_type == "RO":
                if options[0].id == question.last_rotate_rows or \
                    question.last_rotate_rows == 0 \
                    or options[0].id == initial_id:
                    # logic here
                    question.last_rotate_rows = options[0].id
                    question.save()
                    for anc_options in itmes.filter(option_rotation_anchor = True):
                        options.insert(anc_options.ui_index, anc_options)
                    break
                else:
                    options = options[1:] + options[:1]
        return options
    elif option_rotation == "RD":
        options = list(itmes.filter(option_rotation_anchor = False).order_by('?').order_by('?'))
        for anc_options in itmes.filter(option_rotation_anchor = True):
            options.insert(anc_options.ui_index, anc_options)
        return options
    else:
        return itmes
class QuestionChoicesColumnAudianceSerializer(ModelSerializer):
    
    class Meta:
        model = QuestionChoices
        exclude = [
            'column',
            'question',
            'geodata',
            'created_on',
            'updated_on'
        ]

class QuestionChoicesQuestionAudianceSerializer(ModelSerializer):

    class Meta:
        model = QuestionChoices
        list_serializer_class = QuestionChoicesQuestionAdminListSerializer
        exclude = [
            'question',
            'geodata',
            'created_on',
            'updated_on'
        ]

class QuestionRowAudianceSerializer(ModelSerializer):

    options = serializers.SerializerMethodField() # QuestionChoicesRowAdminSerializer(many=True)
    
    def get_options(self, obj):
        items = self.context.get('options')
        serializer = QuestionChoicesQuestionAudianceSerializer(
            instance=QuestionObjectScrambler(items, 'OP', self.context.get('question').option_rotation, self.context.get('question')), 
            many=True
        )
        return serializer.data

    class Meta:
        model = QuestionRow
        exclude = [
            'question',
            'geodata',
            'created_on',
            'updated_on'
        ]

class QuestionColumnAudianceSerializer(ModelSerializer):

    options = serializers.SerializerMethodField() # QuestionChoicesColumnAudianceSerializer(many=True)
    master_options = QuestionMasterChoicesColumnAdminSerializer(many=True)

    def get_options(self, obj):
        items = self.context.get('options')
        serializer = QuestionChoicesColumnAudianceSerializer(
            instance=QuestionObjectScrambler(items, 'OP', self.context.get('question').option_rotation, self.context.get('question')), 
            many=True
        )
        return serializer.data
    
    class Meta:
        model = QuestionColumn
        exclude = [
            'question',
            'geodata',
            'created_on',
            'updated_on'
        ]

class QuestionAudianceSerializer(ModelSerializer):

    rows = serializers.SerializerMethodField() # QuestionRowAudianceSerializer(many=True)
    columns = serializers.SerializerMethodField() # QuestionColumnAdminSerializer(many=True)
    options_non_group = serializers.SerializerMethodField()
    options = QuestionChoicesQuestionAudianceSerializer(many=True)
    questions_group = QuestionGroupAdminViewSerializer(many=True)
    options_group = QuestionChoicesGroupAdminViewSerializer(many=True)

    def get_rows(self, obj):
        rows = self.context.get('rows')
        return_item = []
        for row in QuestionObjectScrambler(rows, 'RO', self.instance.row_rotation, self.instance):
            items = self.context.get('options').filter( row = row )
            serializer = QuestionRowAudianceSerializer(
                instance=row,
                context = {
                    'options': items,
                    'question' : self.instance,
                },
            )
            return_item.append(serializer.data)
        return return_item
    
    def get_columns(self, obj):
        columns = self.context.get('columns')
        return_item = []
        for column in QuestionObjectScrambler(columns, 'CO', self.instance.column_rotation, self.instance):
            items = self.context.get('options').filter( column = column )
            serializer = QuestionColumnAudianceSerializer(
                instance=column,
                context = {
                    'options': items,
                    'question' : self.instance,
                },
            )
            return_item.append(serializer.data)
        return return_item

    def get_options_non_group(self, obj):
        # self.context.get('options')
        items = obj.options.filter(options_group=None)
        return_item = []
        for option in QuestionObjectScrambler(items, 'OP', self.instance.option_rotation, self.instance):
            if option in self.context.get('options'):
                serializer = QuestionChoicesQuestionAudianceSerializer(
                    instance=option, 
                )
                return_item.append(serializer.data)
        return return_item
    
    class Meta:
        model = Question
        exclude = [
            'geodata',
            'project',
            'created_on',
            'updated_on'
        ]