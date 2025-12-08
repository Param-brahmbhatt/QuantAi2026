from django.apps import apps
from django.utils import timezone
from django_q.tasks import async_task

from libs.email import (
    QuestionairAssignedEmail
)

def AssignSurveyProjectToProfile():
    for profile in apps.get_model('Profiles.Profile').objects.filter(profile_type = "AU"): #, is_email_verified=True, email__in = ["quantai.developer@gmail.com", "kushaalpatel@gmail.com", "nimit.kothari+test@gmail.com"]):
        for project in apps.get_model('Projects.Project').objects.filter(
            mode = "LI", 
            active = True, 
            start_time__lte = timezone.now(), 
            end_time__gte = timezone.now()
        ).order_by('code'):
            if project.FilterAndAssignProject(profile):
                aud_project = project.audiance_statuses.get(profile = profile)
                # if aud_project.status == "PE":
                #     aud_project.jsonAdd()
                try:
                    async_task(
                        QuestionairAssignedEmail,
                        project=project,
                        profile=profile,
                    )
                except Exception as e:
                    pass

def AssignSurveyProjectToPerticularProfile(profile):
    for project in apps.get_model('Projects.Project').objects.filter(
            mode = "LI", 
            active = True, 
            start_time__lte = timezone.now(), 
            end_time__gte = timezone.now()
        ).order_by('code'):
            if project.FilterAndAssignProject(profile):
                try:
                    async_task(
                        QuestionairAssignedEmail,
                        project=project,
                        profile=profile,
                    )
                except Exception as e:
                    pass

def UpdateProjectStatusBasedOnTime():
    apps.get_model('Projects.Project').objects.filter(
        end_time__lte = timezone.now(),
    ).update(active = False, mode = "CO")