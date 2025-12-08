# QuantAI Backend - Complete API Documentation

**Version:** 1.0
**Base URL:** `http://localhost:8000`
**Authentication:** OAuth2 Bearer Token
**Date:** November 2025

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication Flow](#authentication-flow)
3. [Users API](#users-api)
4. [Projects API](#projects-api)
5. [Survey API](#survey-api)
6. [Question Logic Builder API](#question-logic-builder-api) ⭐ NEW
7. [Error Handling](#error-handling)

---

## Getting Started

### Prerequisites

1. **Start the Server:**
   ```bash
   python manage.py runserver
   ```

2. **Create OAuth2 Application:**
   - Go to `http://localhost:8000/admin/`
   - Navigate to **Django OAuth Toolkit → Applications**
   - Click **Add Application**
   - Set:
     - Client type: `Confidential`
     - Authorization grant type: `Resource owner password-based`
     - Name: `QuantAI Mobile App`
   - Save and copy `Client ID` and `Client Secret`

3. **Configure Postman:**
   - Import `QuantAi_Complete_API.postman_collection.json`
   - Set environment variables:
     - `base_url`: `http://localhost:8000`
     - `client_id`: Your OAuth2 Client ID
     - `client_secret`: Your OAuth2 Client Secret

---

## Authentication Flow

### Public Endpoints (No Auth Required)
- Signup
- Login
- OTP verification
- Password reset
- Social authentication

### Protected Endpoints (Require Bearer Token)
- All User Management endpoints
- All Projects endpoints
- All Survey endpoints

### Token Format
```
Authorization: Bearer {your_access_token}
```

---

# Users API

## 1. Authentication

### 1.1 Signup

**Creates a new user account and sends OTP for verification.**

- **Endpoint:** `POST /api/users/signup/`
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "confirm_password": "password123",
    "first_name": "John",
    "last_name": "Doe"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "detail": "User created successfully.",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "is_verified": false,
      "profile": {
        "id": 1,
        "profile_type": "AU",
        "phone": null
      }
    },
    "success": true
  }
  ```
- **Linked APIs:** After signup → **Verify OTP** (`POST /api/users/verify-otp/`)
- **Notes:**
  - OTP is sent to the provided email
  - User account is created but `is_verified=false`
  - Profile is auto-created via Django signals

---

### 1.2 Verify OTP

**Verifies the OTP code sent during signup, login, or password reset.**

- **Endpoint:** `POST /api/users/verify-otp/`
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "code": "123456",
    "purpose": "signup",
    "client_id": "your_client_id",
    "client_secret": "your_client_secret"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "detail": "OTP verified.",
    "token": {
      "access_token": "eyJhbGciOiJIUz...",
      "expires_in": 31104000,
      "token_type": "Bearer",
      "scope": "read write",
      "refresh_token": "eyJhbGciOiJIUz..."
    },
    "success": true
  }
  ```
- **Purpose Values:**
  - `signup`: After user registration
  - `login`: For OTP-based login
  - `reset`: For password reset flow
- **Linked APIs:** After verification → Use access_token for all protected endpoints
- **Notes:**
  - OTP expires after 10 minutes
  - User `is_verified` is set to `true`
  - Returns access_token if client credentials provided

---

### 1.3 Login (Email/Password)

**Authenticate user with email and password, returns OAuth2 token.**

- **Endpoint:** `POST /api/users/login/`
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "client_id": "your_client_id",
    "client_secret": "your_client_secret"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "access_token": "eyJhbGciOiJIUz...",
    "expires_in": 31104000,
    "token_type": "Bearer",
    "scope": "read write",
    "refresh_token": "eyJhbGciOiJIUz..."
  }
  ```
- **Response (403 Forbidden - Not Verified):**
  ```json
  {
    "detail": "Email not verified. OTP sent to your email.",
    "requires_verification": true,
    "purpose": "login"
  }
  ```
- **Linked APIs:** After login → Use `access_token` in Authorization header for all protected APIs
- **Notes:**
  - If user not verified, sends OTP → **Verify OTP** required
  - `client_id` and `client_secret` are required for token issuance
  - Token expires in 360 days (configurable)

---

### 1.4 Request OTP Login

**Request OTP for passwordless login.**

- **Endpoint:** `POST /api/users/request-otp-login/`
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "detail": "OTP sent if the account exists."
  }
  ```
- **Linked APIs:** After requesting OTP → **Login with OTP** (`POST /api/users/login-with-otp/`)
- **Notes:**
  - Always returns success (doesn't reveal if user exists)
  - OTP sent to email if account exists

---

### 1.5 Login with OTP

**Login using OTP code instead of password.**

- **Endpoint:** `POST /api/users/login-with-otp/`
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "code": "123456",
    "purpose": "login",
    "client_id": "your_client_id",
    "client_secret": "your_client_secret"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "access_token": "eyJhbGciOiJIUz...",
    "expires_in": 31104000,
    "token_type": "Bearer",
    "scope": "read write",
    "refresh_token": "eyJhbGciOiJIUz..."
  }
  ```
- **Linked APIs:** After login → Use access_token for all protected endpoints
- **Notes:**
  - Must first call **Request OTP Login**
  - OTP expires after 10 minutes

---

## 2. Password Reset

### 2.1 Password Reset Request

**Request OTP for password reset.**

- **Endpoint:** `POST /api/users/password-reset/request/`
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "detail": "If an account exists, an OTP has been sent."
  }
  ```
- **Linked APIs:** After requesting → **Password Reset Confirm** (`POST /api/users/password-reset/confirm/`)
- **Notes:**
  - Always returns success (doesn't reveal if user exists)
  - OTP sent to email with purpose "reset"

---

### 2.2 Password Reset Confirm

**Confirm password reset with OTP and set new password.**

- **Endpoint:** `POST /api/users/password-reset/confirm/`
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "code": "123456",
    "new_password": "NewSecur3P@ss!"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "detail": "Password reset successful"
  }
  ```
- **Linked APIs:** After reset → **Login** (`POST /api/users/login/`)
- **Notes:**
  - OTP must be from password reset flow (purpose="reset")
  - Password is hashed before saving
  - OTP is marked as used after successful reset

---

## 3. Social Authentication

### 3.1 Social Auth - Google

**Authenticate using Google ID token.**

- **Endpoint:** `POST /api/users/social/google/`
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "provider_token": "<google_id_token_here>",
    "email": "user@example.com",
    "client_id": "your_client_id",
    "client_secret": "your_client_secret"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "access_token": "eyJhbGciOiJIUz...",
    "expires_in": 31104000,
    "token_type": "Bearer",
    "scope": "read write",
    "refresh_token": "eyJhbGciOiJIUz..."
  }
  ```
- **Linked APIs:** After social auth → Use access_token for all protected endpoints
- **Notes:**
  - Google ID token is verified with Google's servers
  - User is created if doesn't exist (auto-verified)
  - Email extracted from Google token

---

### 3.2 Social Auth - Facebook

**Authenticate using Facebook access token.**

- **Endpoint:** `POST /api/users/social/facebook/`
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "provider_token": "<facebook_access_token_here>",
    "email": "user@example.com",
    "client_id": "your_client_id",
    "client_secret": "your_client_secret"
  }
  ```
- **Response:** Same as Google
- **Notes:**
  - Facebook token verified via Graph API
  - User auto-created and verified

---

### 3.3 Social Auth - Twitter (X)

**Authenticate using Twitter/X bearer token.**

- **Endpoint:** `POST /api/users/social/twitter/`
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "provider_token": "<twitter_bearer_token_here>",
    "email": "user@example.com",
    "client_id": "your_client_id",
    "client_secret": "your_client_secret"
  }
  ```
- **Response:** Same as Google
- **Notes:**
  - Twitter API v2 used for verification
  - Email may not be available from Twitter; can be provided in request

---

### 3.4 Social Auth - Apple

**Authenticate using Apple ID token.**

- **Endpoint:** `POST /api/users/social/apple/`
- **Authentication:** None
- **Request Body:**
  ```json
  {
    "provider_token": "<apple_id_token_here>",
    "email": "user@example.com",
    "client_id": "your_client_id",
    "client_secret": "your_client_secret"
  }
  ```
- **Response:** Same as Google
- **Notes:**
  - Apple JWT verified with Apple's JWKS
  - Email from token or request body

---

## 4. OAuth2

### 4.1 OAuth2 - Token (Password Grant)

**Get access token using email/password via standard OAuth2 flow.**

- **Endpoint:** `POST /o/token/`
- **Authentication:** None
- **Request Body (form-urlencoded):**
  ```
  grant_type=password
  username=user@example.com
  password=password123
  client_id=your_client_id
  client_secret=your_client_secret
  ```
- **Response (200 OK):**
  ```json
  {
    "access_token": "eyJhbGciOiJIUz...",
    "expires_in": 31104000,
    "token_type": "Bearer",
    "scope": "read write",
    "refresh_token": "eyJhbGciOiJIUz..."
  }
  ```
- **Linked APIs:** After getting token → Use for all protected endpoints
- **Notes:**
  - Standard OAuth2 password grant flow
  - User must be verified

---

### 4.2 OAuth2 - Token (Refresh)

**Refresh expired access token using refresh token.**

- **Endpoint:** `POST /o/token/`
- **Authentication:** None
- **Request Body (form-urlencoded):**
  ```
  grant_type=refresh_token
  refresh_token=your_refresh_token
  client_id=your_client_id
  client_secret=your_client_secret
  ```
- **Response (200 OK):**
  ```json
  {
    "access_token": "eyJhbGciOiJIUz...",
    "expires_in": 31104000,
    "token_type": "Bearer",
    "scope": "read write",
    "refresh_token": "eyJhbGciOiJIUz..."
  }
  ```
- **Notes:**
  - Returns new access_token and refresh_token
  - Old refresh_token is invalidated

---

## 5. User Management

### 5.1 List Users

**Get paginated list of all users with optional filters.**

- **Endpoint:** `GET /api/users/users/`
- **Authentication:** Required (Bearer Token)
- **Query Parameters:**
  - `profile_type`: Filter by profile type (AU, AD, CL)
  - `is_verified`: Filter by verification status (true/false)
- **Request Example:**
  ```
  GET /api/users/users/?profile_type=AU&is_verified=true
  Authorization: Bearer eyJhbGciOiJIUz...
  ```
- **Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "email": "user1@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "phone": "+1234567890",
      "is_verified": true,
      "is_terms_accepted": true,
      "profile": {
        "id": 1,
        "profile_type": "AU",
        "citizen": "US"
      }
    },
    {
      "id": 2,
      "email": "user2@example.com",
      "first_name": "Jane",
      "last_name": "Smith",
      "is_verified": true,
      "profile": {
        "id": 2,
        "profile_type": "AU",
        "citizen": "UK"
      }
    }
  ]
  ```
- **Linked APIs:** Select specific user → **Get User** (`GET /api/users/users/{pk}/`)
- **Notes:**
  - Results include nested profile data
  - Admin users can see all users
  - Supports pagination (add `?page=2`)

---

### 5.2 Get My Profile ⭐ NEW

**Get the authenticated user's profile without needing pk.**

- **Endpoint:** `GET /api/users/users/me/`
- **Authentication:** Required (Bearer Token)
- **Request:**
  ```
  GET /api/users/users/me/
  Authorization: Bearer eyJhbGciOiJIUz...
  ```
- **Response (200 OK):**
  ```json
  {
    "id": 5,
    "email": "currentuser@example.com",
    "first_name": "Current",
    "last_name": "User",
    "phone": "+1234567890",
    "is_verified": true,
    "is_terms_accepted": true,
    "profile": {
      "id": 5,
      "profile_type": "AU",
      "citizen": "US",
      "is_mobile_verified": false,
      "is_email_verified": true
    }
  }
  ```
- **Linked APIs:** To update → **Update My Profile** (`PATCH /api/users/users/me/`)
- **Notes:**
  - Automatically uses user ID from token
  - No pk parameter needed
  - Returns full user + profile data

---

### 5.3 Update My Profile ⭐ NEW

**Update the authenticated user's profile (partial update).**

- **Endpoint:** `PATCH /api/users/users/me/`
- **Authentication:** Required (Bearer Token)
- **Request Body:**
  ```json
  {
    "first_name": "Updated Name",
    "phone": "+9876543210"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "id": 5,
    "email": "currentuser@example.com",
    "first_name": "Updated Name",
    "last_name": "User",
    "phone": "+9876543210",
    "is_verified": true,
    "profile": {
      "id": 5,
      "profile_type": "AU"
    }
  }
  ```
- **Linked APIs:** To view changes → **Get My Profile** (`GET /api/users/users/me/`)
- **Notes:**
  - Only updates provided fields (partial update)
  - Cannot change email (security)
  - Cannot change `is_verified` (admin only)
  - Profile fields updated via related Profile model

---

### 5.4 Get User (Admin)

**Get specific user by ID (admin function).**

- **Endpoint:** `GET /api/users/users/{pk}/`
- **Authentication:** Required (Bearer Token)
- **Request:**
  ```
  GET /api/users/users/3/
  Authorization: Bearer eyJhbGciOiJIUz...
  ```
- **Response (200 OK):**
  ```json
  {
    "id": 3,
    "email": "user3@example.com",
    "first_name": "Alice",
    "last_name": "Johnson",
    "phone": "+1112223333",
    "is_verified": true,
    "profile": {
      "id": 3,
      "profile_type": "CL",
      "citizen": "CA"
    }
  }
  ```
- **Linked APIs:**
  - To update → **Update User** (`PATCH /api/users/users/{pk}/`)
  - To list all → **List Users** (`GET /api/users/users/`)
- **Notes:**
  - Requires user pk (primary key/ID)
  - pk obtained from login response or list users

---

### 5.5 Update User (Admin)

**Update specific user by ID (admin function).**

- **Endpoint:** `PATCH /api/users/users/{pk}/`
- **Authentication:** Required (Bearer Token)
- **Request Body:**
  ```json
  {
    "first_name": "Updated First Name",
    "last_name": "Updated Last Name",
    "phone": "+9999999999",
    "is_terms_accepted": true
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "id": 3,
    "email": "user3@example.com",
    "first_name": "Updated First Name",
    "last_name": "Updated Last Name",
    "phone": "+9999999999",
    "is_verified": true,
    "is_terms_accepted": true,
    "profile": {
      "id": 3,
      "profile_type": "CL"
    }
  }
  ```
- **Linked APIs:** To view updated user → **Get User** (`GET /api/users/users/{pk}/`)
- **Notes:**
  - Partial update (only specified fields changed)
  - For full update, use `PUT` instead of `PATCH`

---

# Projects API

## 1. Languages

### 1.1 List Languages

**Get all available languages.**

- **Endpoint:** `GET /api/languages/`
- **Authentication:** Required (Bearer Token)
- **Request:**
  ```
  GET /api/languages/
  Authorization: Bearer eyJhbGciOiJIUz...
  ```
- **Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "code": "en",
      "name": "English",
      "is_active": true,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    },
    {
      "id": 2,
      "code": "es",
      "name": "Spanish",
      "is_active": true
    }
  ]
  ```
