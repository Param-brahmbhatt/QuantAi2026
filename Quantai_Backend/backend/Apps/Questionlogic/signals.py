from django.db.models.signals import post_save
from django.dispatch import receiver
from Apps.Survey.models import Question
from .models import Variable

@receiver(post_save, sender=Question)
def manage_question_variable(sender, instance, created, **kwargs):
    """
    Automatically create or update a Variable when a Question is saved.
    """
    if created:
        # Create new variable
        Variable.objects.create(
            name=instance.variable_name,
            project=instance.project,
            question=instance,
            type='QV'  # Question Variable
        )
    else:
        # Update existing variable if name changed
        if hasattr(instance, 'variable'):
            variable = instance.variable
            if variable.name != instance.variable_name:
                variable.name = instance.variable_name
                variable.save()
        else:
            # Handle case where variable might be missing for existing question
            Variable.objects.create(
                name=instance.variable_name,
                project=instance.project,
                question=instance,
                type='QV'
            )
