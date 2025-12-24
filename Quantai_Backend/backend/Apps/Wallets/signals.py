"""
Signal handlers for Wallet app
Handles auto-creation of wallets and reward distribution
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from Apps.Users.models import Profile
from Apps.Survey.models import Answer
from .models import Wallet


@receiver(post_save, sender=Profile)
def create_wallet_for_profile(sender, instance, created, **kwargs):
    """
    Auto-create wallet when profile is created

    Args:
        sender: Profile model class
        instance: Profile instance that was saved
        created: Boolean - True if new instance was created
        **kwargs: Additional keyword arguments
    """
    if created:
        Wallet.objects.create(profile=instance)


# Reward distribution signals will be added after RewardService is created