- **Linked APIs:**
  - To create project → Use language IDs in **Create Project** (`POST /api/projects/`)
- **Notes:**
  - Used to associate projects with multiple languages

---

### 1.2 Create Language

**Create a new language.**

- **Endpoint:** `POST /api/languages/`
- **Authentication:** Required (Bearer Token)
- **Request Body:**
  ```json
  {
    "code": "fr",
    "name": "French",
    "is_active": true
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "id": 3,
    "code": "fr",
    "name": "French",
    "is_active": true,
    "created_at": "2025-01-10T10:00:00Z",
    "updated_at": "2025-01-10T10:00:00Z"
  }
  ```
- **Notes:**
  - `code` must be unique (e.g., ISO 639-1 codes)

---

### 1.3 Get Language

**Get specific language by ID.**

- **Endpoint:** `GET /api/languages/{id}/`
- **Authentication:** Required (Bearer Token)
- **Request:**
  ```
  GET /api/languages/1/
  Authorization: Bearer eyJhbGciOiJIUz...
  ```
- **Response (200 OK):**
  ```json
  {
    "id": 1,
    "code": "en",
    "name": "English",
    "is_active": true,
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  }
  ```

---

### 1.4 Update Language

**Update language details.**

- **Endpoint:** `PUT /api/languages/{id}/`
- **Authentication:** Required (Bearer Token)
- **Request Body:**
  ```json
  {
    "code": "en",
    "name": "English (Updated)",
    "is_active": true
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "id": 1,
    "code": "en",
    "name": "English (Updated)",
    "is_active": true,
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-10T10:00:00Z"
  }
  ```
