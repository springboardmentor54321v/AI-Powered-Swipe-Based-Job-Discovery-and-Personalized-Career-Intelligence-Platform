# SwipeX Milestone 2 — API Gateway Routing Plan

> **Document Status**: Milestone 2 — Day 1 Gateway Architecture Extension  
> **Target Version**: `/api/v1/`  
> **Author**: Intern 2 (Backend & Identity Management)  
> **Upstream Gateway Engine**: Django 6.1 + Django REST Framework (`gateway/` in Domain-1)

---

## 1. Gateway Overview & Routing Architecture

In SwipeX, the **API Gateway** running in Domain-1 on port `8000` acts as the single unified entry point for all frontend/client traffic.
It decouples external clients from internal microservices, enforcing:
1. **Stateless JWT Validation**: Validates the bearer token using HMAC-SHA256 and extracts user identity (`sub`, `role`, `email`, `name`).
2. **Role-Based Access Control (RBAC)**: Restricts protected endpoints to authorized roles (e.g. `job_seeker`, `recruiter`, `admin`).
3. **Identity Header Propagation**: Strips any client-injected `X-User-*` headers and injects verified identity headers (`X-User-Id`, `X-User-Role`, `X-User-Email`) down to downstream microservices.
4. **Resilient Reverse Proxying & Error Normalization**: Forwards HTTP methods, headers, and query parameters, normalizing upstream connection errors into standard `503 Service Unavailable` or `504 Gateway Timeout` JSON responses.

```text
 Client (Web/Mobile)
         │
         ▼
 ┌────────────────────────────────────────────────────────┐
 │   SwipeX API Gateway (Django / DRF — Port 8000)        │
 │                                                        │
 │   • /api/v1/auth/*        ──► Internal Auth Service    │
 │   • /api/v1/jobs/*        ──► Job Service (Port 8001)  │
 │   • /api/v1/swipes/*      ──► Swipe Service (Port 8001)│
 │   • /api/v1/companies/*   ──► Job Service (Port 8001)  │
 │   • /api/v1/resume/*      ──► Resume Service (Port 8002)
 └────────────────────────────────────────────────────────┘
```

---

## 2. Milestone 2 Routing Table

The table below outlines the extended routing plan incorporating the new Milestone 2 endpoints alongside existing Milestone 1 baselines.

| Public API Endpoint | HTTP Method | Target Service | Downstream Base URL / Subpath | Auth Requirement | Allowed Roles | Identity Header Injected |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/v1/jobs` | `GET` | **Job Service** | `${JOB_SERVICE_URL}/api/v1/jobs` | Public (`AllowAny`) | All / Anonymous | None |
| `/api/v1/jobs/{id}` | `GET` | **Job Service** | `${JOB_SERVICE_URL}/api/v1/jobs/{id}` | Public (`AllowAny`) | All / Anonymous | None |
| `/api/v1/jobs/search` | `GET` | **Job Service** | `${JOB_SERVICE_URL}/api/v1/jobs/search` | Public (`AllowAny`) | All / Anonymous | None |
| `/api/v1/swipes` | `POST` | **Swipe Service** | `${JOB_SERVICE_URL}/api/v1/swipes` | Protected (`Bearer JWT`) | `job_seeker` | `X-User-Id`, `X-User-Role` |
| `/api/v1/swipes/history` | `GET` | **Swipe Service** | `${JOB_SERVICE_URL}/api/v1/swipes/history` | Protected (`Bearer JWT`) | `job_seeker` | `X-User-Id`, `X-User-Role` |
| `/api/v1/companies` | `GET` | **Job Service** | `${JOB_SERVICE_URL}/api/v1/companies` | Public (`AllowAny`) | All / Anonymous | None |
| `/api/v1/resume/upload` | `POST` | **Resume Service** | `${RESUME_SERVICE_URL}/api/v1/resume/upload` | Protected (`Bearer JWT`) | `job_seeker` | `X-User-Id`, `X-User-Role` |
| `/api/v1/resume/{id}/ats-score` | `GET` | **Resume Service** | `${RESUME_SERVICE_URL}/api/v1/resume/{id}/ats-score` | Protected (`Bearer JWT`) | `job_seeker` | `X-User-Id`, `X-User-Role` |
| `/api/v1/recommendations` | `GET` | **Resume Service** | `${RESUME_SERVICE_URL}/api/v1/recommendations` | Protected (`Bearer JWT`) | `job_seeker` | `X-User-Id`, `X-User-Role` |

---

## 3. Detailed Route Plans

### 3.1 Job List Route
```text
Public API: GET /api/v1/jobs
    ↓
