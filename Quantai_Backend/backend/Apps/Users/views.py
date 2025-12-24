from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth import authenticate
from django.utils import timezone
import requests
import jwt
from jwt import PyJWKClient
from .serializers import (
    SignupSerializer,
    OTPVerifySerializer,
    LoginSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    UserSerializer,
)
from .utils import create_and_send_otp, send_welcome_email
from .token_utils import issue_token_for_user
from .models import User, EmailOTP
from django.conf import settings
from .countries import list_countries
from rest_framework import generics, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, BasePermission


class SignupView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # Accepts: email, password, confirm_password, first_name, last_name, country
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        # Send OTP using company mail system
        create_and_send_otp(user.email, purpose="signup", user=user)
        return Response({
            "detail": "User created successfully.",
            "user": UserSerializer(user).data,
            "success": True
        }, status=status.HTTP_201_CREATED)


class VerifyOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        otp = serializer.validated_data["otp_obj"]
        user = otp.user or User.objects.get(email__iexact=otp.email)

        # Check if this is the first time user is being verified
        is_first_verification = not user.is_verified

        user.is_verified = True
        user.save()
        otp.mark_used()

        # Send welcome email on first verification
        if is_first_verification:
            send_welcome_email(user)

        # Generate JWT token
        token = issue_token_for_user(user)
        return Response({
            "detail": "OTP verified.",
            "token": token,
            "success": True
        }, status=status.HTTP_200_OK)


class RequestOTPLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"detail": "email required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            # Do not reveal existence — reply success
            create_and_send_otp(email, purpose="login", user=None)
            return Response({"detail": "OTP sent if the account exists."})
        create_and_send_otp(email, purpose="login", user=user)
        return Response({"detail": "OTP sent if the account exists."})


class LoginWithOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        otp = serializer.validated_data["otp_obj"]
        # return a short-lived token or instruct client to exchange via oauth2
        otp.mark_used()
        # Optionally issue token when client credentials provided
        client_id = request.data.get("client_id")
        client_secret = request.data.get("client_secret")
        user = None
        if otp.user:
            user = otp.user
        else:
            try:
                user = User.objects.get(email__iexact=otp.email)
            except User.DoesNotExist:
                return Response({"detail": "User not found."}, status=status.HTTP_400_BAD_REQUEST)
        if client_id:
            token = issue_token_for_user(user, client_id=client_id, client_secret=client_secret)
            if token is not None:
                return Response(token)
        return Response({"detail": "OTP verified. Please exchange credentials at token endpoint."})


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            # avoid revealing existence
            create_and_send_otp(email, purpose="reset", user=None)
            return Response({"detail": "If an account exists, an OTP has been sent."})
        create_and_send_otp(email, purpose="reset", user=user)
        return Response({"detail": "If an account exists, an OTP has been sent."})


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        code = serializer.validated_data["code"]
        new_password = serializer.validated_data["new_password"]
        try:
            otp = EmailOTP.objects.filter(email__iexact=email, purpose="reset", code=code, used=False).latest("created_at")
        except EmailOTP.DoesNotExist:
            return Response({"detail": "Invalid code"}, status=status.HTTP_400_BAD_REQUEST)
        if otp.is_expired() or otp.used:
            return Response({"detail": "Invalid code"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response({"detail": "User not found"}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new_password)
        user.save()
        otp.mark_used()
        return Response({"detail": "Password reset successful"})


class CountriesView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response(list_countries())


# Social auth placeholders (in production use proper OAuth flows / libraries)
class SocialAuthView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, provider):
        provider_token = request.data.get("provider_token")
        if not provider_token:
            return Response({"detail": "provider_token required"}, status=status.HTTP_400_BAD_REQUEST)

        email = None
        provider_id = None

        # Provider-specific verification
        try:
            if provider.lower() == "google":
                # Verify Google id_token
                from google.oauth2 import id_token as google_id_token
                from google.auth.transport import requests as google_requests

                try:
                    idinfo = google_id_token.verify_oauth2_token(provider_token, google_requests.Request(), settings.SOCIAL_AUTH_GOOGLE_OAUTH2_KEY)
                    email = idinfo.get("email")
                    provider_id = idinfo.get("sub")
                except Exception:
                    return Response({"detail": "Invalid Google token"}, status=status.HTTP_400_BAD_REQUEST)

            elif provider.lower() == "facebook":
                # Verify Facebook access token via Graph API
                fb_resp = requests.get("https://graph.facebook.com/me", params={"access_token": provider_token, "fields": "id,email"})
                if fb_resp.status_code != 200:
                    return Response({"detail": "Invalid Facebook token"}, status=status.HTTP_400_BAD_REQUEST)
                data = fb_resp.json()
                provider_id = data.get("id")
                email = data.get("email")

            elif provider.lower() in ("twitter", "x"):
                # Try Twitter API v2 /users/me
                tw_resp = requests.get("https://api.twitter.com/2/users/me", headers={"Authorization": f"Bearer {provider_token}"})
                if tw_resp.status_code == 200:
                    data = tw_resp.json().get("data", {})
                    provider_id = data.get("id")
                    # Twitter email scope is not always available; accept client-supplied email if present
                    email = data.get("email") or request.data.get("email")
                else:
                    # Fallback: require email from client
                    email = request.data.get("email")
                    provider_id = request.data.get("provider_id")
                    if not email:
                        return Response({"detail": "Twitter token invalid and email not provided"}, status=status.HTTP_400_BAD_REQUEST)

            elif provider.lower() == "apple":
                # Apple provides an id_token (JWT) — verify signature with Apple's JWKS
                try:
                    jwks_client = PyJWKClient("https://appleid.apple.com/auth/keys")
                    signing_key = jwks_client.get_signing_key_from_jwt(provider_token)
                    decoded = jwt.decode(provider_token, signing_key.key, algorithms=["RS256"], audience=settings.SOCIAL_AUTH_APPLE_CLIENT)
                    provider_id = decoded.get("sub")
                    email = decoded.get("email") or request.data.get("email")
                except Exception:
                    return Response({"detail": "Invalid Apple token"}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({"detail": "Unsupported provider"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({"detail": "Error verifying token"}, status=status.HTTP_400_BAD_REQUEST)

        if not email:
            return Response({"detail": "Email is required but not provided by provider; include email in request"}, status=status.HTTP_400_BAD_REQUEST)

        # Create or get user
        user, created = User.objects.get_or_create(email=email, defaults={"is_verified": True, "provider": provider, "provider_id": provider_id or ""})
        if created:
            user.is_active = True
            user.save()

        # Issue token immediately if client credentials provided
        client_id = request.data.get("client_id")
        client_secret = request.data.get("client_secret")
        if client_id:
            token = issue_token_for_user(user, client_id=client_id, client_secret=client_secret)
            if token is not None:
                return Response(token)

        return Response(UserSerializer(user).data)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # Accepts: email, password, client_id/client_secret (optional for token-based login)
        email = request.data.get("email")
        password = request.data.get("password")
        client_id = request.data.get("client_id")
        client_secret = request.data.get("client_secret")

        if not email or not password:
            return Response({"detail": "Email and password required."}, status=400)

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            # Do not leak info
            return Response({"detail": "Invalid credentials."}, status=401)

        user_auth = authenticate(request, email=email, password=password)

        if not user_auth:
            return Response({"detail": "Invalid credentials."}, status=401)

        if not user.is_verified:
            # send new OTP if user not verified yet
            create_and_send_otp(user.email, purpose="login", user=user)
            return Response({
                "detail": "Email not verified. OTP sent to your email.",
                "requires_verification": True,
                "purpose": "login"
            }, status=403)

        # At this point, user is verified, allow login
        from django.contrib.auth import login
        login(request, user_auth)  # session login (for web clients)

        # Issue OAuth2 token
        # If client_id provided, use it (for testing/admin tools)
        # Otherwise, use internal client (for mobile/web apps - more secure)
        client_id = request.data.get("client_id")
        client_secret = request.data.get("client_secret")
        
        token = issue_token_for_user(user, client_id=client_id, client_secret=client_secret)
        if token is not None:
            return Response(token)
        else:
            # Fallback: if token generation fails, return user info
            # This happens if no OAuth2 application is configured
            return Response({
                "detail": "Login successful but token generation failed. Please configure OAuth2 application.",
                "user": UserSerializer(user).data
            })


class IsOwnerOrAdmin(BasePermission):
    """
    Custom permission to only allow users to access their own data.
    Admins (SU, AD, AM) can access all users.
    """
    def has_permission(self, request, view):
        # Must be authenticated
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Superusers and admin roles can access all users
        admin_roles = ['SU', 'AD', 'AM']  # Superuser, Admin, Admin Manager
        if request.user.is_superuser or request.user.profile_type in admin_roles:
            return True

        # Regular users can only access their own data
        return obj.id == request.user.id


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for User CRUD operations.

    Role-based access:
    - SU, AD, AM: Can access all users
    - All others: Can only access their own data

    Endpoints:
    - GET /api/users/users/ - List users (filtered by role)
    - GET /api/users/users/me/ - Get current authenticated user
    - PATCH /api/users/users/me/ - Update current authenticated user
    - GET /api/users/users/{pk}/ - Get specific user (owner or admin only)
    - PATCH /api/users/users/{pk}/ - Partial update user (owner or admin only)
    - PUT /api/users/users/{pk}/ - Full update user (owner or admin only)
    - DELETE /api/users/users/{pk}/ - Delete user (owner or admin only)
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        """
        Filter users based on role:
        - Admins (SU, AD, AM): See all users
        - Others: See only themselves
        """
        user = self.request.user
        admin_roles = ['SU', 'AD', 'AM']

        # Admin roles can see all users
        if user.is_superuser or user.profile_type in admin_roles:
            queryset = User.objects.select_related('profile').all()
        else:
            # Regular users can only see themselves
            queryset = User.objects.filter(id=user.id).select_related('profile')

        # Apply additional filters for admin views
        if user.is_superuser or user.profile_type in admin_roles:
            # Filter by profile type if provided
            profile_type = self.request.query_params.get('profile_type', None)
            if profile_type:
                queryset = queryset.filter(profile_type=profile_type)

            # Filter by verification status
            is_verified = self.request.query_params.get('is_verified', None)
            if is_verified is not None:
                queryset = queryset.filter(is_verified=is_verified.lower() == 'true')

        return queryset

    @action(detail=False, methods=['get', 'patch', 'put'])
    def me(self, request):
        """
        Get or update the current authenticated user's profile.

        GET /api/users/users/me/ - Returns current user
        PATCH /api/users/users/me/ - Partial update current user
        PUT /api/users/users/me/ - Full update current user
        """
        user = request.user

        if request.method == 'GET':
            serializer = self.get_serializer(user)
            return Response(serializer.data)

        elif request.method in ['PATCH', 'PUT']:
            partial = request.method == 'PATCH'
            serializer = self.get_serializer(user, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

        return Response({'detail': 'Method not allowed'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