- **Notes:**
  - Use `PATCH` for partial updates
  - `code` should remain unique

---

### 1.5 Delete Language

**Delete a language.**

- **Endpoint:** `DELETE /api/languages/{id}/`
- **Authentication:** Required (Bearer Token)
- **Response (204 No Content)**
- **Notes:**
  - Cannot delete if language is used in active projects
  - Soft delete recommended for production

---

## 2. Projects

### 2.1 List Projects

**Get all projects with optional filters.**

- **Endpoint:** `GET /api/projects/`
- **Authentication:** Required (Bearer Token)
- **Query Parameters:**
  - `project_type`: Filter by type (SU=Survey, PR=Profiling)
  - `active`: Filter by active status (true/false)
  - `mode`: Filter by mode (DE, PR, DV, LI, CO)
- **Request Example:**
  ```
  GET /api/projects/?project_type=SU&active=true
  Authorization: Bearer eyJhbGciOiJIUz...
  ```
- **Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Customer Satisfaction Survey",
      "description": "Annual customer satisfaction survey",
      "languages": [
        {
          "id": 1,
          "code": "en",
          "name": "English"
        }
      ],
      "active": true,
      "start_time": "2025-01-01T00:00:00Z",
      "end_time": "2025-12-31T23:59:59Z",
      "reward_points": 100.0,
      "code": "CSAT-2025-01",
      "project_type": "SU",
      "mode": "PR",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
  ```
- **Linked APIs:**
  - To add questions → **Create Question** (`POST /api/questions/`)
  - To view questions → **Get Project Questions** (`GET /api/projects/{id}/questions/`)
- **Notes:**
  - **project_type:** `SU` = Survey, `PR` = Profiling
  - **mode:** `DE` = Demo, `PR` = Production, `DV` = Development, `LI` = Live, `CO` = Completed

---

### 2.2 Create Project

**Create a new survey or profiling project.**

- **Endpoint:** `POST /api/projects/`
- **Authentication:** Required (Bearer Token)
- **Request Body:**
  ```json
  {
    "title": "Customer Satisfaction Survey",
    "description": "Annual customer satisfaction survey",
    "language_ids": [1, 2],
    "active": true,
    "start_time": "2025-01-01T00:00:00Z",
    "end_time": "2025-12-31T23:59:59Z",
    "reward_points": 100.0,
    "code": "CSAT-2025-01",
    "project_type": "SU",
    "mode": "PR"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "id": 1,
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Customer Satisfaction Survey",
    "description": "Annual customer satisfaction survey",
    "languages": [
      {
        "id": 1,
        "code": "en",
        "name": "English"
      }
    ],
    "active": true,
    "start_time": "2025-01-01T00:00:00Z",
    "end_time": "2025-12-31T23:59:59Z",
    "reward_points": 100.0,
    "code": "CSAT-2025-01",
    "project_type": "SU",
    "mode": "PR",
    "created_at": "2025-01-10T10:00:00Z"
  }
  ```
- **Linked APIs:**
  - After creating → **Create Question** (`POST /api/questions/`) with `project` field
- **Validation:**
  - `code` must be unique
  - `start_time` < `end_time`
  - `reward_points` >= 0
  - `language_ids` must exist
- **Notes:**
  - UUID auto-generated
  - Use `language_ids` (array) not `languages`

---

### 2.3 Get Project

**Get specific project by ID.**

- **Endpoint:** `GET /api/projects/{id}/`
- **Authentication:** Required (Bearer Token)
- **Request:**
  ```
  GET /api/projects/1/
  Authorization: Bearer eyJhbGciOiJIUz...
  ```
- **Response:** Same structure as Create Project response

---

### 2.4 Update Project (Full)

**Full update of project (all fields required).**

- **Endpoint:** `PUT /api/projects/{id}/`
- **Authentication:** Required (Bearer Token)
- **Request Body:** Same as Create Project
- **Response:** Updated project object
- **Notes:**
  - Requires all fields
  - Use `PATCH` for partial updates

---

### 2.5 Partial Update Project

**Partial update (only specified fields).**

- **Endpoint:** `PATCH /api/projects/{id}/`
- **Authentication:** Required (Bearer Token)
- **Request Body:**
  ```json
  {
    "active": false,
    "reward_points": 150.0
  }
  ```
- **Response:** Updated project object
- **Notes:**
  - Only updates specified fields

---

### 2.6 Activate Project

**Custom action to activate a project.**

- **Endpoint:** `POST /api/projects/{id}/activate/`
- **Authentication:** Required (Bearer Token)
- **Request Body:** None
- **Response:**
  ```json
  {
    "id": 1,
    "active": true,
    "title": "Customer Satisfaction Survey",
    ...
  }
  ```
- **Linked APIs:** Opposite action → **Deactivate Project**
- **Notes:**
  - Sets `active=true`
  - Validates project is ready (has questions, valid dates, etc.)

---

### 2.7 Deactivate Project

**Custom action to deactivate a project.**

- **Endpoint:** `POST /api/projects/{id}/deactivate/`
- **Authentication:** Required (Bearer Token)
- **Response:** Project object with `active=false`

---

### 2.8 Get Project Questions

**Get all questions for a specific project.**

- **Endpoint:** `GET /api/projects/{id}/questions/`
- **Authentication:** Required (Bearer Token)
- **Request:**
  ```
  GET /api/projects/1/questions/
  Authorization: Bearer eyJhbGciOiJIUz...
  ```
- **Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "project": 1,
      "variable_name": "satisfaction_rating",
      "title": "How satisfied are you with our service?",
      "description": "Please rate your overall satisfaction",
      "is_required": true,
      "is_initial_question": true,
      "display_index": 1,
      "question_type": "rating",
      "widget": "star_rating",
      "choice_groups": []
    }
  ]
  ```
