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
