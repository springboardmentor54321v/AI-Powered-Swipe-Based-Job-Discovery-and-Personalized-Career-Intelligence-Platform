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

## 8. Important Milestone 1 Scope Boundary

> [!IMPORTANT]
> **Day 1 Focus**: Day 1 is strictly dedicated to team alignment, repository foundation, architectural lock-in, and API contract specification.
> 
> - **No Service Implementations Yet**: Business logic, database drivers, and authentication handlers are not implemented on Day 1.
> - **Production Deployment Out of Scope**: Production infrastructure and live deployment are explicitly out of scope for Milestone 1.
> - **Heuristic Placeholders**: Resume parsing, ATS scoring (`heuristic-v0`), and recommendation engines in Milestone 1 are simple heuristic/rule-based stubs, not full machine learning models.
