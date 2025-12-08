from django.db import models
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver

# Create your models here.

class Variable(models.Model):
    type = models.CharField(
        max_length=2,
        choices=(
            ('QV', 'Question Variable'),
            ('SV', 'Survey Variable'),
            ('PV', 'Profilling Variable'),
            ('CV', 'Counter Variable'),  
        )
    )
    name = models.CharField(
        max_length=300,
    )
    project = models.ForeignKey(
        'Projects.Project',
        on_delete=models.CASCADE,
        related_name='variables',
    )
    question = models.OneToOneField(
        'Questions.Question',
        on_delete=models.CASCADE,
        related_name='variable',
        null=True,
        blank=True,
    )
    value = models.TextField(
        null=True,
        blank=True,
    )

@receiver(pre_save, sender=Variable)
def SetVariableNameUpper(sender, instance, *args, **kwargs):
    instance.name = instance.name.upper()