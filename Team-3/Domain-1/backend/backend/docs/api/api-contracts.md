# SwipeX API Contracts & Authentication Implementation

> **Document Status**: Milestone 1 - Day 3 Authentication & RBAC Implementation  
> **Target Version**: `/api/v1/`  
> **Author**: Intern 1 (Backend & Identity Management)  
> **Backend Framework**: Python + Django + Django REST Framework (DRF)

---

## 1. Authentication & Identity Overview (Day 3 Implementation)

SwipeX features a stateless **JSON Web Token (JWT)** authentication and **Role-Based Access Control (RBAC)** architecture backed by PostgreSQL (`users` and `roles` models) and Django REST Framework.

### 1.1 Core Authentication Flow

```text
Registration / Login
        │
        ▼
   Auth Service (Validates credentials, hashes passwords via PBKDF2)
        │
        ▼
   Issue Token Pair:
     • Access Token (JWT: sub=user_id, role, name, email, exp=30 min)
     • Refresh Token (JWT: sub=user_id, type=refresh, exp=7 days)
        │
        ▼
   Frontend stores tokens
        │
        ▼
   Protected API Request:
   Header: Authorization: Bearer <access_token>
        │
        ▼
   JWTAuthentication Middleware (Decodes token, verifies signature & expiry, loads request.user)
        │
        ▼
   RBAC Permission Classes (IsJobSeeker, IsRecruiter, IsAdmin, HasRole)
        │
   ┌────┴────┐
   ▼         ▼
 Allow     Deny (403 Forbidden)
```

---

### 1.2 Access Token vs. Refresh Token

| Property | Access Token | Refresh Token |
| :--- | :--- | :--- |
| **Purpose** | Authorize requests on protected API endpoints | Request a newly minted access token upon expiry |
| **Lifetime** | 30 minutes | 7 days |
| **Header Format** | `Authorization: Bearer <access_token>` | Body payload: `{"refresh_token": "..."}` |
| **Target Route** | All protected APIs (`/me`, `/jobs`, `/swipes`, etc.) | `POST /api/v1/auth/refresh` |
| **Security Principle** | Ephemeral, short-lived | Revocable, isolated from general API requests |

---

### 1.3 JWT Payload & Claims

```json
{
  "sub": "123",
  "role": "job_seeker",
  "name": "Sai",
  "email": "sai@example.com",
  "type": "access",
  "iat": 1788100000,
  "exp": 1788101800
}
```

- **`sub`**: User identifier (`users.id`).
- **`role`**: Active role formatted in lowercase (`job_seeker`, `recruiter`, `admin`) for immediate client-side and permission-level evaluation.
- **`type`**: Token type (`access` vs `refresh`), strictly preventing refresh tokens from being accepted as access tokens.
- **`exp`**: Expiration timestamp enforced cryptographically on every request.

---

### 1.4 Google OAuth2 Flow

```text
User
  │
  ▼
1. Click "Sign in with Google" on Frontend
  │
  ▼
2. GET /api/v1/auth/oauth/google
   (If configured: Redirects to Google Consent Screen)
   (If local dev: Returns configuration status & parameters)
  │
  ▼
3. Google authenticates user and redirects with authorization code:
   GET /api/v1/auth/oauth/google/callback?code=AUTH_CODE
  │
  ▼
4. Auth Service exchanges code for user profile (email, name, Google sub ID)
  │
  ▼
5. User Lookup / Auto-provisioning:
   • Existing user found ──► Log in
   • New user created ─────► Assigns safest default role (JOB_SEEKER),
                             unusable local password, oauth_provider='google'
  │
  ▼
6. Return SwipeX access_token & refresh_token to client
```

> [!IMPORTANT]
> **Role Assignment for Google Users**: Unprompted Google sign-in defaults to **`JOB_SEEKER`**. Public self-registration for `ADMIN` is strictly forbidden to prevent privilege escalation.

---

## 2. Implemented Auth Service Endpoints (`/api/v1/auth`)

