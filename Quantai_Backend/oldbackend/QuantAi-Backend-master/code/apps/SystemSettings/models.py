from django.db import models
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from django.apps import apps
from django.db.models import Q
from django.core.validators import MaxValueValidator, MinValueValidator

from libs.models import AbstractLoggingModel

from apps.AuditLog.registry import auditlog


class Language(AbstractLoggingModel):
    code = models.CharField(
        max_length=2,
    )
    full_name = models.CharField(
        max_length = 50,
        verbose_name="Full Name"
    )
    active = models.BooleanField(
        default=True,
    )

    def __str__(self):
        return self.code
    
auditlog.register(Language)

class RewardSetting(AbstractLoggingModel):
    name = models.CharField(
        max_length=50,
    )
    reward_point_each_answer = models.FloatField(
        default=1,
    )
    reward_for = models.CharField(
        max_length=1,
        choices=(
            ('P', 'Profile'),
            ('S', 'Survey')
        )
    )
    active = models.BooleanField(
        default=True
    )
    created_on = models.DateTimeField(
        auto_now_add=True
    )
    updated_on = models.DateTimeField(
        auto_now=True,
    )

    # class Meta:
    #     combine_unique = []

auditlog.register(RewardSetting, exclude_fields=['created_on', 'updated_on'])

@receiver(post_save, sender=RewardSetting)
def disableOtherRewardSettings(sender, instance, created, **kwargs):
    if instance.active:
        RewardSetting.objects.filter(reward_for = instance.reward_for).filter( ~Q( id = instance.id ) ).update(active = False)

class RedemptionSetting(AbstractLoggingModel):
    name = models.CharField(
        max_length=50,
    )
    min_redemption_gap_in_days = models.PositiveIntegerField(
        default=1,
    )
    min_eligibility_for_redemption = models.PositiveBigIntegerField(
        default=0,
    )
    max_eligibility_for_redemption = models.PositiveBigIntegerField(
        default=0,
    )
    allow_only_profiling_redemption = models.BooleanField(
        default=False,
    )
    redemption_share_from_profiling_rewards = models.FloatField(
        default=0,
        validators=[
            MaxValueValidator(100),
            MinValueValidator(0),
        ],
        help_text="In Percentage ( 0 - 100 % )"
    )
    active = models.BooleanField(
        default=True,
    )
    created_on = models.DateTimeField(
        auto_now_add=True
    )
    updated_on = models.DateTimeField(
        auto_now=True,
    )

    @classmethod
    def getActiveRedemptionSetting(cls):
        return cls.objects.get(active = True)

auditlog.register(RedemptionSetting, exclude_fields=['created_on', 'updated_on'])

@receiver(post_save, sender=RedemptionSetting)
def disableOtherRedemptionSettings(sender, instance, created, **kwargs):
    if instance.active:
        RedemptionSetting.objects.filter( ~Q( id = instance.id ) ).update(active = False)