- **Linked APIs:**
  - To create question → **Create Question** (`POST /api/questions/`)
- **Notes:**
  - Returns all questions ordered by `display_index`

---

### 2.9 Delete Project

**Delete a project.**

- **Endpoint:** `DELETE /api/projects/{id}/`
- **Authentication:** Required (Bearer Token)
- **Response (204 No Content)**
- **Notes:**
  - Cascades to delete all related questions
  - Cannot delete if project has responses

---

# Survey API

## 1. Questions

### 1.1 List Questions

**Get all questions with optional filter by project.**

- **Endpoint:** `GET /api/questions/`
- **Authentication:** Required (Bearer Token)
- **Query Parameters:**
  - `project`: Filter by project ID
- **Request Example:**
  ```
  GET /api/questions/?project=1
  Authorization: Bearer eyJhbGciOiJIUz...
  ```
- **Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "project": 1,
      "project_title": "Customer Satisfaction Survey",
      "variable_name": "satisfaction_rating",
      "title": "How satisfied are you with our service?",
      "description": "Please rate your overall satisfaction",
      "is_required": true,
      "is_initial_question": true,
      "display_index": 1,
      "question_type": "rating",
      "widget": "star_rating",
      "file_upload_allowed_extention": null,
      "option_rotation": null,
      "choice_groups": [
        {
          "id": 1,
          "title": "Rating Options",
          "options": [
            {
              "id": 1,
              "text": "Excellent",
              "value": "5",
              "order": 1
            },
            {
              "id": 2,
              "text": "Good",
              "value": "4",
              "order": 2
            }
          ]
        }
      ],
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
  ```
- **Linked APIs:**
  - To view project → **Get Project** (`GET /api/projects/{id}/`)
  - To add choices → **Create Question Choice** (`POST /api/question-choices/`)
- **Notes:**
  - Includes nested choice_groups and options
  - `display_index` determines question order

---

### 1.2 Create Question

**Create a new question for a project.**

- **Endpoint:** `POST /api/questions/`
- **Authentication:** Required (Bearer Token)
- **Request Body:**
  ```json
  {
    "project": 1,
    "variable_name": "satisfaction_rating",
    "title": "How satisfied are you with our service?",
    "description": "Please rate your overall satisfaction",
    "is_required": true,
    "is_initial_question": true,
    "display_index": 1,
    "question_type": "rating",
    "widget": "star_rating"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "id": 1,
    "project": 1,
    "project_title": "Customer Satisfaction Survey",
    "variable_name": "satisfaction_rating",
    "title": "How satisfied are you with our service?",
    "description": "Please rate your overall satisfaction",
    "is_required": true,
    "is_initial_question": true,
    "display_index": 1,
    "question_type": "rating",
    "widget": "star_rating",
    "choice_groups": [],
    "created_at": "2025-01-10T10:00:00Z"
  }
  ```
- **Linked APIs:**
  - After creating → **Create Question Choice** (`POST /api/question-choices/`)
  - To group questions → **Create Question Group** (`POST /api/question-groups/`)
- **Question Types (Common):**
  - `single_choice`: Radio buttons
  - `multiple_choice`: Checkboxes
  - `text`: Short text input
  - `textarea`: Long text
  - `number`: Numeric input
  - `date`: Date picker
  - `rating`: Star rating
  - `file_upload`: File upload
  - `matrix`: Grid questions
- **Widget Types:**
  - `radio`, `dropdown`, `checkbox`, `text_input`, `textarea`, `star_rating`, `slider`, etc.
- **Validation:**
  - `project` must exist
  - `variable_name` should be unique per project
  - `display_index` determines order

---

### 1.3 Get Question

**Get specific question by ID.**

- **Endpoint:** `GET /api/questions/{id}/`
- **Authentication:** Required (Bearer Token)
- **Response:** Full question object with nested choice_groups

---

### 1.4 Update Question

**Full update of question.**

- **Endpoint:** `PUT /api/questions/{id}/`
- **Authentication:** Required (Bearer Token)
- **Request Body:** All question fields
- **Response:** Updated question object

---

### 1.5 Get Question Choices

**Get all choice groups for a specific question.**

- **Endpoint:** `GET /api/questions/{id}/choices/`
- **Authentication:** Required (Bearer Token)
- **Request:**
  ```
  GET /api/questions/1/choices/
  Authorization: Bearer eyJhbGciOiJIUz...
  ```
- **Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "question": 1,
      "title": "Rating Options",
      "title_align": "center",
      "description": "Please select one",
      "description_align": "left",
      "options": [
        {
          "id": 1,
          "text": "Excellent",
          "value": "5",
          "order": 1
        },
        {
          "id": 2,
          "text": "Good",
          "value": "4",
          "order": 2
        }
      ]
    }
  ]
  ```
