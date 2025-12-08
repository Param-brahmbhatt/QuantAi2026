from django.db import models
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from django.apps import apps
from django.utils import timezone

from django_countries.fields import CountryField
from phone_field import PhoneField
from model_utils import FieldTracker
from uuid import uuid4

from apps.AuditLog.registry import auditlog
from libs.models import AbstractLoggingModel, SpanningForeignKey
from libs.uuid import Get10DigitUUIDHex
from django_q.tasks import async_task
from libs.email import (
    QuestionairAssignedEmail,
    EmailVerificationEmail
)


class Profile(AbstractLoggingModel):

    __db__ = 'default'

    user = models.OneToOneField(
        'auth.User',
        on_delete=models.CASCADE,
        related_name='profile',
    )
    uuid = models.CharField(
        max_length=10,
        default=Get10DigitUUIDHex
    )
    first_name = models.CharField(
        max_length=50,
        null=True,
        blank=True,
    )
    last_name = models.CharField(
        max_length=50,
        null=True,
        blank=True,
    )
    email = models.EmailField(
        unique=True,
    )
    # phone = PhoneField(
    #     null=True,
    #     blank=True,
    # )
    phone = models.CharField(
        max_length=20,
        null=True,
        blank=True,
    )
    citizen = CountryField(
        null=True,
        blank=True,
    )
    profile_type = models.CharField(
        max_length=2,
        choices=(
            ('AU', 'Audiance'),
            ('AD', 'Admin'),
            ('CL', "Client"),
        )
    )
    signup_type = models.CharField(
        max_length=2,
        choices=(
            ('SO', 'Social Media'),
            ('SF', 'Signup Form'),
        )
    )
    social_id = models.TextField(
        null=True,
        blank=True,
    )

    ## internal variables ##
    # notification id's
    mobile_notification_id = models.CharField(
        max_length=100,
        null=True,
        blank=True,
    )
    web_notification_id = models.CharField(
        max_length=100,
        null=True,
        blank=True,
    )

    # verification 
    is_mobile_verified = models.BooleanField(
        default=False
    )
    is_email_verified = models.BooleanField(
        default=False,
    )
    is_terms_accepted = models.BooleanField(
        default=False,
    )
    is_pp_accepted = models.BooleanField(
        default=False,
    )

    # verification token 
    token = models.CharField(
        max_length=50,
        default=False,
    )

    active = models.BooleanField(
        default=True,
    )

    tracker = FieldTracker()

    def __str__(self, *args, **kwargs):
        if self.email:
            return self.email
        else:
            return str(self.id)
        
        
auditlog.register(Profile, exclude_fields=['created_on', 'updated_on', 'mobile_notification_id', 'web_notification_id'])

@receiver(pre_save, sender=Profile)
def createAuthUserInCaseOfNewProfile(sender, instance, **kwargs):
    if not instance.pk :
        User = apps.get_model('auth.User')
        user = User.objects.create(
            email=instance.email,
            username=instance.email,
        )
        if instance.signup_type == "SO":
            user.set_password(uuid4().hex)
        user.save()
        instance.user = user
        if instance.profile_type in ['AD', 'CL']:
            instance.signup_type == "SF"
        async_task(
            EmailVerificationEmail,
            profile=instance
        )
    if instance.tracker.previous('email') != instance.email:
        instance.is_email_verified = False
        instance.user.username = instance.email
        instance.user.save()
    if instance.tracker.previous('phone') != instance.phone:
        instance.is_mobile_verified = False

@receiver(post_save, sender=Profile)
def createWalletInCaseOfNewProfile(sender, instance, created, **kwargs):
    if created:
        apps.get_model('Wallets.Wallet').objects.create(
            profile = instance
        )

# @receiver(post_save, sender=Profile)
# def createProjectStatusInCaseOfNewProfile(sender, instance, created, **kwargs):
#     if created:
#         Project = apps.get_model('Projects.Project')
#         projects = Project.objects.filter(mode = "LI", active = True, start_time__lte = timezone.now(), end_time__gte = timezone.now())
#         for project in projects:
#             if project.FilterAndAssignProject(instance):
#                 QuestionairAssignedEmail(
#                     project=project,
#                     profile=instance,
#                 )
