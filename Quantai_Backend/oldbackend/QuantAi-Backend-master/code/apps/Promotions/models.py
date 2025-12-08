from django.db import models
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from django.apps import apps

from django_countries.fields import CountryField
from phone_field import PhoneField
from model_utils import FieldTracker
from uuid import uuid4

from apps.AuditLog.registry import auditlog
from libs.models import AbstractLoggingModel, SpanningForeignKey

class Promotion(AbstractLoggingModel):
    code = models.CharField(
        max_length=10,
    )
    description = models.TextField(
        null=True,
        blank=True,
    )
    promo_type = models.CharField(
        max_length=3,
        choices=(
            ('SBO', 'Signup Bonus'),
        )
    )
    active_till = models.DateTimeField()
    active = models.BooleanField(
        default=True,
    )

    def applyPromoCode(self, profile):
        if self.promo_type == "SBO":
            