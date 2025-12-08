Users app - Auth endpoints

Endpoints (all under /api/users/):

- POST /signup/ {email, password, first_name?, last_name?}
  - Creates user and sends OTP to email for verification.
- POST /verify-otp/ {email, code, purpose}
  - Verify signup/login/reset OTP. purpose = signup|login|reset
- POST /request-otp-login/ {email}
  - Sends login OTP to the email (if account exists).
- POST /login-with-otp/ {email, code, purpose=login}
  - Verify OTP for login. Client should exchange for tokens at /o/token/ (OAuth2).
- POST /password-reset/request/ {email}
  - Sends password reset OTP.
- POST /password-reset/confirm/ {email, code, new_password}
  - Confirm reset with OTP and set new password.
- POST /social/<provider>/ {provider_token, email, provider_id?}
  - Placeholder social endpoint that creates/returns a verified user. Replace with proper provider verification in production.

Notes:
- Email sending uses Django console backend in development (check console logs).
- OTP TTL can be configured with OTP_TTL_MINUTES in settings (default 10).
- Use Django OAuth Toolkit to create OAuth2 clients and exchange credentials for tokens at /o/token/.
