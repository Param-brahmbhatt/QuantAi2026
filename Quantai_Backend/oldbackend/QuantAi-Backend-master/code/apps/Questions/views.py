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

import copy

from .serializers import (
    QuestionAdminSerializer,
    QuestionAdminAddEditBasicSerializer,
    QuestionRowAddEditAdminSerializer,
    QuestionColumnAddEditAdminSerializer,
    QuestionChoicesColumnAddEditAdminSerializer,
    DefaultLogicRouteAddEditAdminSerializer,
    DefaultLogicRouteGetAdminSerializer,
    LogicGroupGetAdminSerializer,
    LogicGroupAddEditAdminSerializer,
    LogicRouteAddEditAdminSerializer,
    LogicConditionAddEditAdminSerializer,
    QuestionMasterChoicesAddEditAdminSerializer,
)

class QuestionsView(APIView, PageNumberPagination):
    
    permission_classes = (*api_settings.DEFAULT_PERMISSION_CLASSES, AllowAdminOnly,)
    page_size = api_settings.PAGE_SIZE

    def get(self, request, *args, **kwargs):
        pid = request.GET.get('pid', None)
        qid = request.GET.get('qid', None)
        if not pid and not qid:
            return Response(
                    {
                        'detail' : 'Please provide pid or qid in as get parameter'
                    },
                    status=400,
                )
        if qid:
            try:
                instance = apps.get_model('Questions.Question').objects.get(id = qid)
            except apps.get_model('Questions.Question').DoesNotExist as e:
                return Response(status=404)
            except Exception as e:
                return Response(status=500)
            return Response(
                QuestionAdminSerializer(instance).data,
                status=200,
            )
        else:
            try:
                questions = apps.get_model('Projects.Project').objects.get(id = pid).questions.all()
            except apps.get_model('Projects.Project').DoesNotExist as e:
                return Response(status=404)
            except Exception as e:
                return Response(status=500)
            return Response(
                QuestionAdminSerializer(questions, many=True).data,
                status=200,
            )
            # return self.get_paginated_response(
            #     QuestionAdminSerializer(
            #         self.paginate_queryset(
            #             project,
            #             request=request,
            #             view=self,
            #         ),
            #         many = True,
            #     ).data,
            # )
        
    def post(self, request, *args, **kwargs):
        pid = request.GET.get('pid', None)
        if not pid:
            return Response(
                {
                    'detail' : 'Please provide pid or qid in as get parameter'
                },
                status=400,
            )
        basic_details = request.data.get("basic_details", None)
        if basic_details:
            selective_response_mmq = basic_details.get("selective_response_mmq", None)
            if selective_response_mmq:
                basic_details['open_end_input_mmq'] = False
                basic_details['no_of_open_end_in_mmq'] = 0
            basic_details['project'] = pid
            serializer = QuestionAdminAddEditBasicSerializer(
                data = basic_details, 
                context={
                    'request': request
                })
            if serializer.is_valid():
                question = serializer.save()
            else:
                return Response(
                    {
                        "basic_details" : serializer.errors
                    },
                    status=400,
                )
        else:
            return Response(
                {
                    'detail' : 'Please provide basic_details in body'
                },
                status=400,
            )
        rows = request.data.get("rows", None)
        if question.open_end_input_mmq:
            rows = []
            for counter in range(0, question.no_of_open_end_in_mmq):
                rows.append(
                    {
                        "label" : f'openend_{str(counter)}',
                        "is_other" : True,
                    }
                )
        if rows:
            for row in rows:
                row['question'] = question.id
            serializer = QuestionRowAddEditAdminSerializer(
                data = rows, 
                many=True, 
                context={'request': request}
            )
            if serializer.is_valid():
                rows = serializer.save()
            else:
                question.delete()
                return Response(
                    {
                        "rows" : serializer.errors
                    },
                    status=400,
                )
        columns = request.data.get("columns", None)
        if columns:
            errors = []
            error_count = 0
            for column in columns:
                column['question'] = question.id
                options = column.get("options", None)
                serializer = QuestionColumnAddEditAdminSerializer(
                    data = column,  
                    context={'request': request}
                )
                if serializer.is_valid():
                    instance = serializer.save()
                    if options:
                        for option in options:
                            option['column'] = instance.id
                            serializer = QuestionMasterChoicesAddEditAdminSerializer(
                                data = option,
                                context={'request': request}
                            )
                            if serializer.is_valid():
                                m_option = serializer.save()
                            else:
                                errors.append(
                                    {
                                        'options' : serializer.errors,
                                    }  
                                )
                                error_count += 1
                    errors.append({})
                else:
                    errors.append(serializer.errors)
                    error_count += 1
            if error_count != 0:
                question.delete()
                return Response(
                    {
                        "columns" : errors
                    },
                    status=400,
                )
        options = request.data.get("options", None)
        if options:
            for option in options:
                option['question'] = question.id
            serializer = QuestionChoicesColumnAddEditAdminSerializer(
                data = options, 
                many=True,
                context={'request': request}
            )
            if serializer.is_valid():
                serializer.save()
            else:
                question.delete()
                return Response(
                    {
                        'options' : serializer.errors
                    },
                    status=400,
                )
        if question.question_type in ['SIG', 'COM']:
            question.options.create(
                ui_index = 1,
                value = 'OPEN_INPUT',
                label = question.placeholder_text
            )
        return Response(
                QuestionAdminSerializer(question).data,
                status=200,
            ) 
    
    def put(self, request, *args, **kwargs):
        pid = request.GET.get('pid', None)
        if not pid:
            return Response(
                {
                    'detail' : 'Please provide pid or qid in as get parameter'
                },
                status=400,
            )
        basic_details = request.data.get("basic_details", None)
        if basic_details:
            serializer = QuestionAdminAddEditBasicSerializer(
                data = basic_details, 
                partial=True,
                context={'request': request}
            )
            serializer.is_valid(raise_exception=True)
            question = serializer.save()
        else:
            return Response(
                {
                    'detail' : 'Please provide basic_details in body'
                },
                status=400,
            )
        rows = request.data.get("rows", None)
        if question.open_end_input_mmq:
            rows = []
            try:
                last_row_number = int(question.rows.all().order_by('-label')[0].label.split("_")[-1])
            except Exception as e:
                last_row_number = 0
            if question.rows.count() < question.no_of_open_end_in_mmq:
                for counter in range(last_row_number, question.no_of_open_end_in_mmq):
                    rows.append(
                        {
                            "label" : f'openend_{str(counter)}',
                            "is_other" : True,
                            "question" : question.id,
                            "ui_index" : counter,
                        }
                    )
            if question.rows.count() > question.no_of_open_end_in_mmq:
                for row in list(question.rows.all())[-1*(question.rows.count() - question.no_of_open_end_in_mmq):]:
                    row.delete()
            
        if rows:
            for row in rows:
                if row.get("delete", False):
                    apps.get_model('Questions.QuestionRow').objects.get(id = row.get("id")).delete()
                else:
                    if not row.get("question", None):
                        row['question'] = question.id
                    serializer = QuestionRowAddEditAdminSerializer(
                        data = row, 
                        partial=True,
                        context={'request': request}
                    )
                    serializer.is_valid(raise_exception=True)
                    row = serializer.save()

        columns = request.data.get("columns", None)
        if columns:
            for column in columns:
                if column.get("delete", False):
                    apps.get_model('Questions.QuestionColumn').objects.get(id = column.get("id")).delete()
                else:
                    if not column.get("question", None):
                        column['question'] = question.id
                    options = column.get("options", None)
                    serializer = QuestionColumnAddEditAdminSerializer(
                        data = column,  
                        partial=True,
                        context={'request': request}
                    )
                    serializer.is_valid(raise_exception=True)
                    instance = serializer.save()
                    if options:
                        for option in options:
                            if option.get("delete", False):
                                apps.get_model('Questions.QuestionMasterChoices').objects.get(id = option.get("id")).delete()
                            else:
                                if not option.get("column", None):
                                    option['column'] = instance.id
                                serializer = QuestionMasterChoicesAddEditAdminSerializer(
                                    data = option, 
                                    partial=True,
                                    context={'request': request}
                                )
                                serializer.is_valid(raise_exception=True)
                                serializer.save()
        options = request.data.get("options", None)
        if options:
            if question.allow_other == False and question.question_type not in ['SCM', 'MCM']: 
                question.options.filter(is_other = True).delete()
            for option in options:
                if option.get("delete", False):
                    apps.get_model('Questions.QuestionChoices').objects.get(id = option.get("id")).delete()
                else:
                    try:
                        if option['is_other'] == True and question.allow_other == False:
                            continue
                    except Exception as e:
                        pass
                    option['question'] = question.id
                    serializer = QuestionChoicesColumnAddEditAdminSerializer(
                        data = option, 
                        partial=True,
                        context={'request': request}
                    )
                    if serializer.is_valid():
                        serializer.save()
                    else:
                        return Response(
                            [ error for error in serializer.errors if len(error) > 0],
                            status=400,
                        )
        return Response(
                QuestionAdminSerializer(question).data,
                status=200,
            ) 
        
    def delete(self, request, *args, **kwargs):
        id = request.GET.get('id', None)
        if id:
            try:
                instance = apps.get_model('Questions.Question').objects.get(id = id)
            except apps.get_model('Questions.Question').DoesNotExist as e:
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
   
        
class QuestionsReindexView(APIView, PageNumberPagination):
    
    permission_classes = (*api_settings.DEFAULT_PERMISSION_CLASSES, AllowAdminOnly,)

    def post(self, request, *args, **kwargs):
        pid = request.GET.get("pid", None)
        if not pid:
            return Response(
                {
                    'pid' : 'project id needed',
                },
                status=400
            )
        try:
            instance = apps.get_model('Projects.Project').objects.get(id = pid)
        except  apps.get_model('Projects.Project').DoesNotExist as e:
            return Response(status=404)
        except Exception as e:
            return Response(status=500)
        for qid, index in request.data.items():
            instance.questions.filter(id = int(qid)).update( display_index = int(index) )
        return Response(
            QuestionAdminSerializer(instance.questions.all(), many=True).data,
            status=200
        )
    