- **Notes:**
  - Returns all choice groups for the question
  - Includes nested options

---

### 1.6 Delete Question

**Delete a question.**

- **Endpoint:** `DELETE /api/questions/{id}/`
- **Authentication:** Required (Bearer Token)
- **Response (204 No Content)**
- **Notes:**
  - Cascades to delete related choice groups

---

## 2. Question Groups

### 2.1 List Question Groups

**Get all question groups with optional filter by project.**

- **Endpoint:** `GET /api/question-groups/`
- **Authentication:** Required (Bearer Token)
- **Query Parameters:**
  - `project`: Filter by project ID
- **Request Example:**
  ```
  GET /api/question-groups/?project=1
  Authorization: Bearer eyJhbGciOiJIUz...
  ```
- **Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "project": 1,
      "project_title": "Customer Satisfaction Survey",
      "title": "Demographics Section",
      "title_align": "center",
      "description": "Please provide your demographic information",
      "description_align": "left",
      "questions": [
        {
          "id": 1,
          "title": "What is your age?",
          "question_type": "number"
        },
        {
          "id": 2,
          "title": "What is your gender?",
          "question_type": "single_choice"
        }
      ],
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
  ```
- **Linked APIs:**
  - To create → **Create Question Group** (`POST /api/question-groups/`)
- **Notes:**
  - Groups questions into logical sections
  - Used for UI organization

---

### 2.2 Create Question Group

**Create a new question group.**

- **Endpoint:** `POST /api/question-groups/`
- **Authentication:** Required (Bearer Token)
- **Request Body:**
  ```json
  {
    "project": 1,
    "title": "Demographics Section",
    "title_align": "center",
    "description": "Please provide your demographic information",
    "description_align": "left",
    "question_ids": [1, 2, 3]
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "id": 1,
    "project": 1,
    "project_title": "Customer Satisfaction Survey",
    "title": "Demographics Section",
    "title_align": "center",
    "description": "Please provide your demographic information",
    "description_align": "left",
    "questions": [
      {
        "id": 1,
        "title": "What is your age?"
      },
      {
        "id": 2,
        "title": "What is your gender?"
      }
    ],
    "created_at": "2025-01-10T10:00:00Z"
  }
  ```
- **Linked APIs:**
  - Questions must exist → **Create Question** first
- **Notes:**
  - Use `question_ids` to link existing questions
  - Questions can belong to multiple groups

---

## 3. Question Choices

### 3.1 List Question Choices

**Get all individual choice options.**

- **Endpoint:** `GET /api/question-choices/`
- **Authentication:** Required (Bearer Token)
- **Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "text": "Excellent",
      "value": "5",
      "order": 1,
      "created_at": "2025-01-01T00:00:00Z"
    },
    {
      "id": 2,
      "text": "Good",
      "value": "4",
      "order": 2
    }
  ]
  ```
- **Notes:**
  - These are individual choice options
  - Must be added to QuestionChoicesGroup to link to questions

---

### 3.2 Create Question Choice

**Create a new choice option.**

- **Endpoint:** `POST /api/question-choices/`
- **Authentication:** Required (Bearer Token)
- **Request Body:**
  ```json
  {
    "text": "Excellent",
    "value": "5",
    "order": 1
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "id": 1,
    "text": "Excellent",
    "value": "5",
    "order": 1,
    "created_at": "2025-01-10T10:00:00Z"
  }
  ```
- **Linked APIs:**
  - After creating → Link to question via **QuestionChoicesGroup**
- **Workflow:**
  1. Create choices using this endpoint
  2. Create QuestionChoicesGroup
  3. Link choices to group using `option_ids`
- **Notes:**
  - `text`: Display text shown to user
  - `value`: Stored value (usually number or code)
  - `order`: Display order in list

---

## 4. Answers ⭐ NEW

### 4.1 Submit Answer

**Submit user's answer to a question.**

- **Endpoint:** `POST /api/answers/`
- **Authentication:** Required (Bearer Token)
- **Request Body:**
  ```json
  {
    "question": 5,
    "project": 1,
    "profile": 1,
    "input": {
      // Format varies by question type (see below)
    }
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "id": 1,
    "input": {"value": "Satisfied"},
    "input_row": null,
    "is_demo": false,
    "is_last": false,
    "created_at": "2025-11-23T13:15:00Z",
    "updated_at": "2025-11-23T13:15:00Z",
    "question": 5,
    "project": 1,
    "profile": 1,
    "variable": null,
    "option": []
  }
  ```
- **Validation:**
  - Project must be active
  - Question must belong to the specified project
- **Linked APIs:** After submitting → **Calculate Next Question** (`POST /api/next-question/`)

---

### 4.2 Answer Input Formats by Question Type

The `input` field format varies based on the question type:

#### **Radio Button (RDO)**
```json
{
  "question": 1,
  "project": 1,
  "profile": 1,
  "input": {
    "value": "Option A"
  }
}
```

#### **Checkbox (CHB) - Multiple Selection**
```json
{
  "question": 2,
  "project": 1,
  "profile": 1,
  "input": {
    "options": ["Option A", "Option C", "Option D"]
  }
}
```

#### **Text Short (TXT)**
```json
{
  "question": 3,
  "project": 1,
  "profile": 1,
  "input": {
    "value": "This is my short answer"
  }
}
```

#### **Text Long (TXTL) - Textarea**
```json
{
  "question": 4,
  "project": 1,
  "profile": 1,
  "input": {
    "value": "This is a longer response with multiple sentences and paragraphs..."
  }
}
```

#### **Rating (RAT)**
```json
{
  "question": 5,
  "project": 1,
  "profile": 1,
  "input": {
    "value": "4"
  }
}
```
- Value typically 1-5 or 1-10 depending on scale

