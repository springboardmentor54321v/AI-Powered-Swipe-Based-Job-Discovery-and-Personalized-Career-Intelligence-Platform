# SwipeX — Milestone 1 (Backend & Identity Management)
## Day 7 Final Integration & Architecture Summary

**Team**: Team 3  
**Domain**: Domain 1 — Team Lead / Backend & Identity Management (Intern 1)  
**Framework**: Python + Django 6.1 + Django REST Framework (DRF) + PostgreSQL  
**Gateway URL**: `http://127.0.0.1:8000`  
**Status**: **FROZEN & READY FOR TEAM DEMO**

---

### 1. Project Overview
SwipeX is an intelligent, swipe-based job discovery and personalized career intelligence platform. The backend provides a unified, secure, high-throughput Django API Gateway that serves as the single entry point for client applications. The Gateway coordinates authentication, user role management, job querying, swipe ingestion, resume multipart upload, heuristic ATS scoring, and skill-based career recommendations.

---

### 2. Backend Architecture
The backend follows a decoupled microservice gateway architecture:

```text
               ┌────────────────────────────────────────────────────────┐
               │              Frontend / Client Applications            │
               └───────────────────────────┬────────────────────────────┘
                                           │
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │           Django API Gateway (Port :8000)              │
               │  • JWT Authentication & PBKDF2 Password Hashing        │
               │  • Role-Based Access Control (RBAC) Enforcement        │
               │  • Untrusted Header Sanitization (Anti-Spoofing)       │
               │  • Downstream Routing & Fault Tolerance (503/504)      │
               │  • Interactive Swagger / OpenAPI 3.0 Documentation     │
               └───────────┬─────────────────────────┬──────────────────┘
                           │                         │
            ┌──────────────┴──────────────┐   ┌──────┴──────────────────────────┐
            ▼                             ▼   ▼                                 ▼
┌───────────────────────────┐ ┌───────────────────────────┐ ┌───────────────────────────┐
│       Auth Service        │ │   Job & Swipe Service     │ │    Resume & ATS Service   │
│   (Internal Django/DRF)   │ │  (Intern 2 - Port :8001)  │ │  (Intern 3 - Port :8002)  │
│ • User Registration       │ │ • Job Listings & Search   │ │ • Multipart PDF Parsing   │
│ • Credential Login        │ │ • Salary/Skill Filtering  │ │ • Heuristic ATS Scoring   │
│ • JWT Refresh Rotation    │ │ • Job Detail Inspection   │ │ • Skill Recommendations   │
│ • Current User Profile    │ │ • Candidate Swipe Logging │ │ • Missing Keyword Analysis│
└───────────────────────────┘ └───────────────────────────┘ └───────────────────────────┘
```

---

### 3. Services and Ports
| Service | Domain | Framework / Engine | Port | Environment Variable |
| :--- | :--- | :--- | :--- | :--- |
| **API Gateway & Auth** | Domain 1 (Intern 1) | Django 6.1 + DRF | **8000** | Direct Django |
| **Job & Swipe Service** | Domain 2 (Intern 2) | Microservice Runner | **8001** | `JOB_SERVICE_URL=http://127.0.0.1:8001` |
| **Resume & ATS Service**| Domain 3 (Intern 3) | FastAPI + pdfplumber | **8002** | `RESUME_SERVICE_URL=http://127.0.0.1:8002` |

---

### 4. Authentication & JWT Engine
- **Password Security**: Passwords hashed using PBKDF2 with SHA-256 and salted.
- **JWT Cryptography**: HMAC-SHA256 tokens (`access_token` with 30-min lifespan, `refresh_token` with 7-day lifespan).
- **Refresh Token Rotation**: `POST /api/v1/auth/refresh` issues newly minted access tokens without requiring re-login.
- **Identity Header Propagation**: Upon validating JWT, the Gateway injects trusted context headers (`X-User-Id`, `X-User-Role`, `X-User-Email`) to downstream microservices and explicitly strips untrusted client-supplied identity headers.

---

### 5. Role-Based Access Control (RBAC) Matrix
The platform enforces 3 explicit roles (`JOB_SEEKER`, `RECRUITER`, `ADMIN`):

