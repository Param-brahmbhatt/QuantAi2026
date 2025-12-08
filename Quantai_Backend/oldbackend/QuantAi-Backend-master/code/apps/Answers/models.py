from django.db import models
from django.db.models import Q
from django.db.models.signals import pre_save
from django.dispatch import receiver
from libs.models import AbstractLoggingModel

# Create your models here.
    
class Answer(AbstractLoggingModel):
    question = models.ForeignKey(
        'Questions.Question',
        on_delete=models.CASCADE,
        related_name='answers',
    )
    project = models.ForeignKey(
        'Projects.Project',
        on_delete=models.CASCADE,
        related_name='answers',
    )
    profile = models.ForeignKey(
        'Profiles.Profile',
        on_delete=models.CASCADE,
        related_name='answers',
    )
    variable = models.ForeignKey(
        'Variables.Variable',
        on_delete=models.CASCADE,
        related_name='answers',
    )
    option = models.ManyToManyField(
        'Questions.QuestionChoices',
        # on_delete=models.CASCADE,
        related_name='answers',
    )
    input = models.JSONField(
        null=True,
        blank=True,
    )
    input_row = models.JSONField(
        null=True,
        blank=True,
    ) 
    is_demo = models.BooleanField()  
    is_last = models.BooleanField(
        default=True,
    )

@receiver(pre_save, sender=Answer)
def MarkPreviousAnswerAsNotLast(sender, instance, *args, **kwargs):
    if not instance.id:
        Answer.objects.filter( 
            variable = instance.variable, 
            profile = instance.profile, 
            project = instance.project,
            question = instance.question  
        ).update(is_last = False)

class AnswerFileAndInput(AbstractLoggingModel):
    answer = models.ForeignKey(
        'Answers.Answer',
        on_delete=models.CASCADE,
        related_name='files',
    )
    option = models.ForeignKey(
        'Questions.QuestionChoices',
        on_delete=models.CASCADE,
        related_name='answers_file_input',
    )
    input = models.TextField(
        null=True,
        blank=True,
    )
    file = models.FileField(
        upload_to="answers/files"
    )