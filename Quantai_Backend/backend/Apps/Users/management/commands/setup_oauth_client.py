from django.core.management.base import BaseCommand
from oauth2_provider.models import Application
from django.conf import settings


class Command(BaseCommand):
    help = 'Create or update the internal OAuth2 application for public client authentication'

    def handle(self, *args, **options):
        client_id = getattr(settings, 'OAUTH2_INTERNAL_CLIENT_ID', None)
        
        if not client_id:
            self.stdout.write(self.style.ERROR(
                'OAUTH2_INTERNAL_CLIENT_ID not set in settings.py'
            ))
            return

        # Check if application already exists
        app, created = Application.objects.get_or_create(
            client_id=client_id,
            defaults={
                'name': 'QuantAI Public Client',
                'client_type': Application.CLIENT_PUBLIC,  # Public client - no secret required
                'authorization_grant_type': Application.GRANT_PASSWORD,  # Resource owner password-based
                'skip_authorization': True,  # Skip authorization step
            }
        )

        if created:
            self.stdout.write(self.style.SUCCESS(
                f'✅ Created OAuth2 Public Client Application'
            ))
        else:
            # Update existing application to ensure correct settings
            app.name = 'QuantAI Public Client'
            app.client_type = Application.CLIENT_PUBLIC
            app.authorization_grant_type = Application.GRANT_PASSWORD
            app.skip_authorization = True
            app.save()
            
            self.stdout.write(self.style.SUCCESS(
                f'✅ Updated OAuth2 Public Client Application'
            ))

        self.stdout.write(self.style.SUCCESS(
            f'\nClient ID: {app.client_id}'
        ))
        self.stdout.write(self.style.SUCCESS(
            f'Client Type: {app.get_client_type_display()}'
        ))
        self.stdout.write(self.style.SUCCESS(
            f'Grant Type: {app.get_authorization_grant_type_display()}'
        ))
        self.stdout.write(self.style.WARNING(
            f'\nNote: Public clients do not require client_secret'
        ))
