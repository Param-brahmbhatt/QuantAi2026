from rest_framework import serializers
from .models import Profiling, MobileOTP
from django.utils import timezone
from Apps.Survey.models import Question, Answer, QuestionChoices
from Apps.Questionlogic.models import Variable

class MobileOTPRequestSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=20)
    purpose = serializers.ChoiceField(choices=[("mobile_verify", "Mobile Verification"), ("whatsapp_verify", "WhatsApp Verification")])

class MobileOTPVerifySerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=20)
    code = serializers.CharField(max_length=10)
    purpose = serializers.ChoiceField(choices=[("mobile_verify", "Mobile Verification"), ("whatsapp_verify", "WhatsApp Verification")])

    def validate(self, data):
        phone = data.get("phone_number")
        code = data.get("code")
        purpose = data.get("purpose")
        
        try:
            otp = MobileOTP.objects.filter(
                phone_number=phone, 
                purpose=purpose, 
                code=code, 
                used=False
            ).latest("created_at")
        except MobileOTP.DoesNotExist:
            raise serializers.ValidationError("Invalid or expired code")
        
        if otp.is_expired():
            raise serializers.ValidationError("Code has expired")
            
        data["otp_obj"] = otp
        return data

class ProfilingSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    profile_id = serializers.IntegerField(source='user.profile.id', read_only=True)
    
    class Meta:
        model = Profiling
        fields = [
            'id', 'profile_id', 'email',
            'full_name', 'gender', 'date_of_birth',
            'country', 'state_region', 'city', 'primary_language',
            'mobile_number', 'is_mobile_verified',
            'whatsapp_number', 'is_whatsapp_verified',
            'education_level',
            'participated_in_online_surveys', 'preferred_rewards',
            'consent_invitations', 'consent_data_usage',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'email', 'is_mobile_verified', 'is_whatsapp_verified', 'created_at', 'updated_at']

    def update(self, instance, validated_data):
        # We don't want users to manually update 'is_mobile_verified' etc directly via this serializer normally,
        # but if we needed to, we'd handle it here.
        # For now, excluding them from read_only logic if they were needed, but they are read_only.
        # So just standard update.
        return super().update(instance, validated_data)


class ProfilingQuestionSerializer(serializers.ModelSerializer):
    """Serializer for profiling questions (standalone questions asked during onboarding)"""

    choices = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = [
            'id', 'variable_name', 'title', 'description',
            'is_required', 'display_index', 'question_type',
            'widget', 'choices', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def get_choices(self, obj):
        """Get all choices for this question"""
        choices = []
        for choice_group in obj.choice_groups.all():
            for option in choice_group.options.all():
                choices.append({
                    'id': option.id,
                    'text': option.text,
                    'value': option.value,
                    'order': option.order
                })
        return sorted(choices, key=lambda x: x['order'])


class ProfilingAnswerSerializer(serializers.ModelSerializer):
    """Serializer for submitting answers to profiling questions"""

    class Meta:
        model = Answer
        fields = [
            'id', 'question', 'option', 'input', 'input_row',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_question(self, value):
        """Ensure the question is a profiling question"""
        if not value.is_profiling_question:
            raise serializers.ValidationError("This is not a profiling question")
        return value

    def create(self, validated_data):
        """Create answer with auto-linked profile and variable"""
        request = self.context.get('request')
        if not request or not request.user:
            raise serializers.ValidationError("User must be authenticated")

        # Get user's profile (Users.Profile model, not Profiles.Profiling)
        if not hasattr(request.user, 'profile'):
            raise serializers.ValidationError("User profile not found")

        profile = request.user.profile

        # Get question and variable
        question = validated_data['question']

        # Get or create variable for this question
        variable, _ = Variable.objects.get_or_create(
            name=question.variable_name,
            defaults={
                'display_name': question.title,
                'type': self._get_variable_type(question.question_type)
            }
        )

        # Check if answer already exists for this question and profile
        existing_answer = Answer.objects.filter(
            question=question,
            profile=profile
        ).first()

        if existing_answer:
            # Update existing answer
            for attr, value in validated_data.items():
                setattr(existing_answer, attr, value)
            existing_answer.variable = variable
            existing_answer.save()

            # Update many-to-many field if present
            if 'option' in validated_data:
                existing_answer.option.set(validated_data['option'])

            return existing_answer
        else:
            # Create new answer
            validated_data['profile'] = profile
            validated_data['variable'] = variable
            validated_data['project'] = None  # Profiling answers don't belong to a project

            # Extract option data before creating
            options = validated_data.pop('option', [])

            answer = Answer.objects.create(**validated_data)

            # Set many-to-many field
            if options:
                answer.option.set(options)
            
            # CRITICAL FIX: Auto-update Profile.citizen if this is the Country question
            # This ensures quotas (which use profile.citizen) work correctly.
            if variable.name == 'country':
                try:
                    # Get the answer value (e.g., "India")
                    country_name = answer.value
                    if country_name:
                        # Attempt to find ISO code. Simple mapping for common test cases,
                        # fallback to django_countries if complex lookup needed.
                        # For this specific project, value matches 'name' in CountryField usually.
                        from django_countries import countries
                        
                        # In django_countries, countries is an iterator of (code, name)
                        # We want to find code BY name.
                        iso_code = None
                        
                        # Direct check for Test values
                        if country_name == "India": iso_code = "IN"
                        elif country_name == "United States of America": iso_code = "US"
                        elif country_name == "United Kingdom": iso_code = "GB"
                        
                        # General lookup (slower but more robust)
                        if not iso_code:
                            for code, name in list(countries):
                                if name == country_name:
                                    iso_code = code
                                    break
                        
                        if iso_code:
                            profile.citizen = iso_code
                            profile.save()
                except Exception as e:
                    # Log error but don't fail the answer submission
                    print(f"Error updating profile citizen: {e}")

            return answer

    def _get_variable_type(self, question_type):
        """Map question type to variable type"""
        type_mapping = {
            'TXT': 'text',
            'TXTL': 'text',
            'RDO': 'single_choice',
            'CHB': 'multiple_choice',
            'DRP': 'single_choice',
            'RAT': 'number',
            'NPS': 'number',
            'SLI': 'number',
            'RNK': 'number',
            'DT': 'date',
            'FIL': 'file',
            'GEO': 'text',
        }
        return type_mapping.get(question_type, 'text')
