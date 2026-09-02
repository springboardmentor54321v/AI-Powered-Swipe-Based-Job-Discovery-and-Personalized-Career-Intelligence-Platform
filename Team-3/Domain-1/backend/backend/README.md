# SwipeX

> **SwipeX: Swipe-Based Intelligent Job Discovery and Career Assistance Platform**  
> Milestone 1 — Foundation & Day 2 Architecture

---

## 1. Project Description

SwipeX is an intuitive, swipe-based job discovery platform designed to simplify career matching for job seekers and recruitment workflows for employers. It pairs an engaging swipe-card interface with automated resume parsing, heuristic ATS compatibility scoring, and smart career recommendations.

---

## 2. Milestone 1 Architecture

Milestone 1 adopts a decoupled, microservice-ready backend architecture:

```text
Frontend  ──►  API Gateway / Django Root Router  ──►  [ Auth Service | Job/Swipe Service | Resume/ATS Service ]  ──►  PostgreSQL / Redis
```

- **Backend Framework**: **Python + Django + Django REST Framework (DRF)**
- **Database**: PostgreSQL (managed via Django ORM & migrations)
- **Cache & Infrastructure**: Redis (in-memory store for caching & sessions)
- **API Style & Versioning**: REST APIs with `/api/v1/` prefix
- **Entry Point**: The Django backend router serves as the central API Gateway / entry point for clients.

---

## 3. Repository Structure

```text
SwipeX/
├── manage.py                           # Django administrative CLI
├── requirements.txt                    # Project dependencies (Django, DRF, psycopg, etc.)
├── .env.example                        # Environment variables template
├── .gitignore                          # Environment and build ignore rules
├── config/                             # Django root project configuration
│   ├── __init__.py
│   ├── settings.py                     # PostgreSQL, DRF, CORS, & Redis settings
│   ├── urls.py                         # Root URLconf mounting /health and /api/v1/*
│   ├── asgi.py                         # ASGI interface
│   └── wsgi.py                         # WSGI interface
├── apps/                               # Django applications
│   ├── users/                          # User identity, custom user model, roles, migrations
│   ├── auth_service/                   # Auth & identity service routing (/api/v1/auth/*)
│   ├── job_service/                    # Job listings & swipes routing (/api/v1/jobs/*, /api/v1/swipes/*)
│   └── resume_service/                 # Resume & ATS routing (/api/v1/resume/*, /api/v1/recommendations/*)
├── docs/
│   ├── architecture/
│   │   ├── architecture.md             # System architecture & service boundaries
│   │   └── database-design.md          # Users & Roles schema (1-to-many relationship)
│   └── api/
│       └── api-contracts.md            # REST API contracts, JWT design, & OAuth flow
├── gateway/                            # API Gateway service directory
├── services/
│   ├── auth-service/                   # Dedicated auth-service workspace
│   ├── job-service/                    # Dedicated job-service workspace
│   └── resume-service/                 # Dedicated resume-service workspace
├── tests/                              # Integration & test suite directory
├── docker/                             # Containerization configurations (future milestone)
└── verify_env.py                       # Local PostgreSQL & Redis connectivity verification script
```

---

## 4. Documentation Links

- **System Architecture**: [docs/architecture/architecture.md](docs/architecture/architecture.md)
- **Database Design**: [docs/architecture/database-design.md](docs/architecture/database-design.md)
- **API Contracts & Auth Design**: [docs/api/api-contracts.md](docs/api/api-contracts.md)

---

## 5. Team Ownership

| Role | Responsibility |
| :--- | :--- |
| **Intern 1** | **Backend & Identity Management** (Architecture setup, Django/DRF foundation, Auth Service, Gateway contracts, JWT design) |
| **Intern 2** | **Job & Data Intelligence** (Job listings, search/filters, swipe ingestion, database schema) |
| **Intern 3** | **AI/ML Career Intelligence** (Resume upload, parsing, heuristic ATS scoring & recommendations) |
| **Intern 4** | **Frontend & UX** (Web/Mobile UI, swipe interactions, user dashboards) |
| **Intern 5** | **Platform/Testing** (Integration tests, CI/CD pipeline, performance validation) |

---

## 6. Milestone 1 - Day 3 & Day 4 Summary

### Day 3 (Authentication & Identity System):
- **Registration (`POST /api/v1/auth/register`)**: Account creation with validation, email uniqueness enforcement, and PBKDF2 password hashing.
- **Login (`POST /api/v1/auth/login`)**: User credential authentication returning JWT access token, refresh token, and user role.
- **Refresh Token (`POST /api/v1/auth/refresh`)**: Cryptographic refresh token rotation issuing new access tokens.
- **Current User / "Who Am I" (`GET /api/v1/auth/me`)**: JWT-authenticated profile inspection returning `user_id`, `name`, and `role`.
- **Google OAuth2 (`GET /api/v1/auth/oauth/google`, `/callback`)**: External identity provider flow with safe auto-provisioning to `JOB_SEEKER`.
- **RBAC Engine**: Custom DRF permission classes (`IsJobSeeker`, `IsRecruiter`, `IsAdmin`, `HasRole`) and JWT authentication middleware (`JWTAuthentication`).