### 2.1 Register User
- **Endpoint**: `POST /api/v1/auth/register`
- **Description**: Creates a new user account with hashed password and assigned role.
- **Request Body**:
  ```json
  {
    "name": "Sai",
    "email": "sai@example.com",
    "password": "SecurePassword123!",
    "role": "job_seeker"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "user_id": "123"
  }
  ```
- **Validation**:
  - Validates email format and rejects duplicate emails (`HTTP 400`).
  - Enforces password length (minimum 6 characters).
  - Validates role exists; blocks self-registering as `admin`.

---

### 2.2 User Login
- **Endpoint**: `POST /api/v1/auth/login`
- **Description**: Authenticates email and password, returning tokens and role.
- **Request Body**:
  ```json
  {
    "email": "sai@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "refresh_token": "eyJhbGciOi...",
    "role": "job_seeker"
  }
  ```
- **Error Response**: `401 Unauthorized` (`{"error": "Invalid email or password"}`).

---

### 2.3 Refresh Token
- **Endpoint**: `POST /api/v1/auth/refresh`
- **Description**: Issues a new access token using a valid, non-expired refresh token.
- **Request Body**:
  ```json
  {
    "refresh_token": "eyJhbGciOi..."
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "access_token": "eyJhbGciOi..."
  }
  ```

---

### 2.4 Current User Profile ("Who Am I")
- **Endpoint**: `GET /api/v1/auth/me`
- **Header**: `Authorization: Bearer <access_token>`
- **Description**: Returns authenticated user profile information.
- **Response**: `200 OK`
  ```json
  {
    "user_id": "123",
    "name": "Sai",
    "role": "job_seeker"
  }
  ```

---

### 2.5 Google OAuth2
- **Entry**: `GET /api/v1/auth/oauth/google`
- **Callback**: `GET /api/v1/auth/oauth/google/callback?code=...`
- **Description**: Initiates and completes external Google OAuth2 authentication.

---

## 3. Role-Based Access Control (RBAC) Mechanism

### 3.1 Permission Classes (`apps/auth_service/permissions.py`)

- **`IsAuthenticated`**: Verifies user is authenticated via valid JWT.
- **`IsJobSeeker`**: Restricts view access strictly to candidates (`role == JOB_SEEKER`).
- **`IsRecruiter`**: Restricts view access strictly to recruiters (`role == RECRUITER`).
- **`IsAdmin`**: Restricts view access strictly to platform administrators (`role == ADMIN`).
- **`HasRole`**: Flexible permission class parameterized with a list of allowed roles.

### 3.2 RBAC Protected Demonstration Endpoints

| Endpoint | Method | Allowed Role | Non-Allowed Response |
| :--- | :--- | :--- | :--- |
| `/api/v1/auth/test/job-seeker-only` | `GET` | `JOB_SEEKER` | `403 Forbidden` |
| `/api/v1/auth/test/recruiter-only` | `GET` | `RECRUITER` | `403 Forbidden` |
| `/api/v1/auth/test/admin-only` | `GET` | `ADMIN` | `403 Forbidden` |

---

## 4. Manual Postman / Thunder Client Test Sequence

Follow this step-by-step test plan to test all Day 3 APIs manually:

### Step 1: Register Candidate
* **POST** `http://127.0.0.1:8000/api/v1/auth/register`
* **Body (JSON)**:
  ```json
  {
    "name": "Sai",
    "email": "sai@example.com",
    "password": "Password123!",
    "role": "job_seeker"
  }
  ```
* **Expected**: `201 Created` with `{"user_id": "..."}`.

### Step 2: Login Candidate
* **POST** `http://127.0.0.1:8000/api/v1/auth/login`
* **Body (JSON)**:
  ```json
  {
    "email": "sai@example.com",
    "password": "Password123!"
  }
  ```
* **Expected**: `200 OK` with `access_token`, `refresh_token`, and `"role": "job_seeker"`.
* **Action**: Copy the `access_token` and `refresh_token`.

