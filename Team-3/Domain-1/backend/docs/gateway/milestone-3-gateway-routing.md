# SwipeX Milestone 3 — API Gateway Routing Plan

> **Document Status**: Milestone 3 — Day 1 Gateway Architecture Extension  
> **Target Version**: `/api/v1/`  
> **Author**: Intern 2 (Backend & Identity Management)  
> **Upstream Gateway Engine**: Django 6.1 + Django REST Framework (`gateway/` in Domain-1)  
> **Date**: 22 September 2026

---

## 1. Gateway Overview

The SwipeX API Gateway (Port 8000) continues to serve as the **single unified entry point** for all client traffic in Milestone 3. The existing M2 Gateway architecture is preserved and extended — no duplicate Gateway is created.

### Architecture Principles (Unchanged from M2)

1. **Stateless JWT Validation** — Validates Bearer tokens using HMAC-SHA256
2. **Role-Based Access Control (RBAC)** — Restricts endpoints by role (`JOB_SEEKER`, `RECRUITER`, `ADMIN`)
3. **Identity Header Propagation** — Strips client-injected `X-User-*` headers; injects verified `X-User-Id`, `X-User-Role`, `X-User-Email`
4. **Resilient Reverse Proxying** — Normalizes downstream errors into standard JSON responses (503/504/502)
5. **Gateway Proxy** — Uses `gateway/proxy.py` → `forward_to_downstream()` for all service forwarding

---

## 2. Milestone 3 — Extended Routing Topology

```text
 Client (Web / Mobile)
         │
         ▼
 ┌──────────────────────────────────────────────────────────────┐
 │   SwipeX API Gateway (Django / DRF — Port 8000)              │
 │                                                              │
 │   MILESTONE 1 (Preserved)                                    │
 │   • /api/v1/auth/*           ──► Internal Auth Service       │
 │                                                              │
 │   MILESTONE 2 (Preserved)                                    │
 │   • /api/v1/jobs/*           ──► Job Service (Port 8001)     │
 │   • /api/v1/swipes/*         ──► Swipe Service (Port 8001)   │
 │   • /api/v1/companies/*      ──► Job Service (Port 8001)     │
 │   • /api/v1/resume/upload    ──► Resume Service (Port 8002)  │
 │   • /api/v1/resume/{id}/ats  ──► Resume Service (Port 8002)  │
 │   • /api/v1/matching/*       ──► Matching Engine (Port 8002) │
 │                                                              │
 │   MILESTONE 3 (New)                                          │
 │   • /api/v1/resumes/upload   ──► Resume Service (Port 8002)  │
 │   • /api/v1/resumes/         ──► Resume Service (Port 8002)  │
 │   • /api/v1/resumes/{id}/    ──► Resume Service (Port 8002)  │
 │     versions/{vid}                                           │
 │   • /api/v1/ats/score        ──► ATS Service (Port 8002)     │
 │   • /api/v1/suggestions/     ──► AI Suggestions (Port 8002)  │
 │   • /api/v1/recommendations/ ──► Recommendation (Port 8002)  │
 │                                  (Upgraded)                  │
 └──────────────────────────────────────────────────────────────┘
```

---

## 3. Complete Milestone 3 Routing Table

### 3.1 New Milestone 3 Routes

| Public API Endpoint | HTTP Method | Target Service | Downstream Subpath | Auth | Allowed Roles | Identity Headers | Status |
|:---|:---|:---|:---|:---|:---|:---|:---|
| `/api/v1/resumes/upload` | `POST` | **Resume Service** | `${RESUME_SERVICE_URL}/api/v1/resumes/upload` | Protected (JWT) | `job_seeker` | `X-User-Id`, `X-User-Role`, `X-User-Email` | **Planned** |
| `/api/v1/resumes/` | `GET` | **Resume Service** | `${RESUME_SERVICE_URL}/api/v1/resumes/` | Protected (JWT) | `job_seeker` | `X-User-Id`, `X-User-Role`, `X-User-Email` | **Planned** |
| `/api/v1/resumes/{resume_id}/versions/{version_id}` | `GET` | **Resume Service** | `${RESUME_SERVICE_URL}/api/v1/resumes/{resume_id}/versions/{version_id}` | Protected (JWT) | `job_seeker` | `X-User-Id`, `X-User-Role`, `X-User-Email` | **Planned** |
| `/api/v1/ats/score` | `POST` | **ATS Service** | `${RESUME_SERVICE_URL}/api/v1/ats/score` | Protected (JWT) | `job_seeker` | `X-User-Id`, `X-User-Role` | **Planned** |
| `/api/v1/suggestions/` | `POST` | **AI Suggestions** | `${RESUME_SERVICE_URL}/api/v1/suggestions/` | Protected (JWT) | `job_seeker` | `X-User-Id`, `X-User-Role` | **Planned** |
| `/api/v1/recommendations/` | `GET` | **Recommendation** | `${RESUME_SERVICE_URL}/api/v1/recommendations/` | Protected (JWT) | `job_seeker` | `X-User-Id`, `X-User-Role` | **Upgrade** |

