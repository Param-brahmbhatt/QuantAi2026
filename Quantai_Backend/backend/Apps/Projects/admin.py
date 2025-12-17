from django.contrib import admin
from .models import Language, Project, ProjectQuota, ProjectFilter, GlobalFilter


@admin.register(Language)
class LanguageAdmin(admin.ModelAdmin):
    list_display = ['id', 'code', 'name', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['code', 'name']
    ordering = ['name']


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['id', 'code', 'title', 'project_type', 'mode', 'active', 'start_time', 'end_time', 'reward_points', 'is_quota_full']
    list_filter = ['project_type', 'mode', 'active', 'is_quota_full', 'start_time']
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
        ('Quota Management', {
            'fields': ('participant_limit', 'quota_full_action', 'is_quota_full')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ProjectQuota)
class ProjectQuotaAdmin(admin.ModelAdmin):
    list_display = ['id', 'project', 'country', 'limit', 'current_count', 'status', 'action_on_full', 'created_at']
    list_filter = ['status', 'action_on_full', 'country']
    search_fields = ['project__title', 'project__code']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']


@admin.register(ProjectFilter)
class ProjectFilterAdmin(admin.ModelAdmin):
    list_display = ['id', 'project', 'filter_type', 'variable', 'operator', 'is_active', 'created_at']
    list_filter = ['filter_type', 'operator', 'is_active']
    search_fields = ['project__title', 'variable__name']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']


@admin.register(GlobalFilter)
class GlobalFilterAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'filter_type', 'variable', 'operator', 'is_active', 'priority', 'created_at']
    list_filter = ['filter_type', 'operator', 'is_active']
    search_fields = ['name', 'description', 'variable__name']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['priority']