class QuestionsDefaultLogicView(APIView, PageNumberPagination):
    
    permission_classes = (*api_settings.DEFAULT_PERMISSION_CLASSES, AllowAdminOnly,)
    page_size = api_settings.PAGE_SIZE

    def get(self, request, *args, **kwargs):
        qid = request.GET.get("qid", None)
        if not qid:
            return Response(
                {
                    'qid' : 'question id needed',
                },
                status=400
            )
        try:
            instance = apps.get_model('Questions.Question').objects.get(id = qid)
            try:
                instance = apps.get_model('Questions.DefaultLogicRoute').objects.get(question__id = instance.id)
            except apps.get_model('Questions.DefaultLogicRoute').DoesNotExist as e:
                return Response(status=404)
            except Exception as e:
                return Response(status=500)
        except apps.get_model('Questions.Question').DoesNotExist as e:
            return Response(status=404)
        except Exception as e:
            return Response(status=500)
        return Response(
            DefaultLogicRouteGetAdminSerializer(instance).data,
            status=200
        )
    
    def post(self, request, *args, **kwargs):
        qid = request.GET.get("qid", None)
        if not qid:
            return Response(
                {
                    'qid' : 'question id needed',
                },
                status=400
            )
        try:
            instance = apps.get_model('Questions.Question').objects.get(id = qid)
        except apps.get_model('Questions.Question').DoesNotExist as e:
            return Response(status=404)
        except Exception as e:
            return Response(status=500)
        request.data['question'] = qid
        if str(qid) == str(request.data['next_question']):
            return Response(
                {
                    'next_question' : 'Route pointing to same question.',
                },
                status=400
            )
        serializer = DefaultLogicRouteAddEditAdminSerializer(
            data = request.data,
        )
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        return Response(
            DefaultLogicRouteGetAdminSerializer(instance).data,
            status=200
        )
    
    def put(self, request, *args, **kwargs):
        qid = request.GET.get("qid", None)
        if not qid:
            return Response(
                {
                    'qid' : 'question id needed',
                },
                status=400
            )
        try:
            instance = apps.get_model('Questions.Question').objects.get(id = qid)
            try:
                instance = apps.get_model('Questions.DefaultLogicRoute').objects.get(question__id = instance.id)
            except apps.get_model('Questions.DefaultLogicRoute').DoesNotExist as e:
                instance = None
            except Exception as e:
                return Response(status=500)
        except apps.get_model('Questions.Question').DoesNotExist as e:
            return Response(status=404)
        except Exception as e:
            return Response(status=500)
        request.data['question'] = qid
        if str(qid) == str(request.data['next_question']):
            return Response(
                {
                    'next_question' : 'Route pointing to same question.',
                },
                status=400
            )
        serializer = DefaultLogicRouteAddEditAdminSerializer(
            data = request.data,
            instance=instance,
        )
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        if instance.next_type in ['TER', 'COM']:
            instance.next_question = None
            instance.next_options.clear()
            instance.save()
        return Response(
            DefaultLogicRouteGetAdminSerializer(instance).data,
            status=200
        )
    
    def delete(self, request, *args, **kwargs):
        qid = request.GET.get("qid", None)
        if not qid:
            return Response(
                {
                    'qid' : 'question id needed',
                },
                status=400
            )
        try:
            instance = apps.get_model('Questions.Question').objects.get(id = qid).default_route
        except apps.get_model('Questions.Question').DoesNotExist as e:
            return Response(status=404)
        except Exception as e:
            return Response(status=500)
        apps.get_model('Questions.DefaultLogicRoute').objects.get(id = instance.id).delete()
        return Response(
            status=200,
        )


