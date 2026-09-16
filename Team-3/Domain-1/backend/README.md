# SwipeX

> **SwipeX: Swipe-Based Intelligent Job Discovery and Career Assistance Platform**  
> Milestone 1 — Foundation & Day 2 Architecture
> Milestone 2 — Backend & Identity Management (Intern 2)

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
│   ├── settings.py                     # PostgreSQL, DRF, CORS, & Redis settings
│   ├── urls.py                         # Root URLconf mounting /health and /api/v1/*
├── apps/                               # Django applications
│   ├── users/                          # User identity, custom user model, roles, migrations
│   ├── auth_service/                   # Auth & identity service routing (/api/v1/auth/*)
│   ├── job_service/                    # Job listings & swipes routing (/api/v1/jobs/*, /api/v1/swipes/*)
│   └── resume_service/                 # Resume & ATS routing (/api/v1/resume/*, /api/v1/recommendations/*)
├── docs/                               # Documentation, Postman/Thunder Client collections
├── gateway/                            # API Gateway service directory
├── services/                           # Dedicated microservice workspaces / runners
├── tests/                              # Integration & test suite directory
└── docker/                             # Containerization configurations
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
| **Intern 2** | **Backend & Identity Management - M2** (API Gateway integration, Swagger UI, RBAC, M2 features) |
| **Intern 3** | **Job & Data Intelligence** (Job listings, search/filters, swipe ingestion, database schema) |
| **Intern 4** | **AI/ML Career Intelligence** (Resume upload, parsing, heuristic ATS scoring & recommendations) |
| **Intern 5** | **Platform/Testing** (Integration tests, CI/CD pipeline, performance validation) |

---

## 6. Milestone 1 - Day 3 (Authentication & RBAC System)

### Completed:
- **Registration (`POST /api/v1/auth/register`)**: Account creation with validation, email uniqueness enforcement, and PBKDF2 password hashing.
- **Login (`POST /api/v1/auth/login`)**: User credential authentication returning JWT access token, refresh token, and user role.
- **Refresh Token (`POST /api/v1/auth/refresh`)**: Cryptographic refresh token rotation issuing new access tokens.
- **Current User / "Who Am I" (`GET /api/v1/auth/me`)**: JWT-authenticated profile inspection returning `user_id`, `name`, and `role`.
- **Google OAuth2 (`GET /api/v1/auth/oauth/google`, `/callback`)**: External identity provider flow with safe auto-provisioning to `JOB_SEEKER`.
- **RBAC Engine**: Custom DRF permission classes (`IsJobSeeker`, `IsRecruiter`, `IsAdmin`, `HasRole`) and JWT authentication middleware (`JWTAuthentication`).
- **Interactive API Documentation**: Swagger UI at `/api/docs/` and OpenAPI 3.0 schema at `/api/schema/` via `drf-spectacular`.
- **Automated Test Suite**: 13 comprehensive unit/integration test cases passing with 100% success (`python manage.py test tests`).

---

## 7. Milestone 1 Scope Boundary

- **Day 1–3 Focus**: Complete architecture, database schema, Django skeleton, real authentication, and RBAC permission enforcement.
- **Day 4+ (Deferred)**: Job Service, Swipe Service, Resume Parsing, and ATS matching algorithms belong to subsequent milestone days and other team roles.
- **Deployment**: Production deployment is strictly out of scope for Milestone 1.

---

## 8. Milestone 2 Architecture (Gateway Pattern)

The backend uses a **Django API Gateway** pattern. All client requests enter through the Gateway (Port 8000), which authenticates, authorizes, and forwards requests to downstream microservices.

```text
Client / Thunder Client / Swagger UI
              │
              ▼
   ┌──────────────────────────────────────────┐
   │      Django API Gateway (:8000)          │
   │  JWT Auth │ RBAC │ Identity Injection    │
   └──────┬──────────┬──────────────┬─────────┘
          │          │              │
          ▼          ▼              ▼
   ┌──────────┐ ┌──────────┐ ┌──────────────┐
   │Auth Svc  │ │Domain-2  │ │ Domain-3     │
   │(Django)  │ │Job/Swipe │ │ Resume/ATS   │
   │          │ │(:8001)   │ │ Matching     │
   │          │ │          │ │ (:8002)      │
   └──────────┘ └──────────┘ └──────────────┘
```

---

## 9. Milestone 2 API Endpoints (23 Total)

### Public Endpoints (No Authentication)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | System health check |
| GET | `/api/docs/` | Swagger UI |
| GET | `/api/schema/` | OpenAPI 3.0 schema |
| GET | `/api/v1/jobs/` | Paginated job listings with filters |
| GET | `/api/v1/jobs/{id}` | Job detail (freshness, competition) |
| GET | `/api/v1/jobs/search` | Multi-criteria job search |
| GET | `/api/v1/companies/` | Company directory with filters |
| GET | `/api/v1/companies/{id}` | Company profile |

