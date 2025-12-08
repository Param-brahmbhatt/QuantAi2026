from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import User
from django.utils import timezone


class SignupAPITestCase(APITestCase):
	def test_signup_success_with_all_fields(self):
		url = reverse('users:signup')
		data = {
			"email": "testuser2@example.com",
			"password": "StrongPass!123",
			"confirm_password": "StrongPass!123",
			"first_name": "Test",
			"last_name": "User",
			"country": "United States"
		}
		response = self.client.post(url, data, format='json')
		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertTrue(User.objects.filter(email="testuser2@example.com").exists())
		self.assertIn("detail", response.data)
		# Check country in profile
		user = User.objects.get(email="testuser2@example.com")
		self.assertEqual(user.profile.citizen, "United States")


class VerifyOTPAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="testuser2@example.com",
            password="StrongPass!123",
            first_name="Test",
            last_name="User",
        )
        self.user.is_active = True
        self.user.save()
        # Simulate OTP creation
        from .models import EmailOTP
        self.otp = EmailOTP.objects.create(
            email=self.user.email,
            code="123456",
            purpose="signup",
            user=self.user,
            expires_at=timezone.now() + timezone.timedelta(minutes=5)
        )

    def test_verify_otp_success(self):
        url = reverse('users:verify_otp')
        data = {
            "email": self.user.email,
            "code": "123456",
            "purpose": "signup"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("detail", response.data)
        self.assertIn("token", response.data)
        self.assertTrue(response.data["success"])
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_verified)