Gateway (Port 8000)
    • Checks permission: AllowAny
    • Forwards query parameters: page, page_size, type, location, remote, salary_min, salary_max, skills, company_type
    ↓
Target Service: Job Service (Port 8001)
    • URL: http://127.0.0.1:8001/api/v1/jobs
    • Response: 200 OK with JobListResponse
```

### 3.2 Job Detail Route
```text
Public API: GET /api/v1/jobs/{id}
    ↓
Gateway (Port 8000)
    • Checks permission: AllowAny
    • Validates path parameter {id}
    ↓
Target Service: Job Service (Port 8001)
    • URL: http://127.0.0.1:8001/api/v1/jobs/{id}
    • Response: 200 OK (JobDetail) or 404 (Job Not Found)
```

### 3.3 Job Search Route
```text
Public API: GET /api/v1/jobs/search
    ↓
Gateway (Port 8000)
    • Checks permission: AllowAny
    • Forwards search parameters: keyword, location, job_type, salary_min, salary_max, experience_level, skills, is_remote, page, page_size
    ↓
Target Service: Job Service (Port 8001)
    • URL: http://127.0.0.1:8001/api/v1/jobs/search
    • Response: 200 OK with filtered results and pagination metadata
```

### 3.4 Swipe Action Route
```text
Public API: POST /api/v1/swipes
    ↓
Gateway (Port 8000)
    • Authenticates Bearer JWT (`JWTAuthentication`)
    • Verifies user role: `IsJobSeeker` (rejects `recruiter` or `admin` with 403 Forbidden)
    • Sanitizes incoming headers to prevent identity spoofing
    • Injects verified header: `X-User-Id: <user_id>`, `X-User-Role: job_seeker`
    • Forwards JSON payload: {"job_id": 101, "action": "apply"}
    ↓
Target Service: Swipe Service (Port 8001)
    • URL: http://127.0.0.1:8001/api/v1/swipes
    • Reads authenticated `X-User-Id` header
    • Enforces one active swipe per user & job (creates or updates)
    • Response: 201 Created (SwipeResponse)
```

### 3.5 Company Directory Route
```text
Public API: GET /api/v1/companies
    ↓
Gateway (Port 8000)
    • Checks permission: AllowAny
    • Forwards query parameters: page, page_size, industry, company_type, search
    ↓
Target Service: Job Service (Port 8001)
    • URL: http://127.0.0.1:8001/api/v1/companies
    • Response: 200 OK with CompanyListResponse
```

---

## 4. Network & Microservice Topology

| Service | Host | Port | Configuration Key in `.env` | Domain Owner |
| :--- | :--- | :--- | :--- | :--- |
| **API Gateway & Identity** | `127.0.0.1` | `8000` | — | Intern 2 (Domain-1) |
| **Job & Swipe Service** | `127.0.0.1` | `8001` | `JOB_SERVICE_URL=http://127.0.0.1:8001` | Intern 3 (Domain-2) |
| **Resume & ATS Service** | `127.0.0.1` | `8002` | `RESUME_SERVICE_URL=http://127.0.0.1:8002` | Intern 4 / Intern 5 (Domain-3) |

---

## 5. Security & Gateway Protections

1. **Hop-by-Hop Header Sanitization**:
   The gateway removes hop-by-hop headers (`connection`, `keep-alive`, `transfer-encoding`) before proxying to avoid HTTP smuggling.
2. **Identity Spoofing Prevention**:
   The gateway explicitly strips any client-supplied `X-User-Id`, `X-User-Role`, or `X-User-Email` before injecting the authentic, server-verified JWT claims.
3. **Resilience & Fault Tolerance**:
   If the downstream Job or Swipe Service is offline or taking longer than the 5-second timeout, the gateway returns a clear JSON error payload without crashing:
   ```json
   {
     "error": "Job Service Unavailable",
     "service": "Job Service",
     "detail": "Failed to establish a connection to http://127.0.0.1:8001/api/v1/jobs.",
     "status_code": 503
   }
   ```
