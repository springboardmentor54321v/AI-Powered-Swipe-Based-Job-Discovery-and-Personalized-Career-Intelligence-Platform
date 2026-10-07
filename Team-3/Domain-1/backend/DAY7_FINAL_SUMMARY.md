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

---
---

# SwipeX — Milestone 2 Backend Sign-Off Report

**Team**: Team 3  
**Domain**: Domain 1 — Backend & Identity Management (Intern 2)  
**Framework**: Python 3 + Django 6.1 + Django REST Framework + PostgreSQL  
**Gateway URL**: `http://127.0.0.1:8000`  
**Date**: 16 September 2026  
**Status**: **CODE FROZEN — READY FOR MILESTONE-2 SIGN-OFF**

---

### 12. Executive Summary

Milestone 2 backend development for Domain-1 is complete. All seven days of scheduled work have been executed. The Django API Gateway integrates authentication, RBAC, job listings, search, company directory, swipe recording, recruiter job management, resume/ATS services, and matching engine routing into a single unified entry point. The backend has been verified with **108 automated tests (100% passing)**, Django system checks (0 issues), and end-to-end integration through live mock services. The codebase is now frozen for mentor review and the Milestone-2 demo.

---

### 13. Milestone-2 Scope

Milestone 2 extended the Milestone 1 foundation (authentication, JWT, RBAC) with:

- Job listing and detail APIs with freshness/competition data
- Multi-criteria job search
- Company directory and detail endpoints
- Swipe recording (apply/save/skip) with action-to-direction mapping
- Swipe history with user isolation
- Recruiter job CRUD (create, read, update, delete)
- Matching Engine gateway integration
- Resume upload, ATS scoring, and recommendations gateway forwarding
- Swagger/OpenAPI documentation for all endpoints
- Full automated test coverage

**Out of scope for Milestone 2**: Production deployment, advanced NLP/ML ranking, cloud hosting, and public release.

---

### 14. Milestone-2 Backend Architecture

```text
              ┌─────────────────────────────────────────────────────┐
              │        Frontend / Client / Thunder Client            │
              └──────────────────────┬──────────────────────────────┘
                                     │
                                     ▼
              ┌─────────────────────────────────────────────────────┐
              │          Django API Gateway (Port 8000)              │
              │   • JWT Authentication (HMAC-SHA256)                 │
              │   • RBAC Enforcement (JOB_SEEKER/RECRUITER/ADMIN)   │
              │   • Untrusted Header Stripping (Anti-Spoofing)      │
              │   • Downstream Proxy Routing & Fault Tolerance      │
              │   • Swagger/OpenAPI 3.0 Documentation               │
              └──────┬──────────────────┬──────────────┬────────────┘
                     │                  │              │
      ┌──────────────┘                  │              └──────────────┐
      ▼                                 ▼                             ▼
┌──────────────────┐  ┌───────────────────────────┐  ┌──────────────────────────┐
│   Auth Service   │  │  Domain-2 Job & Swipe     │  │ Domain-3 Resume/ATS &    │
│   (Internal)     │  │  Service (Port 8001)      │  │ Matching Engine          │
│                  │  │                           │  │ (Port 8002)              │
│ • Registration   │  │ • Job List & Detail       │  │ • PDF Resume Upload      │
│ • Login / JWT    │  │ • Job Search (filters)    │  │ • ATS Scoring            │
│ • Token Refresh  │  │ • Company Dir & Detail    │  │ • Recommendations        │
│ • Current User   │  │ • Swipe Record & History  │  │ • Matching Engine        │
│ • Google OAuth   │  │ • Recruiter Job CRUD      │  │                          │
└──────────────────┘  └───────────────────────────┘  └──────────────────────────┘
```

---

### 15. Domain Responsibilities

| Domain | Owner | Responsibility |
|--------|-------|----------------|
| **Domain-1** | Intern 2 | API Gateway, JWT Auth, RBAC, Gateway proxy routing, Swagger/OpenAPI, integration orchestration |
| **Domain-2** | Intern 3 | Job & Data Intelligence — job listings, search, company data, swipe storage |
| **Domain-3** | Intern 4 | AI/ML Career Intelligence — resume parsing, ATS scoring, recommendations, matching engine |
| **Domain-4** | Intern 1 | Frontend & User Experience |
| **Domain-5** | Intern 5 | Platform, Testing & Deployment — QA, regression, integration validation |

