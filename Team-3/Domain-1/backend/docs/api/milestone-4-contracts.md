# SwipeX Milestone 4 — Day 1: API Contracts & Gateway Plan

This document outlines the OpenAPI contracts, Gateway routing plan, and environment variables for the Milestone 4 services (Notification, Application, Analytics, Competition) as designed by Intern 2 (Domain 1).

**Dependency Notice:** These contracts strictly align with Intern 3's M4 Day-1 schema implementation (Domain-2 `data-layer`), utilizing exact table/field names like `app.notification`, `app.alert_preference`, `app.application_status_event`, `jobs.applicant_count`, etc.

---

## 1. Gateway Routing Plan

The API Gateway (`http://127.0.0.1:8000`) will be extended to proxy the new Milestone 4 services. All existing M1-M3 routes (Auth, Jobs, Companies, Swipes, Resumes, ATS, Suggestions, Recommendations) are preserved without modification.

### New Routes to Register in `config/urls.py`

| Prefix / Path | HTTP Methods | Target Service | RBAC / Auth Requirement |
| :--- | :--- | :--- | :--- |
| `/api/v1/notifications/` | GET, PATCH | Notification Service | Authenticated (`JOB_SEEKER`, `RECRUITER`) |
| `/ws/notifications/` | WebSocket | Notification WS Server | Authenticated (Token passed in protocol) |
| `/api/v1/alert-preferences/`| GET, PUT | Notification Service | Authenticated |
| `/api/v1/applications/` | GET, POST, PATCH | Application Service | Authenticated (`JOB_SEEKER`, `RECRUITER`) |
| `/api/v1/analytics/` | GET | Analytics Service | Authenticated (`JOB_SEEKER`, `RECRUITER`, `ADMIN`) |

*Note: The Competition Service features will primarily extend the existing `/api/v1/jobs/` endpoints and add a specific competition sub-route, handled by the Job Service.*

---

## 2. Notification API Contracts

*Backing Tables:* `app.notification`, `app.alert_preference`

### 2.1 Get Notification History
- **Endpoint**: `GET /api/v1/notifications/`
- **Auth/RBAC**: Authenticated (Any role)
- **Parameters**: `page` (int), `limit` (int)
- **Response**: `200 OK`
```json
{
  "count": 12,
  "results": [
    {
      "id": "uuid",
      "type": "application_status",
      "title": "Application Updated",
      "body": "Your application to Tech Corp was shortlisted.",
      "payload": {"application_id": "uuid"},
      "read_at": null,
      "created_at": "2026-10-07T10:00:00Z"
    }
  ]
}
```

### 2.2 Get Unread Count
- **Endpoint**: `GET /api/v1/notifications/unread-count`
- **Auth/RBAC**: Authenticated
- **Response**: `200 OK` `{"unread_count": 3}`

### 2.3 Mark Notification as Read
- **Endpoint**: `PATCH /api/v1/notifications/{id}/read`
- **Auth/RBAC**: Authenticated (Must own the notification, enforced by Gateway `X-User-Id` injection)
- **Response**: `200 OK` `{"id": "uuid", "read_at": "timestamp"}`

### 2.4 Alert Preferences
- **Endpoint**: `GET /api/v1/alert-preferences/` | `PUT /api/v1/alert-preferences/`
- **Auth/RBAC**: Authenticated
- **Request Body (PUT)**:
```json
{
  "preferences": [
    {
      "alert_type": "application_status",
      "channel": "in_app",
      "enabled": true,
      "quiet_start": "22:00",
      "quiet_end": "08:00"
    }
  ]
}
```

### 2.5 Real-Time WebSocket Connection
- **Endpoint**: `WS /ws/notifications/`
- **Protocol Details**: Client connects and authenticates. Server pushes JSON messages mirroring the `app.notification` schema upon new events.

---

## 3. Application API Contracts

*Backing Tables:* `public.applications` (existing), `app.application_status_event`

The integrated schema uses integer `jobs.id`, bigint `users.id`, and UUID application IDs. The M4 application lifecycle is `saved`, `applied`, `shortlisted`, `interview`, and `rejected`.

### 3.1 List Applications (Role Scoped)
- **Endpoint**: `GET /api/v1/applications/`
- **Auth/RBAC**: `JOB_SEEKER` sees own applications; `RECRUITER` sees applications for owned jobs; `ADMIN` sees all.
- **Response**: List of applications with current status from the M4 lifecycle above.

### 3.2 List Applicants for a Job (Recruiter)
- **Endpoint**: `GET /api/v1/jobs/{job_id}/applications`
- **Auth/RBAC**: `RECRUITER` (Must own the job posting)
- **Response**: `GET /api/v1/jobs/{job_id}/applications` returns applications for that owned job; job IDs are integers.