#### **NPS (Net Promoter Score)**
```json
{
  "question": 6,
  "project": 1,
  "profile": 1,
  "input": {
    "value": "8"
  }
}
```
- Value must be 0-10

#### **Slider (SLD)**
```json
{
  "question": 7,
  "project": 1,
  "profile": 1,
  "input": {
    "value": "75"
  }
}
```
- Value represents slider position (e.g., 0-100)

#### **Dropdown (DRP)**
```json
{
  "question": 8,
  "project": 1,
  "profile": 1,
  "input": {
    "value": "Selected Option"
  }
}
```

#### **Matrix (MTX)**
```json
{
  "question": 9,
  "project": 1,
  "profile": 1,
  "input": {
    "matrix": {
      "row1": "column2",
      "row2": "column1",
      "row3": "column3"
    }
  }
}
```
- Keys are row identifiers, values are selected column identifiers

#### **File Upload (FIL)**
```json
{
  "question": 10,
  "project": 1,
  "profile": 1,
  "input": {
    "file_url": "https://storage.example.com/uploads/file123.pdf",
    "file_name": "document.pdf",
    "file_size": 1024000
  }
}
```
- File should be uploaded to storage first, then URL submitted

#### **Date (DAT)**
```json
{
  "question": 11,
  "project": 1,
  "profile": 1,
  "input": {
    "value": "2025-11-23"
  }
}
```
- Use ISO date format (YYYY-MM-DD)

#### **Geolocation (GEO)**
```json
{
  "question": 12,
  "project": 1,
  "profile": 1,
  "input": {
    "latitude": "37.7749",
    "longitude": "-122.4194",
    "accuracy": "10"
  }
}
```
- Latitude and longitude as strings
- Optional accuracy in meters

---

### 4.3 List Answers

**Get all answers with optional filters.**

- **Endpoint:** `GET /api/answers/`
- **Authentication:** Required (Bearer Token)
- **Query Parameters:**
  - `project`: Filter by project ID
  - `profile`: Filter by profile ID
  - `question`: Filter by question ID
- **Request Example:**
  ```
  GET /api/answers/?project=1&profile=5
  Authorization: Bearer eyJhbGciOiJIUz...
  ```