| Endpoint | Method | Allowed Roles | Forbidden Roles | Behavior |
| :--- | :--- | :--- | :--- | :--- |
| `/api/v1/auth/register` | `POST` | Public | None | Self-registration limited to `JOB_SEEKER` and `RECRUITER`. |
| `/api/v1/auth/login` | `POST` | Public | None | Issues JWT token pair and user role claim. |
| `/api/v1/auth/me` | `GET` | Authenticated | Unauthenticated | Returns authenticated user ID, name, and role. |
| `/api/v1/jobs` | `GET` | Public | None | Forwards query filters to Job Service. |
| `/api/v1/jobs/{id}` | `GET` | Public | None | Forwards job detail lookup to Job Service. |
| `/api/v1/swipes` | `POST` | `JOB_SEEKER` | `RECRUITER`, `ADMIN` | 403 Forbidden for Recruiter/Admin. |
| `/api/v1/swipes/history` | `GET` | `JOB_SEEKER` | `RECRUITER`, `ADMIN` | 403 Forbidden for Recruiter/Admin. |
| `/api/v1/resume/upload` | `POST` | `JOB_SEEKER` | `RECRUITER`, `ADMIN` | 403 Forbidden for Recruiter/Admin. |
| `/api/v1/resume/{id}/ats-score` | `GET` | `JOB_SEEKER`, `RECRUITER` | `ADMIN` | Allows recruiters to evaluate candidate match scores. |
| `/api/v1/recommendations` | `GET` | `JOB_SEEKER` | `RECRUITER`, `ADMIN` | Returns top 5 matching jobs from dataset. |

---

### 6. Summary of Core APIs
1. **`POST /api/v1/auth/register`**: Creates new user with hashed password.
2. **`POST /api/v1/auth/login`**: Authenticates credentials, returns `access_token`, `refresh_token`, and `role`.
3. **`GET /api/v1/auth/me`**: Returns `user_id`, `name`, `role` for authenticated user.
4. **`POST /api/v1/auth/refresh`**: Exchanges refresh token for new access token.
5. **`GET /api/v1/jobs`**: Lists job postings; supports `location`, `remote`, `salary_min`, `salary_max`, `skills`.
6. **`GET /api/v1/jobs/{job_id}`**: Retrieves single job posting details.
7. **`POST /api/v1/swipes`**: Records candidate swipe (`job_id`, `direction`) with verified identity context.
8. **`GET /api/v1/swipes/history`**: Retrieves history of candidate swipes.
9. **`POST /api/v1/resume/upload`**: Forwards multipart PDF resume to Intern 3; returns `resume_id` and `parsed_skills`.
10. **`GET /api/v1/resume/{resume_id}/ats-score?job_id={job_id}`**: Calculates ATS match percentage and missing keywords.
11. **`GET /api/v1/recommendations?resume_id={resume_id}`**: Returns top 5 recommended jobs matching extracted skills.

---

### 7. API Gateway Responsibilities & Error Handling
- **Reverse Proxying**: Forwards HTTP methods, queries, multipart payloads, and JSON bodies.
- **Header Sanitization**: Strips client-sent `X-User-Id`, `X-User-Role`, and `X-User-Email` to prevent header spoofing.
- **Fault Tolerance**:
  - `503 Service Unavailable`: Returned cleanly when a downstream microservice is offline or unreachable.
  - `504 Gateway Timeout`: Returned cleanly if a downstream request exceeds the configured timeout window.
  - `401 / 403`: Handled at Gateway layer prior to forwarding to protect downstream infrastructure.

---

### 8. Interactive Documentation (Swagger / OpenAPI 3.0)
- **Interactive Swagger UI**:
  - `http://127.0.0.1:8000/swagger/`
  - `http://127.0.0.1:8000/api/docs/`
- **OpenAPI 3.0 Schema**:
  - `http://127.0.0.1:8000/api/schema/`
- **Thunder Client / Postman Collection**:
  - `docs/api/SwipeX_Day5_API_Collection.json`

---

### 9. Test Suite Verification
Command:
```powershell
python manage.py test tests --noinput
```
**Results**:
```text
Ran 35 tests in 101.958s
OK
System check identified no issues (0 silenced).
```
- **13 Auth & RBAC Tests** (`test_auth_day3.py`) — **100% PASS**
- **11 Gateway & RBAC Tests** (`test_gateway_day4.py`) — **100% PASS**
- **11 Resume/ATS Tri-Service Tests** (`test_gateway_day5.py`) — **100% PASS**

---

### 10. Team Demo Execution Steps

Open 3 separate terminals to start the tri-service backend:

```powershell
# Terminal 1: Start Django API Gateway (Port 8000)
cd "R:\new projects\resume-ats\Team-3\Domain-1\backend"
python manage.py runserver 8000

# Terminal 2: Start Intern 2 Job & Swipe Service (Port 8001)
cd "R:\new projects\resume-ats\Team-3\Domain-1\backend"
python services\job_service_runner.py

# Terminal 3: Start Intern 3 Resume & ATS Service (Port 8002)
cd "R:\new projects\resume-ats\Team-3\Domain-3"
uvicorn resume_service:app --port 8002
```

Open Swagger UI at **`http://127.0.0.1:8000/swagger/`** or test endpoints via Thunder Client.

---

### 11. Code Freeze Declaration
**All backend source code in Domain-1 is hereby FROZEN.**  
No further architectural modifications or refactoring will take place. The backend is stable, tested, documented, and prepared for team demonstration.
