import random
from django.utils import timezone
from datetime import timedelta
from django.core.mail import send_mail
from .models import EmailOTP, User
from django.conf import settings


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
