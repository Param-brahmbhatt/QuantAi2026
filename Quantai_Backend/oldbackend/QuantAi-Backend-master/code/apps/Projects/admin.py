from django.contrib import admin

from .models import (
    Project,
    ProjectAudianceDetails,
    ProjectFilter
)

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    pass

@admin.register(ProjectAudianceDetails)
class ProjectAudianceDetailsAdmin(admin.ModelAdmin):
    pass

@admin.register(ProjectFilter)
class ProjectFilterAdmin(admin.ModelAdmin):
    pass