- **Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "input": {"value": "Satisfied"},
      "question": 5,
      "project": 1,
      "profile": 1,
      "created_at": "2025-11-23T13:15:00Z"
    },
    {
      "id": 2,
      "input": {"options": ["Option A", "Option B"]},
      "question": 6,
      "project": 1,
      "profile": 1,
      "created_at": "2025-11-23T13:16:00Z"
    }
  ]
  ```

---

### 4.4 Complete Survey Flow Example

Here's how a typical survey submission works:

**Step 1: Get Initial Question**
```
GET /api/questions/?project=1&is_initial_question=true
```

**Step 2: Display Question to User**
- Render UI based on `question_type` and `widget`
- Show options from `choice_groups` if applicable

**Step 3: User Submits Answer**
```
POST /api/answers/
{
  "question": 1,
  "project": 1,
  "profile": 1,
  "input": {"value": "Yes"}
}
```

**Step 4: Calculate Next Question**
```
POST /api/next-question/
{
  "question_id": 1,
  "answer_data": {"value": "Yes"}
}
```

**Response:**
```json
{
  "next_question_id": 5,
  "action": "CONTINUE",
  "next_question": {
    "id": 5,
    "title": "Why did you choose Yes?",
    "question_type": "TXTL"
  }
}
```

**Step 5: Repeat Steps 2-4**
Continue until `action: "END_SURVEY"`

**Step 6: Mark Survey Complete**
```
PATCH /api/audience-details/{id}/
{
  "status": "Completed"
}
```

---

### 4.5 Logic Evaluation with Answers

The answer data submitted is used by the logic engine to determine the next question:

**Example: Skip Logic Based on Answer**

**Setup:**
- Question 1: "Are you satisfied?" (RDO)
- Logic Rule: IF answer = "Yes" → SKIP_TO Question 5
- Logic Rule: IF answer = "No" → Go to Question 2

**Flow when user answers "Yes":**
1. Submit: `POST /api/answers/` with `{"value": "Yes"}`
2. Calculate: `POST /api/next-question/` with `{"value": "Yes"}`
3. Logic matches → Returns Question 5
4. Display Question 5

**Flow when user answers "No":**
1. Submit: `POST /api/answers/` with `{"value": "No"}`
2. Calculate: `POST /api/next-question/` with `{"value": "No"}`
3. Logic doesn't match → Returns Question 2 (sequential)
4. Display Question 2

---

# Error Handling

## Common Error Responses

### 400 Bad Request
```json
{
  "detail": "Validation error message",
  "errors": {
    "field_name": ["Error message for field"]
  }
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

## HTTP Status Codes

- `200 OK`: Successful GET, PATCH, PUT
- `201 Created`: Successful POST
- `204 No Content`: Successful DELETE
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Permission denied
- `404 Not Found`: Resource doesn't exist
- `500 Internal Server Error`: Server error

---

## Common Workflows

### Workflow 1: User Registration & Login
1. **Signup** → `POST /api/users/signup/`
2. **Verify OTP** → `POST /api/users/verify-otp/` (receive access_token)
3. **Get My Profile** → `GET /api/users/users/me/`
4. **Update My Profile** → `PATCH /api/users/users/me/`

### Workflow 2: Create Survey Project
1. **List Languages** → `GET /api/languages/` (get language IDs)
2. **Create Project** → `POST /api/projects/` (use language IDs)
3. **Create Questions** → `POST /api/questions/` (link to project)
4. **Create Choices** → `POST /api/question-choices/` (for each option)
5. **Create Choice Group** → Link choices to question
6. **Activate Project** → `POST /api/projects/{id}/activate/`

### Workflow 3: Admin Managing Users
1. **Login** → `POST /api/users/login/` (get admin token)
2. **List Users** → `GET /api/users/users/?profile_type=AU`
3. **Get Specific User** → `GET /api/users/users/5/`
4. **Update User** → `PATCH /api/users/users/5/`

### Workflow 4: Building Survey with Logic ⭐ NEW
1. **Create Project** → `POST /api/projects/`
2. **Create Questions** → `POST /api/questions/` (auto-creates Variables)
3. **Create Logic Node** → `POST /api/logic-nodes/` (define skip/display rules)
4. **Create Conditions** → `POST /api/conditions/` (define when logic triggers)
5. **Test Logic** → `POST /api/next-question/` (verify flow)
6. **Activate Project** → `POST /api/projects/{id}/activate/`

### Workflow 5: Taking a Survey (End User) ⭐ NEW
1. **Get Initial Question** → `GET /api/questions/?project=1&is_initial_question=true`
2. **Display Question** → Render UI based on `question_type`
3. **Submit Answer** → `POST /api/answers/` (with appropriate input format)
4. **Calculate Next** → `POST /api/next-question/` (with answer data)
5. **Repeat 2-4** → Until `action: "END_SURVEY"`
6. **Mark Complete** → `PATCH /api/audience-details/{id}/` with `status: "Completed"`

---

# Question Logic Builder API ⭐ NEW

## Overview

The Question Logic Builder enables dynamic survey flows with conditional branching, skip logic, and display rules. The system automatically manages variables and evaluates conditions to determine the next question based on user responses.

### Key Features
- **Automatic Variable Management**: Variables auto-created when questions are created
- **Skip Logic**: Jump to specific questions based on conditions
- **Display Logic**: Show/hide questions conditionally
- **Priority-Based Execution**: Multiple rules evaluated in order
- **AND/OR Logic**: Complex condition combinations
- **Fallback Behavior**: Sequential flow when no rules match

---

## 1. Variables

### 1.1 List Variables

**Get all variables (auto-created from questions).**

- **Endpoint:** `GET /api/variables/`
- **Authentication:** Required (Bearer Token)
- **Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "name": "satisfaction",
      "value": null,
      "type": "QV",
      "created_at": "2025-11-22T15:22:00Z",
      "updated_at": "2025-11-22T15:22:00Z",
      "project": 1,
      "question": 5
    }
  ]
  ```
- **Variable Types:**
  - `QV`: Question Variable (auto-created)
  - `SV`: Survey Variable (project-level)
  - `PV`: Profile Variable (user-specific)
  - `CV`: Custom Variable
- **Notes:**
  - Variables are automatically created via Django signals when questions are created
  - Variable name matches question's `variable_name` field
  - OneToOne relationship with Question

---

### 1.2 Get Variable

**Get specific variable by ID.**

- **Endpoint:** `GET /api/variables/{id}/`
- **Authentication:** Required (Bearer Token)
- **Response (200 OK):**
  ```json
  {
    "id": 1,
    "name": "satisfaction",
    "value": null,
    "type": "QV",
    "created_at": "2025-11-22T15:22:00Z",
    "updated_at": "2025-11-22T15:22:00Z",
    "project": 1,
    "question": 5
  }
  ```

---

### 1.3 Create Variable (Manual)

**Manually create a variable (usually auto-created).**

- **Endpoint:** `POST /api/variables/`
- **Authentication:** Required (Bearer Token)
- **Request Body:**
  ```json
  {
    "name": "custom_var",
    "value": "initial_value",
    "type": "CV",
    "project": 1
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "id": 2,
    "name": "custom_var",
    "value": "initial_value",
    "type": "CV",
    "project": 1,
    "question": null
  }
  ```
- **Notes:**
  - Question Variables (QV) are auto-created, manual creation is for other types
  - Use for Survey Variables (SV), Profile Variables (PV), Custom Variables (CV)

---

### 1.4 Update Variable

**Update variable value or details.**

- **Endpoint:** `PATCH /api/variables/{id}/`
- **Authentication:** Required (Bearer Token)
- **Request Body:**
  ```json
  {
    "value": "updated_value"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "id": 2,
    "name": "custom_var",
    "value": "updated_value",
    "type": "CV",
    "project": 1
  }
  ```

---

### 1.5 Delete Variable

**Delete a variable.**

- **Endpoint:** `DELETE /api/variables/{id}/`
- **Authentication:** Required (Bearer Token)
- **Response (204 No Content)**
- **Notes:**
  - Cannot delete Question Variables (QV) - they're managed by signals
  - Deleting a question automatically deletes its variable

---

## 2. Logic Nodes

### 2.1 List Logic Nodes

**Get all logic rules.**

- **Endpoint:** `GET /api/logic-nodes/`
- **Authentication:** Required (Bearer Token)
- **Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "conditions": [
        {
          "id": 1,
          "operator": "EQ",
          "value": "Yes",
          "comparison_type": "CONSTANT",
          "logic_operator": "AND",
          "source_question": 5,
          "target_question": null
        }
      ],
      "action_type": "SKIP_TO",
      "priority": 1,
      "question": 5,
      "target_question": 7,
      "target_group": null
    }
  ]
  ```
- **Action Types:**
  - `SKIP_TO`: Jump to specific question
  - `DISPLAY_IF`: Show question conditionally
  - `END_SURVEY`: Terminate survey
  - `MASK_OPTIONS`: Hide specific options

---

### 2.2 Create Logic Node

**Create a new logic rule.**

- **Endpoint:** `POST /api/logic-nodes/`
- **Authentication:** Required (Bearer Token)
- **Request Body:**
  ```json
  {
    "question": 5,
    "action_type": "SKIP_TO",
    "target_question": 7,
    "priority": 1
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "id": 1,
    "conditions": [],
    "action_type": "SKIP_TO",
    "priority": 1,
    "created_at": "2025-11-22T15:22:00Z",
    "updated_at": "2025-11-22T15:22:00Z",
    "question": 5,
    "target_question": 7,
    "target_group": null
  }
  ```
- **Validation:**
  - `target_question` must belong to the same project as source question
  - `priority` determines evaluation order (lower = higher priority)
- **Linked APIs:** After creating → **Create Condition** (`POST /api/conditions/`)

---

### 2.3 Get Logic Node

**Get specific logic node by ID.**

- **Endpoint:** `GET /api/logic-nodes/{id}/`
- **Authentication:** Required (Bearer Token)
- **Response (200 OK):**
  ```json
  {
    "id": 1,
    "conditions": [
      {
        "id": 1,
        "operator": "EQ",
        "value": "Yes",
        "comparison_type": "CONSTANT",
        "logic_operator": "AND"
      }
    ],
    "action_type": "SKIP_TO",
    "priority": 1,
    "question": 5,
    "target_question": 7
  }
  ```

---

### 2.4 Update Logic Node

**Update logic node details.**

- **Endpoint:** `PUT /api/logic-nodes/{id}/` or `PATCH /api/logic-nodes/{id}/`
- **Authentication:** Required (Bearer Token)
- **Request Body (Partial Update):**
  ```json
  {
    "priority": 2,
    "target_question": 8
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "id": 1,
    "conditions": [...],
    "action_type": "SKIP_TO",
    "priority": 2,
    "question": 5,
    "target_question": 8
  }
  ```
- **Notes:**
  - Use `PATCH` for partial updates
  - Use `PUT` for full replacement

