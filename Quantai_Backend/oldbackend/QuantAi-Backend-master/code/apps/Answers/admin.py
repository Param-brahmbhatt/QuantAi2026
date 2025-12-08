from django.contrib import admin

from .models import (
    Answer
)

@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = [
        'question',
        'project',
        'variable',
        # 'option',
    ]
    list_filter = [
        'question',
        'project',
        'variable',
        # 'option',
    ]