### 3.2 Preserved Milestone 2 Routes (No Changes)

| Public API Endpoint | HTTP Method | Target Service | Auth | Roles | Status |
|:---|:---|:---|:---|:---|:---|
| `/api/v1/auth/register` | `POST` | Internal Auth | None | Public | **Active (M1)** |
| `/api/v1/auth/login` | `POST` | Internal Auth | None | Public | **Active (M1)** |
| `/api/v1/auth/me` | `GET` | Internal Auth | JWT | Any authenticated | **Active (M1)** |
| `/api/v1/auth/refresh` | `POST` | Internal Auth | Refresh Token | Any | **Active (M1)** |
| `/api/v1/jobs/` | `GET` | Job Service | Public | All | **Active (M2)** |
| `/api/v1/jobs/{id}` | `GET` | Job Service | Public | All | **Active (M2)** |
| `/api/v1/jobs/search` | `GET` | Job Service | Public | All | **Active (M2)** |
| `/api/v1/jobs/` | `POST` | Job Service | JWT | `recruiter`, `admin` | **Active (M2)** |
| `/api/v1/jobs/{id}` | `PUT` / `DELETE` | Job Service | JWT | `recruiter`, `admin` | **Active (M2)** |
| `/api/v1/swipes/` | `POST` | Swipe Service | JWT | `job_seeker` | **Active (M2)** |
| `/api/v1/swipes/history` | `GET` | Swipe Service | JWT | `job_seeker` | **Active (M2)** |
| `/api/v1/companies/` | `GET` | Job Service | Public | All | **Active (M2)** |
| `/api/v1/companies/{id}` | `GET` | Job Service | Public | All | **Active (M2)** |
| `/api/v1/resume/upload` | `POST` | Resume Service | JWT | `job_seeker` | **Active (M2, Legacy)** |
| `/api/v1/resume/{id}/ats-score` | `GET` | Resume Service | JWT | `job_seeker`, `recruiter` | **Active (M2, Legacy)** |
| `/api/v1/matching/` | `GET` | Matching Engine | JWT | `job_seeker` | **Active (M2)** |

---

## 4. Detailed Route Plans — New Milestone 3 Endpoints

### 4.1 Resume Upload Route (M3)

```text
Public API: POST /api/v1/resumes/upload
    ↓
Gateway (Port 8000)
    • Authenticates Bearer JWT (JWTAuthentication)
    • Verifies user role: IsJobSeeker (rejects recruiter/admin with 403)
    • Sanitizes headers: strips client X-User-* headers
    • Injects verified: X-User-Id, X-User-Role, X-User-Email
    • Forwards multipart/form-data (file + optional label)
    • Removes Content-Type header for boundary regeneration
    ↓
Target Service: Resume Service (Port 8002)
    • URL: ${RESUME_SERVICE_URL}/api/v1/resumes/upload
    • Reads X-User-Id to set owner_user_id
    • Stores file → generates resume + version records
    • Returns: 201 Created (resume_id, version_id, parsed_skills)
```

### 4.2 Resume List Route (M3)

```text
Public API: GET /api/v1/resumes/?page=1&page_size=10
    ↓
Gateway (Port 8000)
    • Authenticates Bearer JWT
    • Verifies: IsJobSeeker
    • Injects: X-User-Id (for ownership filtering downstream)
    • Forwards query parameters: page, page_size
    ↓
Target Service: Resume Service (Port 8002)
    • URL: ${RESUME_SERVICE_URL}/api/v1/resumes/
    • Filters resumes WHERE owner_user_id = X-User-Id
    • Returns: 200 OK (count, results[])
```

### 4.3 Resume Version Detail Route (M3)

```text
Public API: GET /api/v1/resumes/{resume_id}/versions/{version_id}
    ↓
Gateway (Port 8000)
    • Authenticates Bearer JWT
    • Verifies: IsJobSeeker
    • Injects: X-User-Id (for ownership verification)
    • Forwards path parameters
    ↓
Target Service: Resume Service (Port 8002)
    • URL: ${RESUME_SERVICE_URL}/api/v1/resumes/{resume_id}/versions/{version_id}
    • Verifies owner_user_id matches X-User-Id
    • Returns: 200 OK (version detail + extracted skills)
    • Returns: 404 if not found OR not owned by user (prevents enumeration)
```

### 4.4 ATS Score Route (M3)

```text
Public API: POST /api/v1/ats/score
    ↓
Gateway (Port 8000)
    • Authenticates Bearer JWT
    • Verifies: IsJobSeeker
    • Validates request body: resume_id (required), job_id (required)
    • Injects: X-User-Id (for resume ownership check downstream)
    • Forwards JSON body
    ↓
Target Service: ATS Service (Port 8002)
    • URL: ${RESUME_SERVICE_URL}/api/v1/ats/score
    • Verifies resume ownership via X-User-Id
    • Computes ATS score using resume skills vs job requirements
    • Returns: 200 OK (match_score, matched_skills, missing_skills, suggestions)
```

