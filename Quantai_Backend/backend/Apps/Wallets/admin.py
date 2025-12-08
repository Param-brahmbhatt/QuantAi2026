from django.contrib import admin
from .models import Wallet, Transaction


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ['id', 'profile', 'profiling_balance', 'survey_balance', 'total_withdrawal', 'total_balance', 'created_at']
    search_fields = ['profile__email', 'profile__first_name', 'profile__last_name']
    readonly_fields = ['created_at', 'updated_at', 'total_balance']
    list_filter = ['created_at']

    def total_balance(self, obj):
        return obj.total_balance
    total_balance.short_description = 'Total Balance'


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['id', 'profile', 't_type', 'total_amount', 'survey_amount', 'profiling_amount', 'project', 'status', 'created_at']
    list_filter = ['t_type', 'status', 'created_at']
    search_fields = ['profile__email', 'profile__first_name', 'profile__last_name']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
