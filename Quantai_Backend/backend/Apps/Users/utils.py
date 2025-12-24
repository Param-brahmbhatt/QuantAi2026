import random
from django.utils import timezone
from datetime import timedelta
from django.core.mail import send_mail
from .models import EmailOTP, User
from django.conf import settings
import os


def generate_otp():
    return "%06d" % random.randint(0, 999999)


def create_and_send_otp(email, purpose="signup", user=None):
    code = generate_otp()
    now = timezone.now()
    ttl = getattr(settings, "OTP_TTL_MINUTES", 10)
    expires = now + timedelta(minutes=ttl)
    otp = EmailOTP.objects.create(email=email, code=code, purpose=purpose, expires_at=expires, user=user)

    # send email (console backend prints it during development)
    subject = f"Your QuantAi {purpose} code"
    message = f"Your verification code is: {code}. It expires in {ttl} minutes."
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email])
    return otp


def send_welcome_email(user):
    """
    Send a welcome email to a newly verified user.
    Reads the email template from templates/email_templates/welcome_email.txt
    """
    template_path = os.path.join(settings.BASE_DIR, 'templates', 'email_templates', 'welcome_email.txt')

    try:
        with open(template_path, 'r') as f:
            email_content = f.read()

        # Replace {first_name} placeholder with user's first name
        first_name = user.first_name or 'User'
        email_content = email_content.format(first_name=first_name)

        subject = "Welcome to QuantAI!"
        send_mail(subject, email_content, settings.DEFAULT_FROM_EMAIL, [user.email])

    except FileNotFoundError:
        # Fallback to a simple message if template file is not found
        subject = "Welcome to QuantAI!"
        message = f"Dear {user.first_name or 'User'},\n\nWelcome to QuantAI! Your account has been successfully verified.\n\nBest regards,\nThe QuantAI Team"
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])
