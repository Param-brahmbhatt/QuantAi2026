from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from django.apps import apps
from django_q.tasks import async_task

from model_utils import FieldTracker
from apps.AuditLog.registry import auditlog

from libs.models import AbstractLoggingModel
from libs.uuid import Get20DigitUUIDHex
from libs.email import (
    TransactionCreatedEmail,
    TransactionSuccessEmail,
    TransactionRejectedEmail,
    TransactionCancelledEmail,
)


class Transaction(AbstractLoggingModel):
    uuid = models.CharField(
        max_length=20,
        unique=True,
        default=Get20DigitUUIDHex
    )
    profile = models.ForeignKey(
        'Profiles.Profile',
        on_delete=models.CASCADE,
        related_name='transactions'
    )
    project = models.ForeignKey(
        'Projects.Project',
        on_delete=models.SET_NULL,
        related_name='transactions',
        null=True,
        blank=True,
    )
    question = models.ForeignKey(
        'Questions.Question',
        on_delete=models.SET_NULL,
        related_name='transactions',
        null=True,
        blank=True,
    )
    total_amount = models.FloatField(
        validators=[
            MinValueValidator(0),
        ]
    )
    survey_amount = models.FloatField(
        validators=[
            MinValueValidator(0),
        ],
        default=0
    )
    profiling_amount = models.FloatField(
        validators=[
            MinValueValidator(0),
        ],
        default=0
    )
    t_type = models.CharField(
        max_length=3,
        choices=(
            ("DEP", "Earnings"),
            ("WID", "Widthdrawal"),
        )
    )
    status = models.CharField(
        max_length=2,
        choices=(
            ("PE", "Pending"),
            ("SU", "Success / Processed"),
            ("RE", "Rejected"),
            ("CA", "Cancelled"),
        ),
        default="PE"
    )
    comment = models.TextField(
        null=True,
        blank=True,
    )
    admin_comment = models.TextField(
        null=True,
        blank=True,
    )
    # note : expity_date , remove points from wallet 

    tracker = FieldTracker()


auditlog.register(Transaction)


@receiver(pre_save, sender=Transaction)
def onCreateUpdateTotalAmount(sender, instance, **kwargs):
    if not instance.id:
        if instance.t_type == "DEP":
            if instance.project:
                if instance.project.project_type == "SU":
                    instance.survey_amount = instance.total_amount
                if instance.project.project_type == "PR":
                    instance.profiling_amount = instance.total_amount
            else:
                instance.profiling_amount = instance.total_amount
        if instance.t_type == "WID":
            redemption_setting = apps.get_model(
                'SystemSettings.RedemptionSetting').getActiveRedemptionSetting()
            instance.survey_amount = instance.total_amount * \
                (1 - (redemption_setting.redemption_share_from_profiling_rewards / 100))
            instance.profiling_amount = instance.total_amount * \
                (redemption_setting.redemption_share_from_profiling_rewards / 100)


@receiver(post_save, sender=Transaction)
def updateWalletBalanceOnStatusChange(sender, instance, created, **kwargs):
    if instance.t_type == "WID":
        if created:
            async_task(
                TransactionCreatedEmail,
                instance,
            )
        if instance.tracker.previous('status') == "PE" and instance.status == "SU":
            instance.profile.wallet.profiling_balance -= instance.profiling_amount
            instance.profile.wallet.survey_balance -= instance.survey_amount
            instance.profile.wallet.total_withdrawal += instance.total_amount
            instance.profile.wallet.save()
            async_task(
                TransactionSuccessEmail,
                instance,
            )
        if instance.tracker.previous('status') == "PE" and instance.status == "RE":
            async_task(
                TransactionRejectedEmail,
                instance,
            )
        if instance.tracker.previous('status') == "PE" and instance.status == "CA":
            async_task(
                TransactionCancelledEmail,
                instance,
            )
    if instance.t_type == "DEP":
        if instance.tracker.previous('status') == "PE" and instance.status == "SU":
            instance.profile.wallet.profiling_balance += instance.profiling_amount
            instance.profile.wallet.survey_balance += instance.survey_amount
            instance.profile.wallet.save()
