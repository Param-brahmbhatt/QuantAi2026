from django.apps import AppConfig


class QuestionlogicConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'Apps.Questionlogic'

    def ready(self):
        import Apps.Questionlogic.signals
