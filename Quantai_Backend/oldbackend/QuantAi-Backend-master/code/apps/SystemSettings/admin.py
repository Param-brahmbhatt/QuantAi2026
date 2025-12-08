from django.contrib import admin

from .models import (
    Language,
    RewardSetting,
    RedemptionSetting
)

@admin.register(Language)
class LanguageAdmin(admin.ModelAdmin):
    pass

@admin.register(RewardSetting)
class RewardSettingAdmin(admin.ModelAdmin):
    pass

@admin.register(RedemptionSetting)
class RedemptionSettingAdmin(admin.ModelAdmin):
    pass
