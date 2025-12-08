from django.shortcuts import render
from django.apps import apps
from django.db.models import Q

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from rest_framework.pagination import PageNumberPagination
from rest_framework.settings import api_settings

from django_countries import countries

from libs.permissions import AllowAdminOnly, AllowAudianceOnly

from libs.request import (
    RequestDataMultiplier
)

from .serializers import (
    ProjectAdminSerializer,
    ProjectAdminAddSerializer,
    ProjectAdminEditSerializer,
    ProjectAudianceDetailsListSerializer,
    ProjectFilterDetailsListSerializer,
    ProjectFilterAddEditSerializer
)

from apps.Questions.serializers import (
    QuestionAdminSerializer,
    QuestionAudianceSerializer,
)

from apps.Variables.serializers import (
    VariableProjectGetSerializer,
    VariableProjectAddEditSerializer
)

class ProjectAudianceView(APIView, PageNumberPagination):

    permission_classes = (*api_settings.DEFAULT_PERMISSION_CLASSES, AllowAudianceOnly,)
    page_size = api_settings.PAGE_SIZE

    def get(self, request, *args, **kwargs):
        if request.GET.get('type', None):
            projects = request.user.profile.my_projects.filter( project__project_type = request.GET.get('type'), project__mode = "LI" ).order_by('project__code')
        else:
            projects = request.user.profile.my_projects.filter( project__mode = "LI" ).order_by('project__code') #, status__in = ['PE', 'PF'] )
        return self.get_paginated_response(
            ProjectAudianceDetailsListSerializer(
                self.paginate_queryset(
                    projects,
                    request=request,
                    view=self,
                ),
                many = True,
                context={'request': request},
            ).data,
        )
    
class ProjectAudianceAnswerView(APIView, PageNumberPagination):

    permission_classes = (*api_settings.DEFAULT_PERMISSION_CLASSES, AllowAudianceOnly,)
    page_size = api_settings.PAGE_SIZE

    def get(self, request, *args, **kwargs):
        paid = request.GET.get('paid', None)
        try:
            instance = apps.get_model('Projects.ProjectAudianceDetails').objects.get(id = paid) #, status__in = ['PE', 'PF'])
        except apps.get_model('Projects.ProjectAudianceDetails').DoesNotExist as e:
            return Response(status=404)
        except Exception as e:
            return Response(status=500)
        if instance.next_question:
            return Response(
                {
                    'next' : QuestionAudianceSerializer(
                        instance.next_question,
                        context = {
                            'options': instance.next_options.all(),
                            'rows': instance.next_rows.all(),
                            'columns': instance.next_columns.all(),
                        }
                    ).data,
                    'details' : {
                        'project' : ProjectAdminSerializer(instance.project, context={'request': request}).data,
                        'status' : ProjectAudianceDetailsListSerializer(instance).data
                    }
                },
                status=200,
            )
        else:
            return Response(
                {
                    'next' : None,
                    'details' : {
                        'project' : ProjectAdminSerializer(instance.project, context={'request': request}).data,
                        'status' : ProjectAudianceDetailsListSerializer(instance).data
                    }
                },
                status=200,
            )
    
    def post(self, request, *args, **kwargs):
        paid = request.GET.get('paid', None)
        print (request.data)
        oid = request.data.get('oid', None)
        others = request.data.get('others', {})
        others_row = request.data.get('others_row', {})
        oid = [i for i in oid if i is not None]
        if not oid:
            oid = others.keys()
        else:
            for key in others.keys():
                if int(key) not in oid:
                    oid.append(int(key))
        try:
            instance = apps.get_model('Projects.ProjectAudianceDetails').objects.get(id = paid)
            if instance.status not in ['PE', 'PF']:
                return Response(
                    {
                        'detail' : "We already received your opinions for this questionnaire.",
                    },
                    status=400,
                )
        except apps.get_model('Projects.ProjectAudianceDetails').DoesNotExist as e:
            return Response(status=404)
        except Exception as e:
            return Response(status=500) 
        if instance.next_question.is_required and len(oid) == 0:
            return Response(
                    {
                        'detail' : "Answer is required for this question. please provide answer.",
                    },
                    status=400,
                )
        try:
            # question_options = apps.get_model('Questions.QuestionChoices').objects.filter(id__in = oid)
            question_options = instance.next_options.filter( id__in = oid )
            if len(question_options) != len(oid):
                return Response(
                    {
                        'detail' : "Not All Options Belongs to Current Choices",
                    },
                    status=400,
                )
        except apps.get_model('Questions.QuestionChoices').DoesNotExist as e:
            return Response(status=404)
        except Exception as e:
            return Response(status=500)
        for question_option in question_options:
            if instance.next_question != question_option.question:
                return Response(
                    {
                        'detail' : "Option does not belongs to current question",
                    },
                    status=400,
                )
        # other validation and input checks
        if instance.next_question.is_required:
            question_options = instance.next_options.filter( id__in = oid )
            for option in question_options: 
                if option.is_other:
                    if str(option.id) not in others.keys():
                        return Response(
                            {
                                'detail' : "Other input value not provided. Please provide other input",
                            },
                            status=400,
                        )
                    if others[str(option.id)] in [None,"none", ""]:
                        return Response(
                            {
                                'detail' : "Other input value is blank. Please provide other input",
                            },
                            status=400,
                        )
        instance.ProcessAnswer(question_options, others, others_row)
        instance.refresh_from_db()
        if instance.next_question:
            return Response(
                {
                    'next' : QuestionAudianceSerializer(
                        instance.next_question,
                        context = {
                            'options': instance.next_options.all(),
                            'rows': instance.next_rows.all(),
                            'columns': instance.next_columns.all(),
                        }
                    ).data,
                    'details' : {
                        'project' : ProjectAdminSerializer(instance.project, context={'request': request}).data,
                        'status' : ProjectAudianceDetailsListSerializer(instance).data
                    }
                },
                status=200,
            )
        else:
            return Response(
                {
                    'next' : None,
                    'details' : {
                        'project' : ProjectAdminSerializer(instance.project, context={'request': request}).data,
                        'status' : ProjectAudianceDetailsListSerializer(instance).data,
                    }
                },
                status=200,
            )