### 3.3 Update Application Status (Recruiter)
- **Endpoint**: `PATCH /api/v1/applications/{id}/status`
- **Auth/RBAC**: `RECRUITER` (Must own the associated job)
- **Request Body**:
```json
{
  "status": "interview",
  "metadata": {}
}
```
- **Behavior**: Enforces job ownership and allowed transitions. Updates `public.applications.status`; the database trigger records history and the service persists an in-app notification, attempts email, and publishes to the authenticated WebSocket group.

### 3.4 Get Application Timeline
- **Endpoint**: `GET /api/v1/applications/{id}/history`
- **Auth/RBAC**: `JOB_SEEKER` (if owns application) OR `RECRUITER` (if owns job)
- **Response**: List of `application_status_event` records (`from_status`, `to_status`, `occurred_at`).

---

## 4. Analytics API Contracts

*Backing Tables:* `app.daily_funnel_aggregate`, `app.daily_resume_performance_aggregate`, `app.daily_hiring_trend_aggregate`

### 4.1 Job Seeker Analytics
- **Endpoint**: `GET /api/v1/analytics/seeker/resume-performance`
- **Auth/RBAC**: `JOB_SEEKER`
- **Response**: `200 OK`
```json
{
  "application_funnel": {"saved": 0, "applied": 0, "shortlisted": 0, "interview": 0, "rejected": 0},
  "resume_performance": [],
  "skill_gaps": {"matched_skills": [], "missing_skills": []},
  "period_days": "30"
}
```

Applications are associated with the active resume version at submission. Per-version job views are not recorded and are reported as zero until a view event is implemented.

### 4.2 Recruiter Job Funnel
- **Endpoint**: `GET /api/v1/analytics/recruiter/job-funnel?job_id={id}`
- **Auth/RBAC**: `RECRUITER` (Must own job)
- **Response**: Aggregated data from `daily_funnel_aggregate`.

### 4.3 Admin Platform Trends
- **Endpoint**: `GET /api/v1/analytics/admin/hiring-trends`
- **Auth/RBAC**: `ADMIN`
- **Response**: Aggregated data from `daily_hiring_trend_aggregate`.

---

## 5. Competition API Contracts

*Backing Columns:* `jobs.applicant_count`, `jobs.competition_level`, `jobs.competition_updated_at`

### 5.1 Competition Detail Retrieval
- **Endpoint**: `GET /api/v1/jobs/{id}/competition`
- **Auth/RBAC**: Public (or matched to existing `/jobs/{id}` rules)
- **Response**: `200 OK`
```json
{
  "job_id": 101,
  "applicant_count": 12,
  "competition_level": "medium",
  "competition_updated_at": "timestamp"
}
```

### 5.2 Extended Job Search (Gateway pass-through extension)
- **Endpoint**: `GET /api/v1/jobs/search`
- **New Query Parameters**:
  - `competition_level` (e.g., `low`, `medium`)
  - `recent_only` (bool, correlates to early-applicant flag)

---

## 6. Environment Variable Plan

The following variables should be added to the Gateway and respective `.env` files (no hardcoded secrets).

**API Gateway (`Domain-1/.env`)**
```env
# New Routing Destinations
NOTIFICATION_SERVICE_URL=http://127.0.0.1:8004
APPLICATION_SERVICE_URL=http://127.0.0.1:8005
ANALYTICS_SERVICE_URL=http://127.0.0.1:8006

# WebSocket configuration
WS_GATEWAY_URL=ws://127.0.0.1:8004/ws
```

**Notification Service (`Domain-X/.env`)**
```env
# Pub/Sub for WebSockets
REDIS_URL=redis://127.0.0.1:6379/1

# Email Provider Config (Placeholders)
SMTP_HOST=smtp.mailprovider.com
SMTP_PORT=587
SMTP_USER=mock_user
SMTP_PASSWORD=mock_password
SENDER_EMAIL=noreply@swipex.app
```

**Analytics Service (`Domain-X/.env`)**
```env
# Cached aggregations
ANALYTICS_CACHE_TTL=3600
```

---

## 7. RBAC Summary Checklist

Gateway identity propagation (`X-User-Id`, `X-User-Role`) remains structurally identical to M1-M3.

- **JOB_SEEKER**: Has exclusive rights to their own notifications, alert preferences, application timeline (`/applications/`), and personal resume performance analytics. They receive `403 Forbidden` for recruiter/admin endpoints.
- **RECRUITER**: Can fetch the list of applicants for their *own* jobs, patch applicant statuses (`/applications/{id}/status`), and view their job's funnel analytics. Gateway validation logic will ensure they cannot mutate applications on jobs they do not own.
- **ADMIN**: Global read access to platform-wide hiring trends via `/analytics/admin/hiring-trends`.

---
*Created by: Intern 2 (Domain-1)*