---

### 2.5 Delete Logic Node

**Delete a logic node.**

- **Endpoint:** `DELETE /api/logic-nodes/{id}/`
- **Authentication:** Required (Bearer Token)
- **Response (204 No Content)**
- **Notes:**
  - Cascades to delete all associated conditions
  - Cannot be undone

---

## 3. Conditions

### 3.1 List Conditions

**Get all conditions.**

- **Endpoint:** `GET /api/conditions/`
- **Authentication:** Required (Bearer Token)
- **Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "operator": "EQ",
      "value": "Satisfied",
      "comparison_type": "CONSTANT",
      "logic_operator": "AND",
      "logic_node": 1,
      "source_question": 5,
      "target_question": null
    }
  ]
  ```

---

### 3.2 Create Condition

**Add a condition to a logic node.**

- **Endpoint:** `POST /api/conditions/`
- **Authentication:** Required (Bearer Token)
- **Request Body:**
  ```json
  {
    "logic_node": 1,
    "source_question": 5,
    "operator": "EQ",
    "value": "Satisfied",
    "comparison_type": "CONSTANT",
    "logic_operator": "AND"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "id": 1,
    "operator": "EQ",
    "value": "Satisfied",
    "comparison_type": "CONSTANT",
    "logic_operator": "AND",
    "created_at": "2025-11-22T15:22:00Z",
    "updated_at": "2025-11-22T15:22:00Z",
    "logic_node": 1,
    "source_question": 5,
    "target_question": null
  }
  ```
- **Operators:**
  - `EQ`: Equals
  - `NEQ`: Not Equals
  - `GT`: Greater Than
  - `LT`: Less Than
  - `GTE`: Greater Than or Equal
  - `LTE`: Less Than or Equal
  - `CONTAINS`: Contains substring
  - `SELECTED`: Option selected (multi-choice)
  - `NOT_SELECTED`: Option not selected
- **Comparison Types:**
  - `CONSTANT`: Compare against fixed value
  - `VARIABLE`: Compare against another question's answer
- **Logic Operators:**
  - `AND`: All conditions must be true
  - `OR`: At least one condition must be true

---

### 3.3 Get Condition

**Get specific condition by ID.**

- **Endpoint:** `GET /api/conditions/{id}/`
- **Authentication:** Required (Bearer Token)
- **Response (200 OK):**
  ```json
  {
    "id": 1,
    "operator": "EQ",
    "value": "Satisfied",
    "comparison_type": "CONSTANT",
    "logic_operator": "AND",
    "logic_node": 1,
    "source_question": 5,
    "target_question": null
  }
  ```

---

### 3.4 Update Condition

**Update condition details.**

- **Endpoint:** `PUT /api/conditions/{id}/` or `PATCH /api/conditions/{id}/`
- **Authentication:** Required (Bearer Token)
- **Request Body (Partial Update):**
  ```json
  {
    "operator": "NEQ",
    "value": "Not Satisfied"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "id": 1,
    "operator": "NEQ",
    "value": "Not Satisfied",
    "comparison_type": "CONSTANT",
    "logic_operator": "AND",
    "logic_node": 1,
    "source_question": 5
  }
  ```

---

### 3.5 Delete Condition

**Delete a condition.**

- **Endpoint:** `DELETE /api/conditions/{id}/`
- **Authentication:** Required (Bearer Token)
- **Response (204 No Content)**
- **Notes:**
  - Removes condition from logic node
  - If all conditions removed, logic node always evaluates to true

---

## 4. Survey Logic Engine

### 4.1 Calculate Next Question ⭐ KEY FEATURE

**Determine the next question based on current answer and logic rules.**

- **Endpoint:** `POST /api/next-question/`
- **Authentication:** Required (Bearer Token)
- **Request Body:**
  ```json
  {
    "question_id": 5,
    "answer_data": {
      "value": "Satisfied"
    }
  }
  ```
- **Response (200 OK - Logic Matched):**
  ```json
  {
    "next_question_id": 7,
    "action": "CONTINUE",
    "next_question": {
      "id": 7,
      "title": "Rate us from 1-5",
      "question_type": "RAT"
    }
  }
  ```
- **Response (200 OK - No Logic, Sequential):**
  ```json
  {
    "next_question_id": 6,
    "action": "CONTINUE",
    "next_question": {
      "id": 6,
      "title": "Please provide feedback",
      "question_type": "TXTL"
    }
  }
  ```
- **Response (200 OK - End Survey):**
  ```json
  {
    "next_question_id": null,
    "action": "END_SURVEY"
  }
  ```
- **Answer Data Format:**
  - Single value: `{"value": "Yes"}`
  - Multiple choice: `{"options": ["Option1", "Option2"]}`
  - Numeric: `{"value": "5"}`
- **Logic Evaluation:**
  1. Fetches all logic nodes for current question (ordered by priority)
  2. Evaluates conditions for each node
  3. Executes action of first matching node
  4. Falls back to next question by `display_index` if no match
- **Linked APIs:**
  - Before calling → **Submit Answer** (`POST /api/answers/`)
  - Use result → Display next question to user

---

## 5. Project Filters & Audience

### 5.1 List Project Filters

**Get audience targeting filters for projects.**

- **Endpoint:** `GET /api/filters/`
- **Authentication:** Required (Bearer Token)
- **Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "project": 1,
      "variable": 3,
      "options": []
    }
  ]
  ```
- **Notes:**
  - Used to target specific audience segments
  - Links projects to variables for filtering

---

### 5.2 List Audience Details

**Get project participation details.**

- **Endpoint:** `GET /api/audience-details/`
- **Authentication:** Required (Bearer Token)
- **Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "project": 1,
      "profile": 5,
      "status": "Started",
      "next_question": 6
    }
  ]
  ```
- **Status Values:**
  - `Pending`: Not started
  - `Started`: In progress
  - `Completed`: Finished
- **Notes:**
  - Tracks user progress through surveys
  - `next_question` updated by logic engine

---

## Postman Collection

Import `QuantAi_Complete_API.postman_collection.json` for ready-to-use API requests.

**Environment Variables to Set:**
- `base_url`: `http://localhost:8000`
- `client_id`: Your OAuth2 Client ID
- `client_secret`: Your OAuth2 Client Secret
- `access_token`: Auto-populated after login
- `test_email`: Your test email
- `test_password`: Your test password

---

## Support

For questions or issues:
- Check logs: Server console output
- Django admin: `http://localhost:8000/admin/`
- Database: `db.sqlite3` (use DB Browser for SQLite)

---

**Last Updated:** November 2025
**API Version:** 1.0