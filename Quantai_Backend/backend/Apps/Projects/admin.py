from django.contrib import admin
from .models import Language, Project


@admin.register(Language)
class LanguageAdmin(admin.ModelAdmin):
    list_display = ['id', 'code', 'name', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['code', 'name']
    ordering = ['name']


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['id', 'code', 'title', 'project_type', 'mode', 'active', 'start_time', 'end_time', 'reward_points']
    list_filter = ['project_type', 'mode', 'active', 'start_time']
    search_fields = ['title', 'code', 'description']
    filter_horizontal = ['languages']
    readonly_fields = ['uuid', 'created_at', 'updated_at']
    ordering = ['-created_at']

    fieldsets = (
        ('Basic Information', {
            'fields': ('uuid', 'code', 'title', 'description', 'project_type', 'mode')
        }),
        ('Settings', {
            'fields': ('languages', 'active', 'reward_points')
        }),
        ('Schedule', {
            'fields': ('start_time', 'end_time')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
