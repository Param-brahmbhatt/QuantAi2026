from rest_framework import serializers

from .models import (
    Wallet
)

class WalletSerializer(serializers.ModelSerializer):

    class Meta:
        model = Wallet
        fields = [
            'profiling_balance',
            'survey_balance',
            'total_balance',
            'total_withdrawal',
        ]