### Protected Endpoints (JWT Required)
| Method | Endpoint | Required Role | Description |
|--------|----------|---------------|-------------|
| POST | `/api/v1/swipes/` | JOB_SEEKER | Record swipe (apply/save/skip) |
| GET | `/api/v1/swipes/history` | JOB_SEEKER | Swipe history |
| POST | `/api/v1/resume/upload` | JOB_SEEKER | Upload PDF resume |
| GET | `/api/v1/resume/{id}/ats-score` | JOB_SEEKER, RECRUITER | ATS match score |
| GET | `/api/v1/recommendations/` | JOB_SEEKER | Career recommendations |
| GET | `/api/v1/matching/` | JOB_SEEKER | Matching engine |
| POST | `/api/v1/jobs/` | RECRUITER, ADMIN | Create job posting |
| PUT | `/api/v1/jobs/{id}` | RECRUITER, ADMIN | Update job posting |
| DELETE | `/api/v1/jobs/{id}` | RECRUITER, ADMIN | Delete job posting |

---

## 10. Milestone 2 Completed Work (Days 1–5)

### Day 1: Job & Swipe Service Integration
- Registered Job listing and detail endpoints behind the Gateway
- Integrated with Domain-2's Job Service (Port 8001)
- Gateway proxy forwarding with identity injection (X-User-Id, X-User-Role)

### Day 2: Swipe Service & Validation
- Swipe recording (`POST /api/v1/swipes/`) with action mapping (apply→right, save→right, skip→left)
- Swipe history (`GET /api/v1/swipes/history`) with user data isolation
- Request validation (SwipeActionSerializer) with backward compatibility (right/left)
- RBAC: JOB_SEEKER only for swipe endpoints
- Idempotent upsert logic for duplicate swipes

### Day 3: Search, Companies & Regression
- **Job Search** (`GET /api/v1/jobs/search`) with multi-criteria filters
- **Company Directory** (`GET /api/v1/companies/`) with industry, company_type, search, pagination filters
- **Company Detail** (`GET /api/v1/companies/{id}`)
- Full regression verification for Days 1–2

### Day 4: Recruiter CRUD, Matching Engine & Freshness Fields
- **Job Freshness Fields**: pass-through normalization from Domain-2
- **Matching Engine** (`GET /api/v1/matching/`) forwarding to Domain-3
- **Recruiter Job CRUD**: POST, PUT, DELETE for `/api/v1/jobs/`
- `IsRecruiterOrAdmin` RBAC permission class
- `JobCreateSerializer` / `JobUpdateSerializer` with validation

### Day 5: Full Integration & Collection
- **All services unified** behind the Django API Gateway (Port 8000)
- **Thunder Client collection** and **Postman collection** created for team testing (23 endpoints)
- **Full integration verification**: 108/108 tests passing
- **RBAC matrix** validated across all roles and endpoints

---

## 11. Milestone 2 Test Suite Summary

```
Ran 108 tests in 208.892s — OK
```

| Test File | Tests | Coverage Area |
|-----------|-------|---------------|
| `test_auth_day3.py` | 13 | Auth, JWT, RBAC, OAuth |
| `test_day2_jobs_swipes.py` | 25 | Jobs, Swipes, Validation |
| `test_day3_search_companies.py` | 34 | Search, Companies, Regression |
| `test_day4_recruiter_crud_matching.py` | 12 | CRUD, Matching, Freshness |
| `test_gateway_day4.py` | 11 | Gateway forwarding, errors |
| `test_gateway_day5.py` | 13 | Resume/ATS, Recommendations |
| **Total** | **108** | **All passing ✅** |

---

## 12. How to Run

### Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env

# Run migrations
python manage.py migrate

# Start Django Gateway (Port 8000)
python manage.py runserver 8000

# Start Mock Job Service (Port 8001) — for testing
python services/job_service_runner.py
```

### Run Tests
```bash
# Run all 108 tests
python manage.py test tests --noinput -v2
```

---

## 13. Key Configuration (settings.py)

| Setting | Default | Description |
|---------|---------|-------------|
| `JOB_SERVICE_URL` | `http://127.0.0.1:8001` | Domain-2 Job/Swipe service |
| `RESUME_SERVICE_URL` | `http://127.0.0.1:8002` | Domain-3 Resume/ATS service |
| `MATCHING_ENGINE_URL` | `http://127.0.0.1:8002` | Domain-3 Matching Engine |
| `JWT_SECRET_KEY` | `dev-jwt-secret` | JWT signing key |
