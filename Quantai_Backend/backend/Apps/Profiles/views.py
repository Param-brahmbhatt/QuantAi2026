from rest_framework import generics, status, permissions, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Profiling
from .serializers import (
    ProfilingSerializer,
    MobileOTPRequestSerializer,
    MobileOTPVerifySerializer,
    ProfilingQuestionSerializer,
    ProfilingAnswerSerializer
)
from .utils import create_and_send_mobile_otp
from Apps.Survey.models import Question, Answer

class ProfilingView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfilingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # Ensure Profiling object exists for the user
        obj, created = Profiling.objects.get_or_create(user=self.request.user)
        return obj

class MobileOTPRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = MobileOTPRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        phone_number = serializer.validated_data['phone_number']
        purpose = serializer.validated_data['purpose']
        
        create_and_send_mobile_otp(phone_number, user=request.user, purpose=purpose)
        
        return Response({"detail": "OTP sent successfully."}, status=status.HTTP_200_OK)

class MobileOTPVerifyView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = MobileOTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        otp = serializer.validated_data['otp_obj']
        profiling, created = Profiling.objects.get_or_create(user=request.user)

        # Update verification status based on purpose
        if otp.purpose == "mobile_verify":
            profiling.mobile_number = otp.phone_number
            profiling.is_mobile_verified = True
        elif otp.purpose == "whatsapp_verify":
            profiling.whatsapp_number = otp.phone_number
            profiling.is_whatsapp_verified = True

        profiling.save()
        otp.mark_used()

        return Response({"detail": "Verification successful.", "success": True}, status=status.HTTP_200_OK)


class ProfilingQuestionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for listing and retrieving profiling questions.
    These are standalone questions asked during user onboarding.
    """
    serializer_class = ProfilingQuestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return only profiling questions, ordered by display_index"""
        return Question.objects.filter(is_profiling_question=True).order_by('display_index')


class ProfilingAnswerViewSet(viewsets.ModelViewSet):
    """
    ViewSet for creating and managing answers to profiling questions.
    Users can view their own answers and submit new ones.
    """
    serializer_class = ProfilingAnswerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return only this user's profiling answers"""
        if hasattr(self.request.user, 'profile'):
            profile = self.request.user.profile
            return Answer.objects.filter(
                profile=profile,
                question__is_profiling_question=True
            ).order_by('question__display_index')
        return Answer.objects.none()

    def perform_create(self, serializer):
        """Save answer with context (includes user from request)"""
        serializer.save()