**Note**: Domain-1 does not implement job search algorithms, ATS scoring logic, or recommendation engines. It provides gateway-level integration and routing for those services.

---

### 16. Milestone-2 Backend Components Completed

#### 16.1 Authentication (Milestone 1 → preserved in M2)
- `POST /api/v1/auth/register` — user creation with PBKDF2 password hashing
- `POST /api/v1/auth/login` — credential authentication, returns JWT pair + role
- `POST /api/v1/auth/refresh` — access token renewal via refresh token
- `GET /api/v1/auth/me` — authenticated user profile (user_id, name, role)
- `GET /api/v1/auth/oauth/google` — Google OAuth2 initiation

#### 16.2 Jobs (Gateway → Domain-2)
- `GET /api/v1/jobs/` — paginated job listings with location, remote, salary, skills, company_type filters
- `GET /api/v1/jobs/{id}` — single job detail with freshness/competition fields
- `GET /api/v1/jobs/search` — multi-criteria search (keyword, location, job_type, salary range, experience level, skills, remote, pagination)

#### 16.3 Swipe (Gateway → Domain-2)
- `POST /api/v1/swipes/` — record swipe (apply/save/skip → right/left direction mapping)
- `GET /api/v1/swipes/history` — user-scoped swipe history

#### 16.4 Company (Gateway → Domain-2)
- `GET /api/v1/companies/` — company directory with industry, company_type, search, pagination
- `GET /api/v1/companies/{id}` — company profile detail

#### 16.5 Recruiter Job CRUD (Gateway → Domain-2)
- `POST /api/v1/jobs/` — create job posting (RECRUITER/ADMIN only)
- `PUT /api/v1/jobs/{id}` — update job posting (RECRUITER/ADMIN only)
- `PATCH /api/v1/jobs/{id}` — partial update (RECRUITER/ADMIN only)
- `DELETE /api/v1/jobs/{id}` — delete job posting (RECRUITER/ADMIN only)

#### 16.6 Resume & ATS (Gateway → Domain-3)
- `POST /api/v1/resume/upload` — multipart PDF resume upload (JOB_SEEKER only)
- `GET /api/v1/resume/{resume_id}/ats-score` — ATS match score (JOB_SEEKER, RECRUITER)

#### 16.7 Recommendations & Matching (Gateway → Domain-3)
- `GET /api/v1/recommendations/` — career recommendations (JOB_SEEKER only)
- `GET /api/v1/matching/` — matching engine (JOB_SEEKER only)

#### 16.8 System
- `GET /health` — service health check
- `GET /api/docs/` — Swagger UI
- `GET /api/schema/` — OpenAPI 3.0 JSON schema

---

### 17. Milestone-2 Integration Flow

#### Job Seeker Flow
```
Login (POST /api/v1/auth/login)
  → Receive JWT access_token + refresh_token + role
  → Browse Jobs (GET /api/v1/jobs/)
  → Search Jobs (GET /api/v1/jobs/search?keyword=Python&location=Bengaluru)
  → View Job Detail (GET /api/v1/jobs/101)
      → See posted_time, applicant_count, competition_level
  → View Company (GET /api/v1/companies/1)
  → Swipe Apply (POST /api/v1/swipes/ {job_id: 101, action: "apply"})
  → View Swipe History (GET /api/v1/swipes/history)
  → Upload Resume (POST /api/v1/resume/upload)
  → Check ATS Score (GET /api/v1/resume/{id}/ats-score?job_id=101)
  → Get Recommendations (GET /api/v1/recommendations/)
  → Run Matching Engine (GET /api/v1/matching/)
```

#### Recruiter Flow
```
Login (POST /api/v1/auth/login)
  → Receive JWT (role: recruiter)
  → Create Job (POST /api/v1/jobs/ {title: "Backend Engineer", ...})
  → Read Job (GET /api/v1/jobs/{id})
  → Update Job (PUT /api/v1/jobs/{id} {title: "Senior Backend Engineer"})
  → Delete Job (DELETE /api/v1/jobs/{id})
```

---

### 18. Milestone-2 Authentication & RBAC

#### JWT Engine
- **Algorithm**: HMAC-SHA256 (HS256)
- **Access token lifespan**: 30 minutes (configurable)
- **Refresh token lifespan**: 7 days (configurable)
- **Password hashing**: PBKDF2 with SHA-256 and salt

#### Identity Propagation
The Gateway validates JWT tokens and injects trusted headers to downstream services:
- `X-User-Id` — authenticated user's database ID
- `X-User-Role` — authenticated user's role
- `X-User-Email` — authenticated user's email

