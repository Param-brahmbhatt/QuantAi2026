from rest_framework import serializers

from django.db.models import Q
from django.apps import apps
from django.utils import timezone

from .models import (
    Transaction
)

from apps.Profiles.serializers import (
    ProfileSerializer
)
from libs.serializers import (
    ModelSerializer,
    Serializer
)

class TransactionAudianceSerializer(ModelSerializer):

    project = serializers.StringRelatedField()
    question = serializers.StringRelatedField()

    class Meta:
        model = Transaction
        exclude = [
            'profile',
            'geodata',
        ]
        read_only_fields = [
            'created_on',
            'updated_on',
            'id',
        ]


class TransactionAdminSerializer(ModelSerializer):

    profile = ProfileSerializer()

    class Meta:
        model = Transaction
        exclude = [
            'geodata',
        ]
        read_only_fields = [
            'created_on',
            'updated_on',
            'id',
        ]


class TransactionAudianceDepositeAddSerializer(ModelSerializer):

    def validate_total_amount(self, total_amount):
        profile = self.context.get('request').user.profile
        if Transaction.objects.filter( profile = profile, t_type = "WID", status = "PE" ).count() > 0:
            raise serializers.ValidationError('System already has one pending widthdrawal. To initiate new widthdrawal, Please cancel existing PENDING transaction.')
        if profile.wallet.total_balance < total_amount:
            raise serializers.ValidationError('Insufficient balance')
        try:
           settings = apps.get_model('SystemSettings.RedemptionSetting').objects.get(active = True)
        except apps.get_model('SystemSettings.RedemptionSetting').DoesNotExist as e:
            raise serializers.ValidationError('Widthdrawal is not active at this movement, Please contact admin for further details.')
        if Transaction.objects.filter( profile = profile, t_type = "WID", status__in = ["PE", "SU"], created_on__gte = timezone.now() - timezone.timedelta( days = settings.min_redemption_gap_in_days )).count() > 0:
            raise serializers.ValidationError(f'Need minimum {settings.min_redemption_gap_in_days} days of span between widthrawal request.')
        if profile.wallet.total_balance < settings.min_eligibility_for_redemption:
            raise serializers.ValidationError(f'Need minimum {settings.min_eligibility_for_redemption} balance to intiate widthrawal.')
        # redemption_share_from_profiling_rewards
        profiling_rewards_sub_amount = total_amount * ( settings.redemption_share_from_profiling_rewards / 100 )
        if profile.wallet.profiling_balance < profiling_rewards_sub_amount:
            profiling_rewards_sub_amount = profile.wallet.profiling_balance
        survey_rewards_sub_amount = total_amount - profiling_rewards_sub_amount
        if profile.wallet.survey_balance < survey_rewards_sub_amount:
            if settings.allow_only_profiling_redemption:
                if profile.wallet.profiling_balance < total_amount:
                    raise serializers.ValidationError(f'Insufficient balance')
            else:
                raise serializers.ValidationError(f'Insufficient survey balance')
        return total_amount

    class Meta:
        model = Transaction
        exclude = [
            'geodata',
            'project',
            'question',
            'survey_amount',
            'profiling_amount',
            'status',
            'admin_comment',
        ]
        read_only_fields = [
            'created_on',
            'updated_on',
            'id',
        ]


class TransactionAdminEditSerializer(ModelSerializer):

    class Meta:
        model = Transaction
        fields = [
            'status',
            'admin_comment',
        ]
        extra_kwargs = {
            'admin_comment': {'required': True}
        }