class QuestionsLogicView(APIView, PageNumberPagination):
    
    permission_classes = (*api_settings.DEFAULT_PERMISSION_CLASSES, AllowAdminOnly,)
    page_size = api_settings.PAGE_SIZE

    def get(self, request, *args, **kwargs):
        qid=request.GET.get('qid', None)
        lid=request.GET.get('lid', None)
        if not qid and not lid:
            return Response(
                {
                    'detail' : "qid or lid, any one them is needed",
                },
                status=400,
            )
        if qid:
            try:
                instance = apps.get_model('Questions.Question').objects.get(id = qid)
            except apps.get_model('Questions.Question').DoesNotExist as e:
                return Response(status=404)
            except Exception as e:
                return Response(status=500)
            return Response(
                LogicGroupGetAdminSerializer(
                    instance.logic_groups.all(),
                    many=True,
                ).data,
                status=200,
            )
        if lid:
            try:
                instance = apps.get_model('Questions.LogicGroup').objects.get(id = lid)
            except apps.get_model('Questions.LogicGroup').DoesNotExist as e:
                return Response(status=404)
            except Exception as e:
                return Response(status=500)
            return Response(
                LogicGroupGetAdminSerializer(
                    instance,
                ).data,
                status=200,
            )
        
    def post(self, request, *args, **kwargs):
        qid=request.GET.get('qid', None)
        try:
            question = apps.get_model('Questions.Question').objects.get(id = qid)
        except apps.get_model('Questions.Question').DoesNotExist as e:
            return Response(
                {
                    'qid' : "Question Not Found",
                },
                status=400,
            )
        except Exception as e:
            return Response(status=500)
        try:
            basic_details = request.data.pop('basic_details')
        except KeyError as e:
            return Response(
                {
                    'basic_details' : "basic_details variable not found",
                },
                status=400,
            )
        try:
            conditions = request.data.pop('conditions')
        except KeyError as e:
            return Response(
                {
                    'conditions' : "conditions variable not found",
                },
                status=400,
            )
        try:
            route = request.data.pop('route')
        except KeyError as e:
            return Response(
                {
                    'route' : "route variable not found",
                },
                status=400,
            )
        basic_details['question'] = question.id
        serializer = LogicGroupAddEditAdminSerializer(
            data=basic_details
        )
        if serializer.is_valid():
            logicgroup = serializer.save()
        else:
            return Response(
                {
                    'basic_details' : serializer.errors,
                },
                status=400,
            )
        route['logic_group'] = logicgroup.id
        serializer = LogicRouteAddEditAdminSerializer(data=route)
        if serializer.is_valid():
            route = serializer.save()
        else:
            logicgroup.delete()
            return Response(
                {
                    'route' : serializer.errors,
                },
                status=400,
            )
        for condition in conditions:
            condition['logic_group'] = logicgroup.id
        serializer = LogicConditionAddEditAdminSerializer(data=conditions, many=True)
        if serializer.is_valid():
            conditions = serializer.save()
        else:
            logicgroup.delete()
            return Response(
                {
                    'route' : serializer.errors,
                },
                status=400,
            )
        return Response(
                LogicGroupGetAdminSerializer(
                    logicgroup,
                ).data,
                status=200,
            )
    
    def put(self, request, *args, **kwargs):
        lid=request.GET.get('lid', None)
        try:
            logicgroup = apps.get_model('Questions.LogicGroup').objects.get(id = lid)
        except apps.get_model('Questions.Question').DoesNotExist as e:
            return Response(
                {
                    'qid' : "qid variable needed",
                },
                status=400,
            )
        except Exception as e:
            return Response(status=500)
        try:
            basic_details = request.data.pop('basic_details')
        except KeyError as e:
            return Response(
                {
                    'basic_details' : "basic_details variable not found",
                },
                status=400,
            )
        try:
            conditions = request.data.pop('conditions')
        except KeyError as e:
            conditions = None
        try:
            route = request.data.pop('route')
        except KeyError as e:
            route = None
        serializer = LogicGroupAddEditAdminSerializer(
            data=basic_details,
            partial=True,
        )
        if serializer.is_valid():
            serializer.save()
        else:
            return Response(
                {
                    'basic_details' : serializer.errors,
                },
                status=400,
            )
        if route:
            serializer = LogicRouteAddEditAdminSerializer(
                data=route,
                partial=True,
            )
            if serializer.is_valid():
                route = serializer.save()
            else:
                return Response(
                    {
                        'route' : serializer.errors,
                    },
                    status=400,
                )
        errors = []
        if conditions:
            for condition in conditions:
                if condition.get("delete", False):
                    apps.get_model('Questions.LogicCondition').objects.get(id = condition.get("id")).delete()
                else:
                    if not condition.get("id",None):
                        condition['logic_group'] = logicgroup.id
                    serializer = LogicConditionAddEditAdminSerializer(
                        data=condition, 
                        partial=True,
                    )
                    if serializer.is_valid():
                        conditions = serializer.save()
                        errors.append({})
                    else:
                        errors.append(serializer.errors)
        for error in errors:
            if len(error) > 0:
                return Response(
                    {
                        'conditions' : errors,
                    },
                    status=400,
                )
        return Response(
                LogicGroupGetAdminSerializer(
                    apps.get_model('Questions.LogicGroup').objects.get(id = lid),
                ).data,
                status=200,
            )
        
    
    def delete(self, request, *args, **kwargs):
        lid=request.GET.get('lid', None)
        try:
            instance = apps.get_model('Questions.LogicGroup').objects.get(id = lid)
        except apps.get_model('Questions.LogicGroup').DoesNotExist as e:
            return Response(status=404)
        except Exception as e:
            return Response(status=500)
        instance.delete()
        return Response(status=200)