class ProjectDashboardAdminView(APIView, PageNumberPagination):

    permission_classes = (*api_settings.DEFAULT_PERMISSION_CLASSES, AllowAdminOnly,)
    page_size = api_settings.PAGE_SIZE

    def get(self, request, *args, **kwargs):
        id = request.GET.get('id', None)
        try:
            instance = apps.get_model('Projects.Project').objects.get(id = id)
        except apps.get_model('Projects.Project').DoesNotExist as e:
            return Response(status=404)
        except Exception as e:
            return Response(status=500)
        from django.db.models import Sum
        totalSeconds = instance.total_time_consumed.seconds
        hours, remainder = divmod(totalSeconds, 3600)
        minutes, seconds = divmod(remainder, 60)
        return Response(
            {
                "total_audiance" : instance.audiance_statuses.count(),
                "started_audiance" : instance.audiance_statuses.filter(status = "PF").count(),
                "completed_audiance" : instance.audiance_statuses.filter(
                    status__in = ["PF","CO","TE","QF"]
                ).count(),
                "total_time_consumed" : '%s H:%s M:%s S' % (hours, minutes, seconds),
                "avg_time_consumed" : instance.avg_time_consumed,
            },
            status=200
        )


class ProjectAdminView(APIView, PageNumberPagination):

    permission_classes = (*api_settings.DEFAULT_PERMISSION_CLASSES, AllowAdminOnly,)
    page_size = api_settings.PAGE_SIZE

    def get(self, request, *args, **kwargs):
        ptype = request.GET.get('type', None)
        id = request.GET.get('id', None)
        if not id:
            if ptype:
                return self.get_paginated_response(
                    ProjectAdminSerializer(
                        self.paginate_queryset(
                            apps.get_model('Projects.Project').objects.filter(
                                project_type = ptype
                            ).order_by('code'),
                            request=request,
                            view=self,
                        ),
                        many = True,
                        context={'request': request},
                    ).data,
                )
            else:
                return Response(
                    {
                        'detail' : "Please provide 'type' as get parameter"
                    },
                    status=400
                )
        else:
            try:
                instance = apps.get_model('Projects.Project').objects.get(id = id)
            except apps.get_model('Projects.Project').DoesNotExist as e:
                return Response(status=404)
            except Exception as e:
                return Response(status=500)
            return Response(
                ProjectAdminSerializer(instance, context={'request': request}).data,
                status=200
            )
        
    def post(self, request, *args, **kwargs):
        serializer = ProjectAdminAddSerializer(data = RequestDataMultiplier(request.POST, request.FILES), context={'request': request})
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        return Response(
            ProjectAdminSerializer(instance, context={'request': request}).data,
            status=200,
        ) 

    def put(self, request, *args , **kwargs):
        id = request.GET.get('id', None)
        if id:
            try:
                instance = apps.get_model('Projects.Project').objects.get(id = id)
            except apps.get_model('Projects.Project').DoesNotExist as e:
                return Response(status=404)
            except Exception as e:
                return Response(status=500)
            serializer = ProjectAdminEditSerializer(
                data = RequestDataMultiplier(request.POST, request.FILES),
                instance = instance,
                partial=True,
                context={'request': request}
            )
            serializer.is_valid(raise_exception=True)
            instance = serializer.save()
            return Response(
                ProjectAdminSerializer(instance, context={'request': request}).data,
                status=200
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
                instance = apps.get_model('Projects.Project').objects.get(id = id)
            except apps.get_model('Projects.Project').DoesNotExist as e:
                return Response(status=404)
            except Exception as e:
                return Response(status=500)
            if instance.mode in ["DE", "PR", "DM"]:
                instance.delete()
            else:
                if not instance.active:
                    return Response(
                        {
                            'detail' : "Project already de-active. Please edit and update if you want to re-active project."
                        },
                        status=400,
                    )
                instance.active = False
                instance.save()
            return Response(status=200)
        else:
            return Response(
                {
                    'detail' : "invalid id"
                },
                status=400,
            )
        
class ProjectFilterAdminView(APIView, PageNumberPagination):

    permission_classes = (*api_settings.DEFAULT_PERMISSION_CLASSES, AllowAdminOnly,)
    page_size = api_settings.PAGE_SIZE

    def get(self, request, *args, **kwargs):
        pid = request.GET.get('pid', None)
        fid = request.GET.get('fid', None)
        if not pid and not fid:
            return Response(
                {
                    'detail' : 'pid or fid not found, need at etleast one'
                },
                status=400
            )
        if pid:
            try:
                project = apps.get_model('Projects.Project').objects.get(id = pid)
            except apps.get_model('Projects.Project').DoesNotExist as e:
                return Response(status=404)
            except Exception as e:
                return Response(status=500)
            return Response(
                ProjectFilterDetailsListSerializer(project.filters.all(), many=True).data,
                status=200
            )
        if fid:
            try:
                filter = apps.get_model('Projects.ProjectFilter').objects.get(id = fid)
            except apps.get_model('Projects.ProjectFilter').DoesNotExist as e:
                return Response(status=404)
            except Exception as e:
                return Response(status=500)
            return Response(
                ProjectFilterDetailsListSerializer(filter).data,
                status=200
            )
    
    def check_duplicate(self, serializer, project):
        # validated_data = serializer.validated_data
        # if serializer.instance:
        #     id = serializer.instance.id
        # else:
        #     id = None
        # if not id :
        #     if project.filters.filter(
        #         variable = validated_data['variable'],
        #         condition = validated_data['condition'],
        #         value = validated_data['value'],
        #     ).count() > 0:
        #         return True, "Duplicate filter conditions"
        #     if project.filters.filter(
        #         variable = validated_data['variable'],
        #         condition = validated_data['condition'],
        #     ).count() > 0:
        #         return True, "Duplicate filter conditions with same variable and same condition but different value"
        # else:
        #     if project.filters.filter(
        #         ~Q(id = id),
        #         variable = validated_data['variable'],
        #         condition = validated_data['condition'],
        #         value = validated_data['value'],
        #     ).count() > 0:
        #         return True, "Duplicate filter conditions"
        #     if project.filters.filter(
        #         ~Q(id = id),
        #         variable = validated_data['variable'],
        #         condition = validated_data['condition'],
        #     ).count() > 0:
        #         return True, "Duplicate filter conditions with same variable and same condition but different value"
        return False, ""
    
    def post(self, request, *args, **kwargs):
        pid = request.GET.get('pid', None)
        try:
            project = apps.get_model('Projects.Project').objects.get(id = pid)
        except apps.get_model('Projects.Project').DoesNotExist as e:
            return Response(status=404)
        except Exception as e:
            return Response(status=500)
        request.data['project'] = project.id
        serializer = ProjectFilterAddEditSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        is_error, errors = self.check_duplicate(serializer = serializer, project=project)
        if is_error:
            return Response(
                {
                    'detail' : errors,
                },
                status=400
            )
        filter = serializer.save()
        return Response(
            ProjectFilterDetailsListSerializer(filter).data,
            status=200
        )
        
    def put(self, request, *args, **kwargs):
        pid = request.GET.get('pid', None)
        try:
            project = apps.get_model('Projects.Project').objects.get(id = pid)
        except apps.get_model('Projects.Project').DoesNotExist as e:
            return Response(status=404)
        except Exception as e:
            return Response(status=500)
        serializer = ProjectFilterAddEditSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        is_error, errors = self.check_duplicate(serializer = serializer, project=project)
        if is_error:
            return Response(
                {
                    'detail' : errors,
                },
                status=400
            )
        filter = serializer.save()
        return Response(
            ProjectFilterDetailsListSerializer(filter).data,
            status=200
        )
        
    def delete(self, request, *args, **kwargs):
        fid = request.GET.get('fid', None)
        try:
            filter = apps.get_model('Projects.ProjectFilter').objects.get(id = fid)
        except apps.get_model('Projects.ProjectFilter').DoesNotExist as e:
            return Response(status=404)
        except Exception as e:
            return Response(status=500)
        filter.delete()
        return Response(
            status=200
        )

class ProjectVariablesAdminView(APIView, PageNumberPagination):

    permission_classes = (*api_settings.DEFAULT_PERMISSION_CLASSES, AllowAdminOnly,)
    page_size = api_settings.PAGE_SIZE

    def get(self, request, *args, **kwargs):
        pid = request.GET.get('pid', None)
        try:
            project = apps.get_model('Projects.Project').objects.get(id = pid)
        except apps.get_model('Projects.Project').DoesNotExist as e:
            return Response(status=404)
        except Exception as e:
            return Response(status=500)
        return Response(
            VariableProjectGetSerializer( project.variables.filter( type = "SV" ) ,many=True).data,
            status=200,
        )
    
    def post(self, request, *args, **kwargs):
        pid = request.GET.get('pid', None)
        try:
            project = apps.get_model('Projects.Project').objects.get(id = pid)
        except apps.get_model('Projects.Project').DoesNotExist as e:
            return Response(status=404)
        except Exception as e:
            return Response(status=500)
        request.data['project'] = project.id
        request.data['type'] = "SV"
        serializer = VariableProjectAddEditSerializer(
            data=request.data,
            context={'project': project}
        )
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        return Response(
            VariableProjectGetSerializer(instance).data,
            status=200,
        )
    
    def put(self, request, *args, **kwargs):
        pid = request.GET.get('pid', None)
        try:
            project = apps.get_model('Projects.Project').objects.get(id = pid)
        except apps.get_model('Projects.Project').DoesNotExist as e:
            return Response(status=404)
        except Exception as e:
            return Response(status=500)
        request.data['project'] = project.id
        request.data['type'] = "SV"
        serializer = VariableProjectAddEditSerializer(
            data=request.data,
            partial = True,
            context={'project': project}
        )
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        return Response(
            VariableProjectGetSerializer(instance).data,
            status=200,
        )
    
    def delete(self, request, *args, **kwargs):
        vid = request.GET.get('vid', None)
        try:
            variable = apps.get_model('Variables.Variable').objects.get(id = vid)
        except apps.get_model('Variables.Variable').DoesNotExist as e:
            return Response(status=404)
        except Exception as e:
            return Response(status=500)
        variable.delete()
        return Response(
            status=200
        )
    

class ProjectReportsTabularAdminView(APIView, PageNumberPagination):

    permission_classes = (*api_settings.DEFAULT_PERMISSION_CLASSES, AllowAdminOnly,)
    page_size = api_settings.PAGE_SIZE

    def get(self, request, *args, **kwargs):
        pid = request.GET.get('pid', None)
        status = request.GET.get('status', "ALL")
        id_or_value = request.GET.get('id_or_value', "V") # V for value , I For ID 
        try:
            project = apps.get_model('Projects.Project').objects.get(id = pid)
        except apps.get_model('Projects.Project').DoesNotExist as e:
            return Response(status=404)
        except Exception as e:
            return Response(status=500)
        reports_list = []
        if status == "ALL":
            for status in project.audiance_statuses.filter(status__in = ["CO", "TE", "QF"]):
                if id_or_value == "V":
                    reports_list.append(status.report_value)
                else:
                    reports_list.append(status.report_id)
        else:
            for status in project.audiance_statuses.filter( status = status):
                if id_or_value == "V":
                    reports_list.append(status.report_value)
                else:
                    reports_list.append(status.report_id)
        return Response(
            reports_list,
            status=200,
        )
    

class ProjectReportsGraphAdminView(APIView, PageNumberPagination):

    permission_classes = (*api_settings.DEFAULT_PERMISSION_CLASSES, AllowAdminOnly,)
    page_size = api_settings.PAGE_SIZE

    def get(self, request, *args, **kwargs):
        pid = request.GET.get('pid', None)
        id_or_value = request.GET.get('id_or_value', "V") # V for value , I For ID 
        percentage = int(request.GET.get('percentage', 1)) # 0 = for count , 1 = for percentage
        question_id = request.GET.get('question_id', None)
        if question_id:
            try:
                project = apps.get_model('Projects.Project').objects.get(id = pid)
            except apps.get_model('Projects.Project').DoesNotExist as e:
                return Response(status=404)
            try:
                question = apps.get_model('Questions.Question').objects.get(id = question_id)
            except apps.get_model('Questions.Question').DoesNotExist as e:
                return Response(status=404)
            except Exception as e:
                return Response(status=500)
            
            total = project.audiance_statuses.filter(status__in = ["CO", "TE", "QF"]).count()

            reply = {
                'title' : question.title,
                'total_answers' : total,
                'graphs' : {},
            }

            Answer = apps.get_model('Answers.Answer')

            for option in question.options.all():
                count = option.answers.filter(is_last = True).filter(project__audiance_statuses__status__in = ["CO", "TE", "QF"]).distinct().count()
                if id_or_value == "V":
                    if percentage == 1:
                        try:
                            reply['graphs'][option.label] = round(count * 100 / total)
                        except Exception as e:
                            reply['graphs'][option.label] = 0
                    else:
                        reply['graphs'][option.label] = count
                else:
                    if percentage == 1:
                        try:
                            reply['graphs'][option.value] = round((count * 100 ) / total,2)
                        except Exception as e:
                            reply['graphs'][option.label] = 0
                    else:
                        reply['graphs'][option.value] = count

            return Response(
                reply,
                status=200,
            )
        else:
            return Response(
                "question not found",
                status=404
            )