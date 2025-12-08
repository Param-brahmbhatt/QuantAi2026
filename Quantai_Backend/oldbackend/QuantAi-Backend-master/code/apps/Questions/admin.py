from django.contrib import admin

from .models import (
    Question,
    QuestionRow,
    QuestionColumn,
    QuestionMasterChoices,
    QuestionChoices,
    DefaultLogicRoute,
    LogicGroup,
    LogicCondition,
    LogicRoute,
)
from .models import Question, QuestionRow, QuestionColumn, QuestionChoices


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ["id", "project", "title", "variable_name", "question_type"]


@admin.register(QuestionRow)
class QuestionRowAdmin(admin.ModelAdmin):
    pass


@admin.register(QuestionMasterChoices)
class QuestionMasterChoicesAdmin(admin.ModelAdmin):
    pass

@admin.register(QuestionColumn)
class QuestionColumnAdmin(admin.ModelAdmin):
    pass


@admin.register(QuestionChoices)
class QuestionChoicesChoices(admin.ModelAdmin):
    list_display = ["id", "question", "column", "variable_name", "label", "value"]


@admin.register(DefaultLogicRoute)
class DefaultLogicRouteChoices(admin.ModelAdmin):
    pass


@admin.register(LogicGroup)
class LogicGroupChoices(admin.ModelAdmin):
    pass


@admin.register(LogicCondition)
class LogicConditionChoices(admin.ModelAdmin):
    pass


@admin.register(LogicRoute)
class LogicRouteChoices(admin.ModelAdmin):
    pass
