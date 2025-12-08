from django.contrib import admin

from .models import (
    QuestionGroup
)

@admin.register(QuestionGroup)
class QuestionGroupAdmin(admin.ModelAdmin):
    pass