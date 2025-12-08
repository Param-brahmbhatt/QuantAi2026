from django.core.mail import send_mail
from django.conf import settings
from django.urls import reverse
from django.core.mail import EmailMessage
from django.template import Context
from django.template.loader import get_template
from django.apps import apps

def WelcomeEmail(profile):
    message = get_template("email/welcome.html").render({
        'title': "Welcome",
        'profile' : profile,
    })
    mail = EmailMessage(
        subject="QuantAi - Welcome",
        body=message,
        from_email=settings.EMAIL_HOST_USER,
        to=[profile.email],
        reply_to=[settings.EMAIL_HOST_USER],
    )
    mail.content_subtype = "html"
    return mail.send()

def EmailVerificationEmail(profile):
    print (str(settings.EMAIL_LINK_HOST + "/email/verification/" + profile.token + "/"))
    message = get_template("email/email_verification.html").render({
        'title': "Email Verification",
        'profile' : profile,
        'link' : str(settings.EMAIL_LINK_HOST + "/email/verification/" + profile.token + "/"),
        'points' : settings.INITIAL_LOGIN_REWARDS
    })
    mail = EmailMessage(
        subject="QuantAi - Email Verification",
        body=message,
        from_email=settings.EMAIL_HOST_USER,
        to=[profile.email],
        reply_to=[settings.EMAIL_HOST_USER],
    )
    mail.content_subtype = "html"
    return mail.send()

def PasswordResetEmail(profile):
    message = get_template("email/password_reset.html").render({
        'title': "Password Reset",
        'profile' : profile,
        'link' : str(settings.EMAIL_LINK_HOST + "/password/reset/" + profile.token + "/")
    })
    mail = EmailMessage(
        subject="QuantAi - Password Reset",
        body=message,
        from_email=settings.EMAIL_HOST_USER,
        to=[profile.email],
        reply_to=[settings.EMAIL_HOST_USER],
    )
    mail.content_subtype = "html"
    return mail.send()


## transaction emails
def TransactionCreatedEmail(transaction):
    message = get_template("email/widthrawal_initiated.html").render({
        'title': "Widrawal Initiated",
        'transaction' : transaction,
    })
    mail = EmailMessage(
        subject="QuantAi - Widrawal Initiated",
        body=message,
        from_email=settings.EMAIL_HOST_USER,
        to=[profile.email],
        reply_to=[settings.EMAIL_HOST_USER],
    )
    mail.content_subtype = "html"
    return mail.send()

def TransactionSuccessEmail(transaction):
    message = get_template("email/password_reset.html").render({
        'title': "Password Reset",
        'transaction' : transaction,
    })
    mail = EmailMessage(
        subject="QuantAi - Password Reset",
        body=message,
        from_email=settings.EMAIL_HOST_USER,
        to=[profile.email],
        reply_to=[settings.EMAIL_HOST_USER],
    )
    mail.content_subtype = "html"
    return mail.send()

def TransactionRejectedEmail(transaction):
    message = get_template("email/password_reset.html").render({
        'title': "Password Reset",
        'transaction' : transaction,
    })
    mail = EmailMessage(
        subject="QuantAi - Password Reset",
        body=message,
        from_email=settings.EMAIL_HOST_USER,
        to=[profile.email],
        reply_to=[settings.EMAIL_HOST_USER],
    )
    mail.content_subtype = "html"
    return mail.send()

def TransactionCancelledEmail(transaction):
    message = get_template("email/password_reset.html").render({
        'title': "Password Reset",
        'transaction' : transaction,
    })
    mail = EmailMessage(
        subject="QuantAi - Password Reset",
        body=message,
        from_email=settings.EMAIL_HOST_USER,
        to=[profile.email],
        reply_to=[settings.EMAIL_HOST_USER],
    )
    mail.content_subtype = "html"
    return mail.send()

def QuestionairAssignedEmail(project, profile):
    return 
    paid = apps.get_model('Projects.ProjectAudianceDetails').objects.get(
        project = project,
        profile = profile,
    ).id
    message = get_template("email/project_assigned.html").render({
        'title': "New Questionair",
        'project' : project,
        'point' : project.questions.count() * project.reward_points,
        'link' : f"""{settings.EMAIL_LINK_HOST}/fill-survey/{paid}/start/"""
    })
    mail = EmailMessage(
        subject="QuantAi - New Questionair",
        body=message,
        from_email=settings.EMAIL_HOST_USER,
        to=[profile.email],
        reply_to=[settings.EMAIL_HOST_USER],
    )
    mail.content_subtype = "html"
    return mail.send()