### 4.5 AI Suggestions Route (M3)

```text
Public API: POST /api/v1/suggestions/
    ↓
Gateway (Port 8000)
    • Authenticates Bearer JWT
    • Verifies: IsJobSeeker
    • Validates request body: resume_id (required), job_id (optional)
    • Injects: X-User-Id
    • Forwards JSON body
    ↓
Target Service: AI Suggestions Service (Port 8002)
    • URL: ${RESUME_SERVICE_URL}/api/v1/suggestions/
    • Attempts LLM-based generation; falls back to rule-based if unavailable
    • Returns: 200 OK (source: "ai_generated" | "rule_based", suggestions[])
```

### 4.6 Recommendation Route (M3 Upgrade)

```text
Public API: GET /api/v1/recommendations/?resume_id=<uuid>&include_ats=true&limit=10
    ↓
Gateway (Port 8000)
    • Authenticates Bearer JWT
    • Verifies: IsJobSeeker
    • Injects: X-User-Id, X-User-Role
    • Forwards query parameters: resume_id, user_id, limit, include_ats
    ↓
Target Service: Recommendation Service (Port 8002)
    • URL: ${RESUME_SERVICE_URL}/api/v1/recommendations/
    • M3 upgrade: semantic matching, ATS-aware scoring, swipe history
    • Response is backward-compatible with M2 (adds new fields, keeps existing)
    • Returns: 200 OK (recommendations[], generated_by)
```

---

## 5. Network & Microservice Topology (Updated)

| Service | Host | Port | Configuration Key | Domain Owner | M3 Changes |
|:---|:---|:---|:---|:---|:---|
| **API Gateway & Identity** | `127.0.0.1` | `8000` | — | Intern 2 (Domain-1) | New route registrations |
| **Job & Swipe Service** | `127.0.0.1` | `8001` | `JOB_SERVICE_URL` | Intern 3 (Domain-2) | No changes |
| **Resume, ATS & AI Service** | `127.0.0.1` | `8002` | `RESUME_SERVICE_URL` | Intern 4 (Domain-3) | New endpoints added |
| **Matching Engine** | `127.0.0.1` | `8002` | `MATCHING_ENGINE_URL` | Intern 4 (Domain-3) | Enhanced backend |

> **Note**: ATS, Suggestions, and Recommendation services share Port 8002 with the Resume Service. They are logically separate endpoints within the same downstream application. If a separate service is needed later, only the Gateway configuration (`settings.py` env var) needs to change — no client-facing route changes required.

---

## 6. URL Registration Plan (config/urls.py)

The following new URL patterns will be registered during Day-2 implementation:

```python
# Milestone 3 — New URL patterns (PLANNED, not yet implemented)
path("api/v1/resumes/", include("apps.resume_service.m3_urls")),
path("api/v1/ats/", include("apps.ats_service.urls")),
path("api/v1/suggestions/", include("apps.suggestions_service.urls")),
# /api/v1/recommendations/ already registered — views will be upgraded in-place
```

---

## 7. Security & Gateway Protections (Unchanged from M2)

1. **Hop-by-Hop Header Sanitization**: Strips `connection`, `keep-alive`, `transfer-encoding`
2. **Identity Spoofing Prevention**: Strips client-supplied `X-User-Id`, `X-User-Role`, `X-User-Email`; injects server-verified JWT claims
3. **Resilience & Fault Tolerance**: Returns clean JSON `503`/`504` on downstream failures
4. **Resume Ownership Enforcement**: Gateway injects `X-User-Id`; downstream services verify ownership before returning data
5. **Multipart File Forwarding**: Gateway proxy supports `multipart/form-data` for resume uploads (preserves M2 capability)

---

## 8. Migration Notes

### M2 → M3 Route Coexistence

| M2 Route (Legacy) | M3 Route (New) | Coexistence Strategy |
|:---|:---|:---|
| `POST /api/v1/resume/upload` | `POST /api/v1/resumes/upload` | Both active during migration; M2 route remains as pass-through |
| `GET /api/v1/resume/{id}/ats-score` | `POST /api/v1/ats/score` | Both active; M3 uses POST with JSON body instead of GET with query params |
| `GET /api/v1/recommendations/` | `GET /api/v1/recommendations/` | Same route — response is extended, not replaced |
| `GET /api/v1/matching/` | `GET /api/v1/matching/` | Same route — backend upgraded, interface unchanged |

The M2 legacy routes will be deprecated after Milestone 3 contract freeze but remain functional throughout M3 development.

---

*Prepared by: Intern 2 — Backend & Identity Management*  
*Domain: Team-3/Domain-1*  
*Date: 22 September 2026*
