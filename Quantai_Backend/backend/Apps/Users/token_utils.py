# from oauth2_provider.models import AccessToken, RefreshToken, Application
# from oauth2_provider.settings import oauth2_settings
# from django.utils import timezone
# from datetime import timedelta
# import uuid


# def issue_token_for_user(user, client_id=None, client_secret=None, expires=None, scope="read write"):
#     """
#     Create an access token (and refresh token) for a user and return token dict.
#     If client_id and client_secret are provided, the Application is validated.
#     """
#     app = None
#     if client_id:
#         try:
#             app = Application.objects.get(client_id=client_id)
#             # If secret provided, ensure match
#             if client_secret and app.client_secret != client_secret:
#                 return None
#         except Application.DoesNotExist:
#             return None

#     if not expires:
#         expires = timezone.now() + timedelta(seconds=oauth2_settings.ACCESS_TOKEN_EXPIRE_SECONDS)

#     token = uuid.uuid4().hex
#     access = AccessToken.objects.create(user=user, application=app, token=token, expires=expires, scope=scope)
#     refresh = None
#     if oauth2_settings.REFRESH_TOKEN_EXPIRE_SECONDS is None or oauth2_settings.ROTATE_REFRESH_TOKEN:
#         refresh_token = uuid.uuid4().hex
#         refresh = RefreshToken.objects.create(user=user, token=refresh_token, application=app, access_token=access)

#     result = {
#         "access_token": access.token,
#         "expires_in": int((access.expires - timezone.now()).total_seconds()),
#         "token_type": "Bearer",
#         "scope": access.scope,
#     }
#     if refresh:
#         result["refresh_token"] = refresh.token
#     return result




from oauth2_provider.models import AccessToken, RefreshToken, Application
from oauth2_provider.settings import oauth2_settings
from django.utils import timezone
from datetime import timedelta
import uuid


def issue_token_for_user(user, client_id=None, client_secret=None, expires=None, scope="read write"):
    """
    Create an access token (and refresh token) for a user and return token dict.
    If client_id and client_secret are provided, the Application is validated.
    If client_id is not provided, falls back to settings.OAUTH2_INTERNAL_CLIENT_ID.
    """
    from django.conf import settings

    app = None
    if not client_id:
        client_id = getattr(settings, "OAUTH2_INTERNAL_CLIENT_ID", None)

    if client_id:
        try:
            app = Application.objects.get(client_id=client_id)
            if client_secret and app.client_secret != client_secret:
                return None
        except Application.DoesNotExist:
            return None

    if not expires:
        expires = timezone.now() + timedelta(seconds=getattr(oauth2_settings, 'ACCESS_TOKEN_EXPIRE_SECONDS', 3600))

    token = uuid.uuid4().hex
    access = AccessToken.objects.create(user=user, application=app, token=token, expires=expires, scope=scope)
    refresh = None
    # Create refresh token if refresh tokens are enabled or rotation configured
    try:
        rotate = getattr(oauth2_settings, 'ROTATE_REFRESH_TOKEN', False)
        if rotate or getattr(oauth2_settings, 'REFRESH_TOKEN_EXPIRE_SECONDS', None) is not None:
            refresh_token = uuid.uuid4().hex
            refresh = RefreshToken.objects.create(user=user, token=refresh_token, application=app, access_token=access)
    except Exception:
        # best-effort: if oauth2_settings missing, still return access token
        refresh = None

    result = {
        "access_token": access.token,
        "expires_in": int((access.expires - timezone.now()).total_seconds()),
        "token_type": "Bearer",
        "scope": access.scope,
    }
    if refresh:
        result["refresh_token"] = refresh.token
    return result