### Step 3: Check Current User Profile ("Who Am I")
* **GET** `http://127.0.0.1:8000/api/v1/auth/me`
* **Headers**: `Authorization: Bearer <access_token>`
* **Expected**: `200 OK` with:
  ```json
  {
    "user_id": "...",
    "name": "Sai",
    "role": "job_seeker"
  }
  ```

### Step 4: Refresh Access Token
* **POST** `http://127.0.0.1:8000/api/v1/auth/refresh`
* **Body (JSON)**:
  ```json
  {
    "refresh_token": "<refresh_token>"
  }
  ```
* **Expected**: `200 OK` with new `{"access_token": "..."}`.

### Step 5: Test RBAC (Allowed)
* **GET** `http://127.0.0.1:8000/api/v1/auth/test/job-seeker-only`
* **Headers**: `Authorization: Bearer <access_token>`
* **Expected**: `200 OK` (`"Access granted: Candidate verified."`).

### Step 6: Test RBAC (Denied)
* **GET** `http://127.0.0.1:8000/api/v1/auth/test/recruiter-only`
* **Headers**: `Authorization: Bearer <access_token>`
* **Expected**: `403 Forbidden` (`"Permission denied: Requires RECRUITER role."`).

### Step 7: Test Google OAuth Endpoint
* **GET** `http://127.0.0.1:8000/api/v1/auth/oauth/google`
* **Expected**: `200 OK` (returns configuration parameters when local credentials are placeholders, or redirects to Google when configured).

---

## 5. API Reference Summary Table (Milestone 1 - Day 5)

| Service | Method | Endpoint | Gateway Status | RBAC Protection | Downstream Target |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/register` | **Direct (Django)** | Public | Internal `apps.auth_service` |
| **Auth** | `POST` | `/api/v1/auth/login` | **Direct (Django)** | Public | Internal `apps.auth_service` |
| **Auth** | `GET` | `/api/v1/auth/oauth/google` | **Direct (Django)** | Public | Internal `apps.auth_service` |
| **Auth** | `GET` | `/api/v1/auth/oauth/google/callback` | **Direct (Django)** | Public | Internal `apps.auth_service` |
| **Auth** | `POST` | `/api/v1/auth/refresh` | **Direct (Django)** | Public | Internal `apps.auth_service` |
| **Auth** | `GET` | `/api/v1/auth/me` | **Direct (Django)** | `IsAuthenticated` | Internal `apps.auth_service` |
| **Job** | `GET` | `/api/v1/jobs` | **Gateway Router (Active)** | Public | `{JOB_SERVICE_URL}/api/v1/jobs` |
| **Job** | `GET` | `/api/v1/jobs/{job_id}` | **Gateway Router (Active)** | Public | `{JOB_SERVICE_URL}/api/v1/jobs/{id}` |
| **Swipe** | `POST` | `/api/v1/swipes` | **Gateway Router (Active)** | `IsJobSeeker` | `{JOB_SERVICE_URL}/api/v1/swipes` |
| **Swipe** | `GET` | `/api/v1/swipes/history` | **Gateway Router (Active)** | `IsJobSeeker` | `{JOB_SERVICE_URL}/api/v1/swipes/history` |
| **Resume** | `POST` | `/api/v1/resume/upload` | **Gateway Router (Active)** | `IsJobSeeker` | `{RESUME_SERVICE_URL}/api/v1/resume/upload` (Multipart) |
| **ATS** | `GET` | `/api/v1/resume/{id}/ats-score`| **Gateway Router (Active)** | `IsJobSeekerOrRecruiter` | `{RESUME_SERVICE_URL}/api/v1/resume/{id}/ats-score` |
| **Recs** | `GET` | `/api/v1/recommendations` | **Gateway Router (Active)** | `IsJobSeeker` | `{RESUME_SERVICE_URL}/api/v1/recommendations` |
| **Docs** | `GET` | `/api/docs/` | **Active** | Public | Swagger UI Interactive API documentation |
| **Docs** | `GET` | `/api/schema/` | **Active** | Public | OpenAPI 3.0 YAML/JSON Schema |

![alt text](image.png)