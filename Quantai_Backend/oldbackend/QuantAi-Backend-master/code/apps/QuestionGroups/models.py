from django.db import models
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from django.apps import apps
from django.db.models import Q

from model_utils import FieldTracker

from libs.models import (
    AbstractLoggingModel,
)


class QuestionGroup(AbstractLoggingModel):
    project = models.ForeignKey(
        'Projects.Project',
        on_delete=models.CASCADE,
        related_name='questions_group',
    )
    title = models.TextField()
    title_align = models.CharField(
       max_length=2,
        choices=(
            ("CE", "Center"),
            ("LT", "Left"),
            ("RT", "Right"),
        ),
        default="LT",
    )
    description = models.TextField(
        null=True,
        blank=True,
    )
    description_align = models.CharField(
       max_length=2,
        choices=(
            ("CE", "Center"),
            ("LT", "Left"),
            ("RT", "Right"),
        ),
        default="LT",
    )
    questions = models.ManyToManyField(
        'Questions.Question',
        related_name='questions_group'
    )

class QuestionChoicesGroup(AbstractLoggingModel):
    question = models.ForeignKey(
        'Questions.Question',
        on_delete=models.CASCADE,
        related_name='options_group',
    )
    title = models.TextField()
    title_align = models.CharField(
       max_length=2,
        choices=(
            ("CE", "Center"),
            ("LT", "Left"),
            ("RT", "Right"),
        ),
        default="LT",
    )
    description = models.TextField(
        null=True,
        blank=True,
    )
    description_align = models.CharField(
       max_length=2,
        choices=(
            ("CE", "Center"),
            ("LT", "Left"),
            ("RT", "Right"),
        ),
        default="LT",
    )
    options = models.ManyToManyField(
        'Questions.QuestionChoices',
        related_name='options_group'
    )