Client-supplied `X-User-*` headers are **stripped** to prevent identity spoofing.

#### Milestone-2 RBAC Matrix

| Endpoint | Method | Public | JOB_SEEKER | RECRUITER | ADMIN |
|----------|--------|--------|------------|-----------|-------|
| `/api/v1/auth/register` | POST | ✅ | ✅ | ✅ | ✅ |
| `/api/v1/auth/login` | POST | ✅ | ✅ | ✅ | ✅ |
| `/api/v1/auth/me` | GET | ❌ | ✅ | ✅ | ✅ |
| `/api/v1/jobs/` | GET | ✅ | ✅ | ✅ | ✅ |
| `/api/v1/jobs/{id}` | GET | ✅ | ✅ | ✅ | ✅ |
| `/api/v1/jobs/search` | GET | ✅ | ✅ | ✅ | ✅ |
| `/api/v1/companies/` | GET | ✅ | ✅ | ✅ | ✅ |
| `/api/v1/companies/{id}` | GET | ✅ | ✅ | ✅ | ✅ |
| `/api/v1/jobs/` | POST | ❌ | ❌ | ✅ | ✅ |
| `/api/v1/jobs/{id}` | PUT/DELETE | ❌ | ❌ | ✅ | ✅ |
| `/api/v1/swipes/` | POST | ❌ | ✅ | ❌ | ❌ |
| `/api/v1/swipes/history` | GET | ❌ | ✅ | ❌ | ❌ |
| `/api/v1/resume/upload` | POST | ❌ | ✅ | ❌ | ❌ |
| `/api/v1/resume/{id}/ats-score` | GET | ❌ | ✅ | ✅ | ❌ |
| `/api/v1/recommendations/` | GET | ❌ | ✅ | ❌ | ❌ |
| `/api/v1/matching/` | GET | ❌ | ✅ | ❌ | ❌ |

---

### 19. Job Freshness & Competition Data

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `posted_time` | ISO 8601 datetime | When the job was posted | `2026-09-14T10:00:00Z` |
| `posted_at` | ISO 8601 datetime | Alias for posted_time | `2026-09-14T10:00:00Z` |
| `applicant_count` | integer | Number of applicants | `102` |
| `competition_level` | enum string | Market competition | `HIGH`, `MEDIUM`, `LOW` |
| `freshness` | enum string | Posting recency | `JUST_POSTED`, `RECENT`, `THIS_WEEK`, `OLDER` |

