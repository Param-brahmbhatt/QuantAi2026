from django.shortcuts import render
from django.apps import apps

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from rest_framework.pagination import PageNumberPagination
from rest_framework.settings import api_settings

from django_countries import countries

from libs.permissions import AllowAdminOnly
from libs.request import RequestDefaultDataMapper

from .serializers import (
    QuestionGroupAdminAddEditSerializer,
    QuestionGroupAdminViewSerializer,

    QuestionChoicesGroupAdminAddEditSerializer,
    QuestionChoicesGroupAdminViewSerializer,
)

# Create your views here.

class QuestionGroupView(APIView):
    
    permission_classes = (*api_settings.DEFAULT_PERMISSION_CLASSES, AllowAdminOnly,)

    def get(self, request, *args, **kwargs):
        pid = request.GET.get('pid', None)
        id = request.GET.get('id', None)
        if id:
            try:
                instance = apps.get_model('QuestionGroups.QuestionGroup').objects.get(id = id)
            except apps.get_model('QuestionGroups.QuestionGroup').DoesNotExist as e:
                return Response(status=404)
            except Exception as e:
                return Response(status=500)
            return Response(
                QuestionGroupAdminViewSerializer(instance).data,
                status=200,
            )
        else:
            if not pid:
                return Response(
                        {
                            'detail' : 'Please provide pid in as get parameter'
                        },
                        status=400,
                    )
            try:
                instances = apps.get_model('QuestionGroups.QuestionGroup').objects.filter(project__id = pid)
            except apps.get_model('QuestionGroups.QuestionGroup').DoesNotExist as e:
                return Response(status=404)
            except Exception as e:
                return Response(status=500)
            return Response(
                QuestionGroupAdminViewSerializer(instances, many=True).data,
                status=200,
            )
        
    def post(self, request, *args, **kwargs):
        pid = request.GET.get('pid', None)
        if not pid:
            return Response(
                {
                    'detail' : 'Please provide pid or qid in as get parameter'
                },
                status=400,
            )
        else:
            try:
                project = apps.get_model('Projects.Project').objects.get(id = pid)
            except apps.get_model('Projects.Project').DoesNotExist as e:
                return Response(status=404)
            except Exception as e:
                return Response(status=500) 
        serializer = QuestionGroupAdminAddEditSerializer(
            data = request.data, 
            context={
                'request': request,
                'project': project
            }
        )
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        return Response(
            QuestionGroupAdminViewSerializer(instance).data,
            status=200,
        ) 
    
    def put(self, request, *args, **kwargs):
        id = request.GET.get('id', None)
        if id:
            try:
                instance = apps.get_model('QuestionGroups.QuestionGroup').objects.get(id = id)
            except apps.get_model('QuestionGroups.QuestionGroup').DoesNotExist as e:
                return Response(status=404)
            except Exception as e:
                return Response(status=500)
            serializer = QuestionGroupAdminAddEditSerializer(
                data = request.data, 
                instance=instance,
                partial=True,
                context={
                    'request': request
                }
            )
            serializer.is_valid(raise_exception=True)
            instance = serializer.save()
            return Response(
                QuestionGroupAdminViewSerializer(instance).data,
                status=200,
            )
        else:
            return Response(
                {
                    'detail' : "invalid id"
                },
                status=400,
            ) 
        
    def delete(self, request, *args, **kwargs):
        id = request.GET.get('id', None)
        if id:
            try:
                instance = apps.get_model('QuestionGroups.QuestionGroup').objects.get(id = id)
            except apps.get_model('QuestionGroups.QuestionGroup').DoesNotExist as e:
                return Response(status=404)
            except Exception as e:
                return Response(status=500)
            instance.delete()
            return Response(status=200)
        else:
            return Response(
                {
                    'detail' : "invalid id"
                },
                status=400,
            )
   
  
class OptionGroupView(APIView):
    
    permission_classes = (*api_settings.DEFAULT_PERMISSION_CLASSES, AllowAdminOnly,)

    def get(self, request, *args, **kwargs):
        qid = request.GET.get('qid', None)
        id = request.GET.get('id', None)
        if id:
            try:
                instance = apps.get_model('QuestionGroups.QuestionChoicesGroup').objects.get(id = id)
            except apps.get_model('QuestionGroups.QuestionChoicesGroup').DoesNotExist as e:
                return Response(status=404)
            except Exception as e:
                return Response(status=500)
            return Response(
                QuestionChoicesGroupAdminViewSerializer(instance).data,
                status=200,
            )
        else:
            if not qid:
                return Response(
                        {
                            'detail' : 'Please provide pid in as get parameter'
                        },
                        status=400,
                    )
            try:
                instances = apps.get_model('QuestionGroups.QuestionChoicesGroup').objects.filter(question__id = qid)
            except apps.get_model('QuestionGroups.QuestionChoicesGroup').DoesNotExist as e:
                return Response(status=404)
            except Exception as e:
                return Response(status=500)
            return Response(
                QuestionChoicesGroupAdminViewSerializer(instances, many=True).data,
                status=200,
            )
        
    def post(self, request, *args, **kwargs):
        qid = request.GET.get('qid', None)
        if not qid:
            return Response(
                {
                    'detail' : 'Please provide qid in as get parameter'
                },
                status=400,
            )
        else:
            try:
                question = apps.get_model('Questions.Question').objects.get(id = qid)
            except apps.get_model('Questions.Question').DoesNotExist as e:
                return Response(status=404)
            except Exception as e:
                return Response(status=500) 
        serializer = QuestionChoicesGroupAdminAddEditSerializer(
            data = request.data, 
            context={
                'request': request,
                'question': question
            }
        )
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        return Response(
            QuestionChoicesGroupAdminViewSerializer(instance).data,
            status=200,
        ) 
    
    def put(self, request, *args, **kwargs):
        id = request.GET.get('id', None)
        if id:
            try:
                instance = apps.get_model('QuestionGroups.QuestionChoicesGroup').objects.get(id = id)
            except apps.get_model('QuestionGroups.QuestionChoicesGroup').DoesNotExist as e:
                return Response(status=404)
            except Exception as e:
                return Response(status=500)
            serializer = QuestionChoicesGroupAdminAddEditSerializer(
                data = request.data, 
                instance=instance,
                partial=True,
                context={
                    'request': request
                }
            )
            serializer.is_valid(raise_exception=True)
            instance = serializer.save()
            return Response(
                QuestionChoicesGroupAdminViewSerializer(instance).data,
                status=200,
            )
        else:
            return Response(
                {
                    'detail' : "invalid id"
                },
                status=400,
            ) 
        
    def delete(self, request, *args, **kwargs):
        id = request.GET.get('id', None)
        if id:
            try:
                instance = apps.get_model('QuestionGroups.QuestionChoicesGroup').objects.get(id = id)
            except apps.get_model('QuestionGroups.QuestionChoicesGroup').DoesNotExist as e:
                return Response(status=404)
            except Exception as e:
                return Response(status=500)
            instance.delete()
            return Response(status=200)
        else:
            return Response(
                {
                    'detail' : "invalid id"
                },
                status=400,
            )
   
  