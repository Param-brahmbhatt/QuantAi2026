from django.db import models
from Apps.Users.models import Profile
from Apps.Projects.models import Project
from Apps.Survey.models import Question


class Wallet(models.Model):
    """Manages user financial balances and rewards"""

    id = models.AutoField(primary_key=True)
    profile = models.OneToOneField(
        Profile,
        on_delete=models.CASCADE,
        related_name='wallet'
    )
    profiling_balance = models.FloatField(default=0.0)
    survey_balance = models.FloatField(default=0.0)
    total_withdrawal = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'wallets'

    def __str__(self):
        return f"Wallet for {self.profile.email} - Balance: {self.total_balance}"

    @property
    def total_balance(self):
        """Calculate total balance"""
        return self.profiling_balance + self.survey_balance - self.total_withdrawal


class Transaction(models.Model):
    """Financial/reward transactions"""

    TRANSACTION_TYPE_CHOICES = [
        ('DEP', 'Deposit'),
        ('WID', 'Withdrawal'),
    ]

    TRANSACTION_STATUS_CHOICES = [
        ('PE', 'Pending'),
        ('SU', 'Success'),
        ('RE', 'Rejected'),
        ('CA', 'Cancelled'),
    ]

    id = models.AutoField(primary_key=True)
    profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='transactions'
    )
    total_amount = models.FloatField(default=0.0)
    survey_amount = models.FloatField(default=0.0)
    profiling_amount = models.FloatField(default=0.0)
    project = models.ForeignKey(
        Project,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='transactions'
    )
    question = models.ForeignKey(
        Question,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='transactions'
    )
    t_type = models.CharField(max_length=3, choices=TRANSACTION_TYPE_CHOICES)
    status = models.CharField(max_length=2, choices=TRANSACTION_STATUS_CHOICES, default='PE')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'transactions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['profile', 'status']),
            models.Index(fields=['t_type']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.get_t_type_display()} - {self.profile.email} - {self.total_amount}"
