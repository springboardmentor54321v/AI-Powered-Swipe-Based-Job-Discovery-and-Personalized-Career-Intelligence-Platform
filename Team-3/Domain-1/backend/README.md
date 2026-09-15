# SwipeX

> **SwipeX: Swipe-Based Intelligent Job Discovery and Career Assistance Platform**  
> Milestone 1 & 2 — Backend & Identity Management (Intern 2)

---

## 1. Project Description

SwipeX is an intuitive, swipe-based job discovery platform designed to simplify career matching for job seekers and recruitment workflows for employers. It pairs an engaging swipe-card interface with automated resume parsing, heuristic ATS compatibility scoring, and smart career recommendations.

---

## 2. Architecture

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
                     │              │
                     ▼              ▼
               PostgreSQL     CSV Dataset
```

- **Backend Framework**: Python + Django + Django REST Framework (DRF)
- **Database**: PostgreSQL (managed via Django ORM & migrations)
- **Authentication**: JWT (HS256) with access + refresh token pair
- **API Style**: REST with `/api/v1/` prefix
- **API Docs**: Swagger UI at `/api/docs/`, OpenAPI 3.0 schema at `/api/schema/`

---

## 3. Repository Structure

```text
Domain-1/backend/
├── manage.py
├── requirements.txt
├── .env / .env.example
├── config/
│   ├── settings.py              # DB, JWT, CORS, service URLs
│   ├── urls.py                  # Master URL routing (all 23 endpoints)
│   ├── asgi.py / wsgi.py
├── apps/
│   ├── users/                   # Custom User model, Role model, RoleEnum
│   ├── auth_service/            # JWT auth, RBAC permissions, OAuth2
│   │   ├── authentication.py    # JWTAuthentication class
│   │   ├── permissions.py       # IsJobSeeker, IsRecruiter, IsRecruiterOrAdmin, etc.
│   │   ├── jwt_utils.py         # Token generation/validation
│   │   ├── views.py             # Register, Login, Refresh, Me, OAuth
│   │   └── urls.py
│   ├── job_service/             # Job, Search, Company, Swipe views
│   │   ├── views.py             # Gateway proxy views + CRUD + RBAC
│   │   ├── urls.py              # /api/v1/jobs/
│   │   ├── companies_urls.py    # /api/v1/companies/
│   │   └── swipes_urls.py       # /api/v1/swipes/
│   └── resume_service/          # Resume, ATS, Recommendations, Matching
│       ├── views.py             # Gateway proxy views
│       ├── urls.py              # /api/v1/resume/
│       ├── recommendations_urls.py  # /api/v1/recommendations/
│       └── matching_urls.py     # /api/v1/matching/
├── gateway/
│   ├── proxy.py                 # Forward requests to downstream services
│   ├── views.py                 # Legacy gateway views
│   └── urls.py
├── services/
│   └── job_service_runner.py    # Mock Job/Swipe service (Port 8001)
├── tests/
│   ├── test_auth_day3.py        # 13 tests — Auth, JWT, RBAC
│   ├── test_day2_jobs_swipes.py # 25 tests — Jobs, Swipes, Validation
│   ├── test_day3_search_companies.py  # 34 tests — Search, Companies
│   ├── test_day4_recruiter_crud_matching.py  # 12 tests — CRUD, Matching
│   ├── test_gateway_day4.py     # 11 tests — Gateway forwarding
│   └── test_gateway_day5.py     # 13 tests — Resume/ATS integration
├── docs/
│   ├── thunder-collection_SwipeX_M2.json   # Thunder Client collection
│   └── SwipeX_M2_Postman_Collection.json   # Postman collection
└── docker/ / Dockerfile
```

---

## 4. API Endpoints (23 Total)

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

### Auth Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | User registration |
| POST | `/api/v1/auth/login` | JWT login |
| POST | `/api/v1/auth/token/refresh` | Refresh access token |
| GET | `/api/v1/auth/me` | Current user profile |

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

## 5. Milestone 1 — Completed Work

### Day 1–2: Foundation & Architecture
- Django project scaffold with apps structure
- PostgreSQL database configuration
- Custom User model with Role (JOB_SEEKER, RECRUITER, ADMIN)
- Environment-based configuration (.env)
- Repository structure and documentation

### Day 3: Authentication & RBAC
- **Registration** (`POST /api/v1/auth/register`) with email uniqueness and PBKDF2 hashing
- **Login** (`POST /api/v1/auth/login`) returning JWT access + refresh tokens
- **Token Refresh** (`POST /api/v1/auth/token/refresh`) for token rotation
- **Profile** (`GET /api/v1/auth/me`) with JWT-authenticated inspection
- **Google OAuth2** (`GET /api/v1/auth/oauth/google`, `/callback`)
- **RBAC Engine**: `IsJobSeeker`, `IsRecruiter`, `IsAdmin`, `HasRole` permission classes
- **Swagger UI** at `/api/docs/` via `drf-spectacular`
- **13 automated tests** — all passing ✅

---

## 6. Milestone 2 — Completed Work

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
- **25 automated tests** — all passing ✅

### Day 3: Search, Companies & Regression
- **Job Search** (`GET /api/v1/jobs/search`) with multi-criteria filters: keyword, location, job_type, salary_min/max, experience_level, skills, is_remote, pagination
- **Company Directory** (`GET /api/v1/companies/`) with industry, company_type, search, pagination filters
- **Company Detail** (`GET /api/v1/companies/{id}`)
- All search and company endpoints are public (AllowAny)
- Full regression verification for Days 1–2
- **34 automated tests** — all passing ✅

### Day 4: Recruiter CRUD, Matching Engine & Freshness Fields
- **Job Freshness Fields**: `posted_at`, `posted_time`, `applicant_count`, `competition_level`, `freshness` — pass-through normalization from Domain-2
- **Matching Engine** (`GET /api/v1/matching/`) forwarding to Domain-3 with trusted identity headers
- **Recruiter Job CRUD**:
  - `POST /api/v1/jobs/` — Create job (RECRUITER/ADMIN only)
  - `PUT /api/v1/jobs/{id}` — Update job (RECRUITER/ADMIN only)
  - `DELETE /api/v1/jobs/{id}` — Delete job (RECRUITER/ADMIN only)
- `IsRecruiterOrAdmin` RBAC permission class
- `JobCreateSerializer` / `JobUpdateSerializer` with validation
- **12 + 11 automated tests** — all passing ✅

### Day 5: Full Integration & Collection
- **All services unified** behind the Django API Gateway (Port 8000)
- **Thunder Client collection** created for team testing (23 endpoints)
- **Postman collection** created as alternate format
- **Full integration verification**: 108/108 tests passing ✅
- **RBAC matrix** validated across all roles and endpoints
- **Downstream error handling** verified: 503 (service down), 504 (timeout), 502 (communication error)

---

## 7. Test Suite Summary

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

## 8. How to Run

### Prerequisites
- Python 3.10+
- PostgreSQL running with `swipex_db` database
- Redis (optional, for caching)

### Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

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

# Run specific day's tests
python manage.py test tests.test_auth_day3
python manage.py test tests.test_day2_jobs_swipes
python manage.py test tests.test_day3_search_companies
python manage.py test tests.test_day4_recruiter_crud_matching
python manage.py test tests.test_gateway_day5
```

### API Documentation
- **Swagger UI**: http://127.0.0.1:8000/api/docs/
- **OpenAPI Schema**: http://127.0.0.1:8000/api/schema/

---

## 9. Team Ownership

| Intern | Role | Domain |
|--------|------|--------|
| **Intern 2** | Backend & Identity Management | Domain-1 (Gateway, Auth, RBAC) |
| **Intern 3** | Job & Data Intelligence | Domain-2 (Job/Swipe Service) |
| **Intern 4** | AI/ML Career Intelligence | Domain-3 (Resume/ATS, Matching) |
| **Intern 5** | Platform & Integration | Docker, CI/CD, Testing |

---

## 10. Key Configuration (settings.py)

| Setting | Default | Description |
|---------|---------|-------------|
| `JOB_SERVICE_URL` | `http://127.0.0.1:8001` | Domain-2 Job/Swipe service |
| `RESUME_SERVICE_URL` | `http://127.0.0.1:8002` | Domain-3 Resume/ATS service |
| `MATCHING_ENGINE_URL` | `http://127.0.0.1:8002` | Domain-3 Matching Engine |
| `JWT_SECRET_KEY` | `dev-jwt-secret` | JWT signing key |
| `JWT_ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Access token TTL |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | Refresh token TTL |
