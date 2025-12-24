from django.apps import AppConfig


class WalletsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'Apps.Wallets'

    def ready(self):
        """
        Import signal handlers when app is ready
        This ensures signals are registered with Django
        """
        import Apps.Wallets.signals  # noqa
