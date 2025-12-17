import random
from django.utils import timezone
from datetime import timedelta
from django.conf import settings
from .models import MobileOTP

def generate_otp():
    """Generates a 6-digit numeric OTP."""
    return "%06d" % random.randint(0, 999999)

def send_mobile_otp(phone_number, code, purpose="mobile_verify"):
    """
    Mock function to send OTP via SMS/WhatsApp.
    In production, this would integrate with Twilio/WhatsApp API.
    """
    print(f"========================================")
    print(f"Sending {purpose} OTP to {phone_number}: {code}")
    print(f"========================================")
    # Return True to simulate success
    return True

def create_and_send_mobile_otp(phone_number, user=None, purpose="mobile_verify"):
    """
    Creates an OTP record and sends it to the user.
    """
    code = generate_otp()
    now = timezone.now()
    ttl = getattr(settings, "OTP_TTL_MINUTES", 10)
    expires = now + timedelta(minutes=ttl)
    
    # Create OTP object
    otp = MobileOTP.objects.create(
        phone_number=phone_number,
        code=code,
        purpose=purpose,
        expires_at=expires,
        user=user
    )
    
    # Send OTP
    send_mobile_otp(phone_number, code, purpose)
    
    return otp
