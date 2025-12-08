from django.db import models

class Wallet(models.Model):
    profile = models.OneToOneField(
        'Profiles.Profile',
        on_delete=models.CASCADE,
        related_name='wallet',
    )
    profiling_balance = models.FloatField(
        default=0.0
    )
    survey_balance = models.FloatField(
        default=0.0
    )
    total_withdrawal = models.FloatField(
        default=0.0
    )

    @property
    def total_balance(self):
        return self.profiling_balance + self.survey_balance