### Day 4 (API Gateway & RBAC Route Enforcement):
- **RBAC Enforced on Protected Routes**:
  - `POST /api/v1/swipes`: strictly guarded by `IsJobSeeker` (rejects unauthenticated with 401, wrong roles like Recruiter/Admin with 403).
  - `GET /api/v1/swipes/history`: strictly guarded by `IsJobSeeker`.
  - `POST /api/v1/resume/upload`: guarded by `IsJobSeeker`.
  - `GET /api/v1/resume/{id}/ats-score`: guarded by `IsJobSeekerOrRecruiter`.
- **Gateway Routes to Intern 2 Job/Swipe Service**:
  - `GET /api/v1/jobs` (forwards query parameters e.g. location, remote, salary_min, skills to `JOB_SERVICE_URL`).
  - `GET /api/v1/jobs/{job_id}` (forwards job detail requests).
  - `POST /api/v1/swipes` (forwards swipe body with user context headers).
  - `GET /api/v1/swipes/history` (forwards swipe history requests).
- **Gateway Placeholders for Intern 3 Resume/ATS Service**:
  - Routes prepared for `POST /api/v1/resume/upload`, `GET /api/v1/resume/{id}/ats-score`, and `GET /api/v1/recommendations` pointing to `RESUME_SERVICE_URL`.
- **Downstream Fault Tolerance**: Returns clean `503 Service Unavailable` or `504 Gateway Timeout` when downstream services are offline, preventing raw traceback leakage.
- **Automated Test Suite**: 24 tests passing with 100% success (`python manage.py test tests`).

### Day 5 (Resume/ATS Gateway Integration & Tri-Service Orchestration):
- **Full Tri-Service Integration Online**:
  - **Auth & Identity**: Handled natively in Django/DRF (`apps.auth_service`).
  - **Job & Swipe Service**: Forwarded to Intern 2 (`JOB_SERVICE_URL=http://127.0.0.1:8001`).
  - **Resume & ATS Service**: Forwarded to Intern 3 (`RESUME_SERVICE_URL=http://127.0.0.1:8002`).
- **Multipart/Form-Data PDF Forwarding**:
  - `POST /api/v1/resume/upload` accepts raw PDF uploads, preserves binary data, boundaries, and passes to Intern 3 FastAPI backend (`pdfplumber`).
  - Returns `resume_id` and `parsed_skills`.
- **ATS Match Score & Recommendations**:
  - `GET /api/v1/resume/{id}/ats-score?job_id={id}` returns match score and missing keywords.
  - `GET /api/v1/recommendations?resume_id={id}` returns top 5 matching jobs from dataset.
- **RBAC Matrix Enforced Across Services**:
  - `JOB_SEEKER`: allowed to upload resume, view recommendations, swipe jobs.
  - `RECRUITER`: allowed to view candidate ATS match scores, blocked (403) from candidate uploads/swipes.
  - Public: browsing jobs, login, register, documentation.
- **Automated Test Suite**: **35 out of 35 tests passing with 100% success** (`python manage.py test tests`).

### Day 6 (Full Backend Integration, QA Fixes & Swagger Documentation):
- **Full Backend Integration**:
  - Tri-service Gateway architecture (:8000 Gateway -> :8001 Job/Swipe -> :8002 Resume/ATS) verified operational.
  - Security hardening: sanitized untrusted client identity headers (`X-User-Id`, `X-User-Role`, `X-User-Email`) to prevent client spoofing.
  - Dual payload parsing: `GatewayResumeUploadView` supports both `multipart/form-data` and `application/json` without media type conflicts.
- **Interactive OpenAPI 3.0 & Swagger UI**:
  - Available at **`http://127.0.0.1:8000/swagger/`** and **`http://127.0.0.1:8000/api/docs/`**.
  - Raw schema at **`http://127.0.0.1:8000/api/schema/`**.
  - Fully documented endpoints for Auth, Jobs, Swipes, Resume Upload, ATS scoring, and Recommendations with parameters, request bodies, roles, and response codes.
  - Interactive Bearer JWT authorization button enabled.
- **Automated Test Suite**: **35 out of 35 tests passing with 100% success** (`python manage.py test tests`).

### Day 7 (Final Integration, Stabilization, Backend Freeze & Demo Readiness):
- **Final Integration Verification**:
  - Tri-service Gateway architecture (:8000 Gateway, :8001 Job/Swipe, :8002 Resume/ATS) end-to-end verified.
  - Zero critical issues reported by `python manage.py check`.
  - 100% automated test pass rate (**35 out of 35 tests**).
- **Final Architecture Summary Document**:
  - Detailed summary published at [DAY7_FINAL_SUMMARY.md](file:///r:/new%20projects/resume-ats/Team-3/Domain-1/backend/DAY7_FINAL_SUMMARY.md).
- **Backend Code Freeze**:
  - Milestone 1 backend code is stabilized and officially frozen for team demo.

> **Day 7 completed**: Backend is stabilized, verified, documented, frozen, and ready for team demo.

---

## 7. Milestone 1 Scope Boundary

- **Day 1–7 Focus**: Architecture, database schema, Django skeleton, real authentication, RBAC permission enforcement, Gateway routing integration across Auth, Job, Swipe, and Resume/ATS services, security hardening, and OpenAPI documentation.
- **Deployment**: Production cloud deployment, Kubernetes, and advanced deep learning models are strictly out of scope for Milestone 1.
