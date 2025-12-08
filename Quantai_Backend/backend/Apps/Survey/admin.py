from django.contrib import admin
from .models import (
    Question, QuestionGroup, QuestionChoices,
    QuestionChoicesGroup, QuestionRow, QuestionColumn
)


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['id', 'project', 'variable_name', 'title', 'question_type', 'is_required', 'is_initial_question', 'display_index']
    list_filter = ['project', 'question_type', 'is_required', 'is_initial_question']
    search_fields = ['title', 'variable_name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['project', 'display_index']


@admin.register(QuestionGroup)
class QuestionGroupAdmin(admin.ModelAdmin):
    list_display = ['id', 'project', 'title', 'created_at']
    list_filter = ['project']
    search_fields = ['title', 'description']
    filter_horizontal = ['questions']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(QuestionChoices)
class QuestionChoicesAdmin(admin.ModelAdmin):
    list_display = ['id', 'text', 'value', 'order']
    search_fields = ['text', 'value']
    ordering = ['order']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(QuestionChoicesGroup)
class QuestionChoicesGroupAdmin(admin.ModelAdmin):
    list_display = ['id', 'question', 'title']
    list_filter = ['question']
    search_fields = ['title', 'description']
    filter_horizontal = ['options']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(QuestionRow)
class QuestionRowAdmin(admin.ModelAdmin):
    list_display = ['id', 'text', 'order']
    search_fields = ['text']
    ordering = ['order']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(QuestionColumn)
class QuestionColumnAdmin(admin.ModelAdmin):
    list_display = ['id', 'text', 'order']
    search_fields = ['text']
    ordering = ['order']
    readonly_fields = ['created_at', 'updated_at']
