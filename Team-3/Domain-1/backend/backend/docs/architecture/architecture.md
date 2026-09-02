# SwipeX Architecture

## 1. Project Overview

**SwipeX** is an intelligent, swipe-based job discovery and career assistance platform. It brings an intuitive, swipe-card experience (similar to familiar dating apps) to career exploration, connecting job seekers with open roles while providing automated resume parsing, ATS scoring, and keyword-based career recommendations.

---

## 2. Milestone 1 Backend Architecture

SwipeX follows a modular, microservice-oriented design to keep distinct domains decoupled and maintainable across the engineering team.

```text
Frontend
    │
    ▼
API Gateway / Django Root Router
    │
    ├──── Auth Service (`apps.auth_service`)
    │
    ├──── Job/Swipe Service (`apps.job_service`)
    │
    ├──── Resume/ATS Service (`apps.resume_service`)
    │
    ▼
PostgreSQL / Redis
```

---

## 3. Technology Stack

- **Backend Framework**: **Python + Django + Django REST Framework (DRF)**
- **Database**: PostgreSQL (relational storage with Django ORM & migrations)
- **Cache & Infrastructure**: Redis (in-memory store for sessions and caching)
- **Authentication**: JWT (PyJWT) & Google OAuth2 (Authlib)
- **API Style & Versioning**: RESTful APIs with `/api/v1/` prefix

---

## 4. Service Responsibilities

### Auth Service (`services/auth-service/`)
- **Registration & Login**: Account onboarding and credential verification.
- **Google OAuth2 Entry**: Standard third-party authentication entry point.
- **JWT Authentication**: Token-based identity management.
- **User Identity & Roles**: Core profile storage and role assignments (Job Seeker, Recruiter, Admin).

### Job/Swipe Service (`services/job-service/`)
- **Job Listings & Details**: Management, display, and retrieval of job postings.
- **Filtering & Search**: Attribute-based filtering (type, location, salary, remote, skills).
- **Swipe Recording**: Captures real-time candidate swipe interactions (left/right).
- **Swipe History**: Maintains past swipe actions for tracking and future matching.

### Resume/ATS Service (`services/resume-service/`)
- **Resume Upload**: File ingestion pipeline for applicant resumes.
- **Basic Resume Parsing**: Extraction of contact details and key skill tags.
- **Heuristic ATS Scoring**: Rule-based keyword matching and score generation (`heuristic-v0`).
- **Heuristic Recommendation Stub**: Basic rule-based job recommendations for Milestone 1.

### API Gateway (`gateway/`)
- Acts as the single, common entry point for all frontend requests.
- Routes incoming traffic to the appropriate backend service based on URL path.
- Shields internal service topology, keeping the frontend client independent of backend microservice structures.

---

## 5. Data Layer

The platform relies on two primary data backends in Milestone 1:
- **PostgreSQL**: Primary relational database for transactional data, user accounts, job records, swipe histories, and parsed resume entities. See detailed schema in [Database Design](database-design.md).
- **Redis**: In-memory store planned for caching frequently retrieved job listings, session management, and rate-limiting support.

---

## 6. API Versioning

All API routes across all services adhere to a strict version prefix:

```text
/api/v1/
```

---

## 7. Team Ownership

To ensure smooth collaboration, responsibilities are mapped across the 5 intern engineering roles:

| Role | Team Member | Primary Domain Ownership |
| :--- | :--- | :--- |
| **Intern 1** | Backend & Identity Management | Architecture setup, Auth Service, API Gateway contracts, JWT design |
| **Intern 2** | Job & Data Intelligence | Job/Swipe Service, Job schema, swipe ingestion, database indexing |
| **Intern 3** | AI/ML Career Intelligence | Resume/ATS Service, resume parsing, ATS heuristic scoring & recommendations |
| **Intern 4** | Frontend & UX | Web/Mobile client UI, swipe card deck, candidate dashboard, recruiter views |
| **Intern 5** | Platform/Testing | Integration tests, E2E testing framework, CI/CD pipeline, performance checks |

---

---

## 9. Milestone 1 - Day 4: API Gateway & Protected Routing Architecture

Day 4 establishes the **First Vertical Slice**, integrating the API Gateway with downstream services and enforcing RBAC.

### 9.1 Gateway Routing Architecture

```text
Frontend (Client)
        │
        ▼
Django API Gateway (Reverse Proxy / Port 8000)
        │
   ┌────┴────────────────────────┬─────────────────────────┐
   ▼                             ▼                         ▼
Auth Service               Job/Swipe Service         Resume/ATS Service
(Internal Django)          (Intern 2 - Port 8001)    (Intern 3 - Port 8002)
- /api/v1/auth/register    - GET  /api/v1/jobs       - POST /api/v1/resume/upload
- /api/v1/auth/login       - GET  /api/v1/jobs/{id}  - GET  /api/v1/resume/{id}/ats-score
- /api/v1/auth/refresh     - POST /api/v1/swipes     - GET  /api/v1/recommendations
- /api/v1/auth/me          - GET  /api/v1/swipes/history
```

### 9.2 Protected Request Flow with RBAC

```text
Client Request
      │
      ▼
Gateway Route Entry
      │
      ▼
JWT Authentication Middleware (Extracts Bearer token, validates signature/expiry)
      │
      ▼
Identify User & Role (PostgreSQL users & roles)
      │
      ▼
RBAC Permission Check (IsJobSeeker / IsRecruiter / IsAdmin)
      │
   ┌──┴──┐
   ▼     ▼
 Allow  Deny (403 Forbidden)
   │
   ▼
Inject Downstream Context Headers:
  • X-User-Id
  • X-User-Role
  • X-User-Email
  • Authorization: Bearer <token>
      │
      ▼
Forward to Downstream Microservice (via gateway.proxy.forward_to_downstream)
      │
      ▼
Return Clean Downstream Response to Client (or 503 if downstream is unavailable)
```

### 9.3 Service Status on Day 5
- **Auth Service (`apps.auth_service`)**: 100% operational (Register, Login, JWT, Refresh, /me, Google OAuth2 entry point).
- **Job/Swipe Service (`gateway/` -> `JOB_SERVICE_URL`)**: Gateway forwarding operational; forwards queries, parameters, headers, and bodies to Intern 2's service on port 8001.
- **Resume/ATS Service (`gateway/` -> `RESUME_SERVICE_URL`)**: Gateway forwarding operational; forwards multipart PDF uploads, ATS score requests, and job recommendations to Intern 3's FastAPI service on port 8002.
- **Microservices Orchestration**: All 3 services operate behind the unified Django API Gateway on port 8000, enforcing unified JWT authentication and RBAC rules.
