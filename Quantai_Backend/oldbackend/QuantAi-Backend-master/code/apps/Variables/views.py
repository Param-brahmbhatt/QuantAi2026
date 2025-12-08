from django.shortcuts import render
from django.apps import apps
from django.db.models import Q,F

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from rest_framework.pagination import PageNumberPagination
from rest_framework.settings import api_settings

from django_countries import countries

from libs.permissions import AllowAdminOnly, AllowAudianceOnly
from libs.request import RequestDefaultDataMapper

from .models import (
    Variable
)

from apps.Questions.serializers import (
    QuestionChoicesQuestionAdminSerializer
)

class VariablesCheckView(APIView, PageNumberPagination):
    
    permission_classes = (*api_settings.DEFAULT_PERMISSION_CLASSES, AllowAdminOnly,)
    page_size = api_settings.PAGE_SIZE

    def get(self, request, *args, **kwargs):
        pid = request.GET.get('pid', None)
        variable_name = request.GET.get('variable_name', None)
        if not variable_name or not pid:
            return Response(
                {
                    'detail' : 'Need pid and variable_name as get parameter'
                },
                status=400,
            )
        try:
            project = apps.get_model('Projects.Project').objects.get( id = pid )
            if project.project_type == "SU":
                variable_type = "SV"
            else:
                variable_type = "GV"
        except apps.get_model('Projects.Project').DoesNotExist as e:
            return Response(
                {
                    'detail' : 'Project Not Found'
                },
                status=404,
            )            
        except Exception as e:
            return Response(
                {
                    'detail' : 'Please Contact Admin'
                },
                status=500,
            )
        if Variable.objects.filter(
            type = variable_type,
            name = variable_name,
            project = project,
        ).count() > 0:
            return Response(
                {
                    'duplicate' : True,
                },
                status=200,
            )
        else:
            return Response(
                {
                    'duplicate' : False,
                },
                status=200,
            )


class VariablesView(APIView, PageNumberPagination):
    
    permission_classes = (*api_settings.DEFAULT_PERMISSION_CLASSES, AllowAdminOnly,)
    page_size = api_settings.PAGE_SIZE

    def get(self, request, *args, **kwargs):
        variable_type = request.GET.get('variable_type', None)
        pid = request.GET.get('pid', None)
        qid = request.GET.get('qid', None)
        if not variable_type:
            return Response(
                {
                    'variable_type' : 'variable_type needed'
                },
                status=400,
            )  
        else:
            if variable_type == "SV":
                if not pid:
                    return Response(
                        {
                            'pid' : 'project id needed'
                        },
                        status=400,
                    ) 
                else:
                    return Response(
                        Variable.objects.filter(type = variable_type, project__id = pid ).values('id','name'),
                        status=200,
                    )
            if variable_type in ["QV", "CV"]:
                if not pid:
                    return Response(
                        {
                            'pid' : 'project id needed'
                        },
                        status=400,
                    ) 
                else:
                    project = apps.get_model('Projects.Project').objects.get(id = pid)
                    if project.project_type == "PR":
                        variable_type = "PV"
                    else:
                        variable_type = "QV"
                    if qid:
                        return Response(
                            Variable.objects.filter(~Q(question__id=qid), type = variable_type, project__id = pid ).values('id','name', 'question__title'),
                            status=200,
                        )
                    else:
                        return Response(
                            Variable.objects.filter(type = variable_type, project__id = pid ).values('id','name', 'question__title'),
                            status=200,
                        ) 
            if variable_type == "PV":
                return Response(
                    Variable.objects.filter(type = variable_type).values('id','name'),
                    status=200,
                ) 

class VariableOptionsView(APIView, PageNumberPagination):
    
    permission_classes = (*api_settings.DEFAULT_PERMISSION_CLASSES, AllowAdminOnly,)
    page_size = api_settings.PAGE_SIZE

    def get(self, request, *args, **kwargs):
        vid = request.GET.get('vid', None)
        if not vid:
            return Response(
                {
                    'vid' : 'vid needed'
                },
                status=400,
            )  
        else:
            try:
                variable = apps.get_model('Variables.Variable').objects.get(id = vid, type__in=["QV","PV"])
            except apps.get_model('Variables.Variable').DoesNotExist as e:
                return Response(status=404)
            except Exception as e:
                return Response(status=500)
            return Response(
                QuestionChoicesQuestionAdminSerializer(variable.question.options.all(), many=True).data,
                status=200
            )
        
class VariablesProfilingWithOptionsView(APIView, PageNumberPagination):
    
    permission_classes = (*api_settings.DEFAULT_PERMISSION_CLASSES, AllowAdminOnly,)
    page_size = api_settings.PAGE_SIZE

    def get(self, request, *args, **kwargs):
        data = []
        for variable in Variable.objects.filter(type = "PV"):
            data.append(
                {
                    'id' : variable.id,
                    'name' : variable.name,
                    'options' : QuestionChoicesQuestionAdminSerializer(variable.question.options.all(), many=True).data
                }
            )
        return Response(
            data,
            status=200,
        ) 

class MyProfillingVariables(APIView, PageNumberPagination):
    
    permission_classes = (*api_settings.DEFAULT_PERMISSION_CLASSES, AllowAudianceOnly,)
    page_size = api_settings.PAGE_SIZE

    def get(self, request, *args, **kwargs):
        variables = []
        print (request.user.profile.answers.filter(variable__type = "PV", is_last = True))
        for variable in request.user.profile.answers.filter(variable__type = "PV", is_last = True):
            variables.append(
                {
                    'id' : variable.variable.id,
                    'name' : variable.variable.name,
                    'value' : variable.option.value,
                    'label' : variable.option.label,
                }
            )
        return Response(
            variables,
            status=200,
        )