**Note**: These fields are computed by Domain-2 (Intern 3's Job Service). Domain-1 provides pass-through normalization.

---

### 20. Milestone-2 QA / Regression Status

#### Intern 5 Defect Log

| ID | Area | Owner | Status |
|----|------|-------|--------|
| M2-DEF-001 | Job search/company API | Intern 2 | Open (Gateway wiring verified; downstream service gap) |
| M2-DEF-002 | Matching integration | Matching owner | Blocked (no Docker image) |
| M2-DEF-003 | Frontend merge | Frontend | Resolved locally |
| M2-DEF-004 | Salary consistency | Frontend | Resolved locally |
| M2-DEF-005 | Local Docker | Local environment | Closed |

#### Domain-1 Automated Tests

```
Ran 108 tests in 141.055s — OK
System check identified no issues (0 silenced).
```

| Test File | Count | Coverage |
|-----------|-------|----------|
| `test_auth_day3.py` | 13 | Auth, JWT, RBAC, OAuth |
| `test_day2_jobs_swipes.py` | 25 | Jobs, Swipes, Validation |
| `test_day3_search_companies.py` | 34 | Search, Companies, Regression |
| `test_day4_recruiter_crud_matching.py` | 12 | CRUD, Matching, Freshness |
| `test_gateway_day4.py` | 11 | Gateway forwarding, errors |
| `test_gateway_day5.py` | 13 | Resume/ATS, Recommendations |
| **Total** | **108** | **All passing ✅** |

---

### 21. Defects Resolved During Milestone 2

| Day | Issue | Resolution |
|-----|-------|------------|
| Day 2 | Swipe action vocabulary mismatch | Created `ACTION_TO_DIRECTION` mapping with backward compatibility |
| Day 3 | Search/Company endpoints not routed | Added `JobSearchView`, `ListCompaniesView`, `CompanyDetailView` |
| Day 4 | Freshness field inconsistency | Added `_normalize_job_freshness()` pass-through |
| Day 4 | Recruiter CRUD missing | Added `IsRecruiterOrAdmin` permission class and serializers |
| Day 5 | Mock service incomplete | Extended `job_service_runner.py` with full M2 contract |
| Day 6 | M2-DEF-001 triage | Verified Gateway wiring is correct; downstream Docker image gap |

---

### 22. Milestone-2 Demo Flow

#### Prerequisites
```powershell
# Terminal 1: Django API Gateway (Port 8000)
cd "R:\new projects\resume-ats\Team-3\Domain-1\backend"
python manage.py runserver 8000

# Terminal 2: Mock Job & Swipe Service (Port 8001)
cd "R:\new projects\resume-ats\Team-3\Domain-1\backend"
python services\job_service_runner.py

# Terminal 3: Resume/ATS Service (Port 8002) — if Domain-3 is available
cd "R:\new projects\resume-ats\Team-3\Domain-3"
uvicorn resume_service:app --port 8002
```

#### Demo Sequence

| Step | Action | Endpoint | Expected |
|------|--------|----------|----------|
| 1 | Register user | `POST /api/v1/auth/register` | 201 + user_id |
| 2 | Login | `POST /api/v1/auth/login` | 200 + JWT tokens + role |
| 3 | Check identity | `GET /api/v1/auth/me` | 200 + user profile |
| 4 | Browse jobs | `GET /api/v1/jobs/` | 200 + job list with freshness |
| 5 | Search jobs | `GET /api/v1/jobs/search?keyword=Python` | 200 + filtered results |
| 6 | View job detail | `GET /api/v1/jobs/101` | 200 + posted_time, competition_level |
| 7 | View company | `GET /api/v1/companies/1` | 200 + company profile |
| 8 | Swipe apply | `POST /api/v1/swipes/` | 201 + swipe recorded |
| 9 | View history | `GET /api/v1/swipes/history` | 200 + user swipes |
| 10 | Matching engine | `GET /api/v1/matching/` | 200 or 503 |
| 11 | RBAC denial | `POST /api/v1/swipes/` as RECRUITER | 403 Forbidden |
| 12 | Recruiter create | `POST /api/v1/jobs/` as RECRUITER | 201 + created job |
| 13 | Recruiter update | `PUT /api/v1/jobs/{id}` as RECRUITER | 200 + updated job |
| 14 | Recruiter delete | `DELETE /api/v1/jobs/{id}` as RECRUITER | 200 + deleted |
| 15 | Swagger docs | `GET /api/docs/` | Swagger UI loads |

---

### 23. Milestone-2 Swagger/OpenAPI Status

| Item | Value |
|------|-------|
| Library | `drf-spectacular` |
| Swagger UI | `http://127.0.0.1:8000/api/docs/` |
| OpenAPI 3.0 Schema | `http://127.0.0.1:8000/api/schema/` |
| Endpoint coverage | All 23 Milestone-2 client-facing endpoints |
| Authentication scheme | Bearer JWT (`jwtAuth`) |
| Tags | System, Authentication, Jobs, Companies, Swipes, Resume, Matching Engine |
| Validated | Yes |

---

### 24. Technology Stack

| Technology | Purpose |
|------------|---------|
| Python 3 | Runtime |
| Django 6.1 | Web framework |
| Django REST Framework | API framework |
| drf-spectacular | OpenAPI/Swagger |
| PostgreSQL | Database (Django ORM) |
| Redis | Cache infrastructure (configured) |
| JWT (HMAC-SHA256) | Authentication tokens |
| django-cors-headers | Cross-origin support |
| Docker | Containerization (Dockerfile present) |

---

### 25. Known Limitations

| Issue | Domain | Blocks Sign-off? |
|-------|--------|-------------------|
| M2-DEF-001: Domain-2 Docker image lacks search/company | Domain-2 | No |
| M2-DEF-002: No Matching Engine Docker image | Domain-3 | No |
| Production deployment not performed | Out of scope | No |
| Advanced NLP/ML ranking not implemented | Milestone 3 | No |

---

### 26. Milestone-2 Code Freeze Status

- **Code freeze established**: 16 September 2026
- **No new features added on Day 7**: Confirmed
- **No architecture redesign on Day 7**: Confirmed
- **No modifications to other domains**: Confirmed
- **Git status**: `nothing to commit, working tree clean`
- **Latest commit**: `d973f1f milestone-2(day-6) of domain-1 work`
- **Branch**: `Team-3`
- **Django system check**: 0 issues

---

### 27. Milestone-2 Sign-Off Statement

#### Verification Evidence

- [x] 108/108 automated tests passing (100%)
- [x] Django system check: 0 issues
- [x] All Gateway routes reachable and tested
- [x] JWT authentication verified (login, refresh, me)
- [x] RBAC verified across all three roles
- [x] Job list, detail, and search verified with freshness/competition fields
- [x] Swipe recording and history verified with user isolation
- [x] Company directory and detail verified
- [x] Recruiter CRUD verified with proper authorization
- [x] Matching Engine gateway route verified
- [x] Resume upload and ATS scoring gateway forwarding verified
- [x] Swagger/OpenAPI documentation validated
- [x] Git working tree clean
- [x] No modifications made to Domain-2, Domain-3, Domain-4, or Domain-5

#### Sign-Off

The **SwipeX Milestone 2 backend (Domain-1)** is hereby declared **code-frozen** and **ready for mentor review and team demonstration**. All Domain-1 responsibilities have been implemented, integrated, tested, documented, and verified. The backend API Gateway is stable and provides a unified entry point for the entire Milestone-2 platform.

---

*Prepared by: Intern 2 — Backend & Identity Management*  
*Domain: Team-3/Domain-1*  
*Date: 16 September 2026*

---
---

# SwipeX — Milestone 3 Backend Sign-Off Report

**Team**: Team 3  
**Domain**: Domain 1 — Backend & Identity Management (Intern 2)  
**Framework**: Python 3 + Django 6.1 + Django REST Framework + PostgreSQL  
**Gateway URL**: `http://127.0.0.1:8000`  
**Date**: 30 September 2026  
**Status**: **BLOCKED — PENDING QA REGRESSION**

---

### 1. Executive Summary
This report summarizes the backend implementation, integration, and verification state of the SwipeX Milestone 3 deliverables. The core objective of this milestone—incorporating AI-driven resume parsing, ATS scoring, intelligent suggestions, and upgraded semantic recommendations—has been implemented. However, formal QA regression from Intern 5 is missing, meaning the code freeze and final sign-off are blocked pending QA.

---

### 2. Milestone 3 Objective
The objective of Milestone 3 is to integrate advanced intelligent features into the SwipeX platform, specifically:
- Resume uploading and versioning.
- Automated resume parsing (text and skill extraction).
- Blended ATS scoring (keyword + semantic match against job descriptions).
- AI-driven suggestions for resume improvement.
- Upgraded, ATS-aware career recommendations.

---

### 3. Final Backend Architecture
The backend utilizes a decoupled, microservice-inspired architecture using Django and Django REST Framework, coordinated by a central API Gateway (Domain-1). 
Client applications exclusively communicate with the API Gateway (Port :8000), which enforces JWT authentication, RBAC, and ownership constraints before routing requests to specialized services. AI/ML processing is offloaded to the Domain-3 (Intern 4) implementations, either through direct module invocation or sub-service requests. 

---

### 4. Domain Responsibilities
- **Domain-1 / Intern 2:** Resume Service APIs, ATS Scoring API, Recommendation API upgrade/integration, Gateway extension, and RBAC on new endpoints.
- **Domain-2 / Intern 3:** Resume/Skill database schema, file storage mechanisms, job skills/keywords, and the overall data layer.
- **Domain-3 / Intern 4:** Text extraction, skill extraction, ATS scoring engine, semantic similarity algorithms, AI suggestions, and the core Recommendation Engine.
- **Domain-4 / Intern 1:** Frontend UI for resumes, ATS results, suggestions, and recommendations.
- **Domain-5 / Intern 5:** CI, automated testing, QA regression, and integration testing.

---

### 5. Backend Components Delivered
#### 5.1 Resume Service
- `POST /api/v1/resumes/upload`: Supports PDF/DOCX multipart uploads.
- `GET /api/v1/resumes`: Retrieves resume listings and version history.
#### 5.2 Resume Parsing Integration
- `POST /api/v1/resumes/{id}/parse`: Invokes text/skill extraction on uploaded files, returning `parsed_text` and `extracted_skills`.
#### 5.3 ATS Scoring API
- `POST /api/v1/ats/score`: Evaluates a resume against a specified `job_id`, returning a blended `match_score`, `missing_keywords`, and `missing_skills`.
#### 5.4 AI Suggestions API
- `POST /api/v1/suggestions/`: Generates actionable AI suggestions for a resume (with optional targeted `job_id`). Includes a free fallback mechanism when the primary LLM layer is unavailable.
#### 5.5 Recommendation API
- `GET /api/v1/recommendations/`: An upgraded endpoint utilizing semantic/ATS-aware matching to return highly relevant job recommendations.
#### 5.6 API Gateway
- Central entry point that masks downstream complexities and securely routes to the relevant Domain-1, Domain-2, and Domain-3 subsystems.
#### 5.7 Authentication & RBAC
- Robust JWT-based authentication.
- Strict RBAC: Job Seekers have isolated access to their private resume data; Recruiters are denied candidate operations.

---

### 6. End-to-End Integration Flow
1. **Login** -> Receives JWT.
2. **Resume Upload** -> Creates a new resume version in storage and DB.
3. **Resume Parsing** -> Extracts text and skills via Domain-3 logic.
4. **ATS Scoring** -> Job Seeker selects a job; system scores the parsed skills against job requirements.
5. **AI Suggestions** -> Requests actionable feedback based on missing skills/keywords.
6. **Upgraded Recommendations** -> Suggests highly compatible jobs based on the parsed profile.

---

### 7. Data Flow
- Client -> API Gateway (JWT validation) -> Resume API -> Domain-2 Storage / DB.
- Client -> API Gateway -> ATS/Suggestions API -> Domain-3 AI/ML Engine -> Response to Client.

---

### 8. AI/ML Integration Boundary
- **Intern 4 (Domain-3)** strictly owns the algorithms, models, and AI engines (e.g., skill extraction, semantic matching, scoring logic).
- **Intern 2 (Domain-1)** strictly owns the API contracts, Gateway wrapping, request validation, and RBAC enforcement, bridging the client to Intern 4's engines.

---

### 9. Security and Data Ownership
- **Authentication:** Enforced via stateless JWTs.
- **RBAC:** Recruiters receive `403 Forbidden` if attempting to upload, parse, or score resumes.
- **Data Ownership:** A Job Seeker can only parse, score, and receive suggestions for their *own* resume. The API Gateway injects the authenticated `X-User-Id` into downstream requests, preventing IDOR (Insecure Direct Object Reference) vulnerabilities.

---

### 10. QA / Regression Status
- **Missing QA Evidence:** Intern 5 has *not* published Milestone 3 QA regression evidence in `Domain-5/testing/`. 
- **Developer Verification:** The local test suite passes (155/155 tests successful), but independent QA sign-off is lacking.
- **Status:** **BLOCKED**

---

### 11. API Documentation Status
- The OpenAPI/Swagger documentation (`schema.json`) has been generated and finalized based on the actual implemented routes, capturing all new M3 endpoints and legacy M2 endpoints.

---

### 12. Final Demo Flow
**Job Seeker Demo:**
1. Login to receive JWT.
2. Upload a sample PDF resume (`POST /api/v1/resumes/upload`).
3. Trigger parsing (`POST /api/v1/resumes/{id}/parse`) and display extracted skills.
4. Request an ATS score against a real `job_id` (`POST /api/v1/ats/score`).
5. Display the `match_score` and missing keywords/skills.
6. Request AI suggestions (`POST /api/v1/suggestions/`) and display actionable feedback.
7. Fetch upgraded recommendations (`GET /api/v1/recommendations/`) and display ATS-aware job suggestions.

---

### 13. Code Freeze Status
- **Status:** **PENDING QA**
- The codebase is developmentally stable and locally tested, but a formal code freeze cannot be enacted without Intern 5's QA approval.

---

### 14. Known Limitations
- Notifications, application tracking dashboards, analytics visualization, and production/cloud deployment are explicitly out of scope for Milestone 3 per the SRS.
- The AI suggestions feature relies on a fallback mechanism if the primary LLM is unavailable.

---

### 15. Milestone 4 Handoff Notes
Future milestones can consume the following stabilized metadata:
- Resume metadata, object keys, and version history.
- Parsed resume text and standardized extracted skills arrays.
- Blended ATS match scores and missing skill metrics.
- Output from the semantic recommendation engine.

---

### 16. Final Sign-Off Status
- **Status: NOT SIGNED OFF**
- Justification: Waiting on Domain-5 (Intern 5) to execute and document the final QA regression pass for Milestone 3.

---

*Prepared by: Intern 2 — Backend & Identity Management*  
*Domain: Team-3/Domain-1*  
*Date: 30 September 2026*
