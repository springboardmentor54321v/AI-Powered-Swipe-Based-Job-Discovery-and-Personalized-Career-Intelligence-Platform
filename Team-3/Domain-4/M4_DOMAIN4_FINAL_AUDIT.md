# Milestone 4 — Domain-4 Final Audit Matrix

**Author:** Intern 1 — Frontend & User Experience  
**Scope:** Team-3/Domain-4/  
**Milestone:** Milestone 4 — Notifications, Analytics & Deployment  
**Date:** October 8, 2026  
**Authoritative Reference:** Official Milestone 4 SRS Specification  

---

## 1. Requirement Status Matrix

| Requirement | Domain-4 Status | Evidence | Dependency | Remaining Work |
| :--- | :--- | :--- | :--- | :--- |
| **FR-01: Notifications** | PARTIAL / BLOCKED | `NotificationBell.jsx` dual-mode (WebSocket + 45s visibility-aware REST polling fallback), `NotificationDropdown.jsx`, `NotificationItem.jsx`, `NotificationHistoryPage.jsx`, `notifications.js` (`GET /unread-count`, `GET /notifications/`, `PATCH /{id}/read`). | Domain 5 Nginx gateway routes (`/api/v1/notifications/`, `/ws/`) missing. | Intern 5 (Domain 5) to update `gateway/nginx.conf` with location blocks. |
| **FR-02: Alert Types** | PARTIAL / BLOCKED | Full frontend support for 5 alert types: `instant_job`, `startup_hiring`, `high_match`, `low_competition`, `application_status`. Filterable archive and type-specific badge styling. | Domain 1 backend notification generator & Domain 5 Gateway routing. | Intern 2 (Domain 1) trigger pipeline; Intern 5 Gateway proxy. |
| **FR-03: Alert Preferences** | PARTIAL / BLOCKED | `AlertPreferencesPage.jsx`, `alertPreferences.js`. Manages alert category toggles, delivery channels (`in_app`, `email`), match threshold slider (70%–95%), and quiet hours (`start`, `end`). Contract mirrors backend `AlertPreference` model. | Domain 5 Nginx gateway routes (`/api/v1/alert-preferences/` missing). | Intern 5 (Domain 5) to proxy `/api/v1/alert-preferences/`. |
| **FR-04: Application Tracking** | PARTIAL / BLOCKED | `ApplicationTrackingBoard.jsx` (5 stages: Saved, Applied, Shortlisted, Interview, Rejected; desktop Kanban & mobile tabs), `ApplicationStatusTimeline.jsx` (audit history modal), `JobSeekerApplicationsPage.jsx`, `RecruiterApplicationsPage.jsx` (`PATCH /status`), `applications.js`. | Domain 5 Gateway lacks `/api/v1/applications/` route. Backend lacks `POST /applications/` (originates from swipes). | Intern 5 (Domain 5) to add Nginx location block. |
| **FR-05: Job Freshness & Competition** | COMPLETE | `JobCard.jsx` displays applicant count, Low/Medium/High competition badges, relative posted time, and `early_applicant` pass-through. `FilterBar.jsx` passes `low_competition` and `recently_posted` query parameters. Zero fake numbers. | Domain 2 data layer computes competition level. `early_applicant` field not yet populated in backend `serialize_job`. | Domain 2 optional computation of `early_applicant` boolean. |
| **FR-06: Job Seeker Analytics** | COMPLETE | `JobSeekerOverviewPage.jsx` integrates `ApplicationFunnelChart` (conversion rates, client-side date range filtering), `SkillGapChart` (verified strengths vs opportunities from ATS), `ResumePerformanceChart` (CV revisions), and `MetricCard`. Honest fallback notices. | Domain 1 / Domain 3 AI engine integration. Handled via local application telemetry. | Intern 2 (Domain 1) Linux import path fix in `views.py`. |
| **FR-07: Recruiter Analytics** | COMPLETE | `RecruiterOverviewPage.jsx` integrates `ApplicationFunnelChart` with date range and requisition filtering, `MetricCard` summary grid, sourcing velocity metrics (conversion rate, active pipeline depth). Zero fake analytics. | Domain 1 recruiter funnel endpoint (`/analytics/recruiter/job-funnel`). | Intern 2 (Domain 1) date range parameter processing. |
| **FR-08: Hiring Trends** | COMPLETE | `AdminOverviewPage.jsx` and `HiringTrendChart.jsx` render top demanded skills and Startup vs. MNC requisition ratio. Handles both Domain-1 and Domain-3 schemas, displays engine error notices, and computes real catalog aggregates from database jobs. | Domain 1 / Domain 3 AI engine (`insights_and_trends.py`). | Intern 2 (Domain 1) Linux import path fix. |
| **FR-09: RBAC** | COMPLETE | `App.jsx` strict `RoleRoute` and `ProtectedRoute` guards for `job_seeker`, `recruiter`, `admin`. `RoleDashboardShell.jsx` role-specific workspaces, navigation items, and header perspectives. Redirection of unauthorized accesses. | None (Frontend enforcement complete; validated against backend JWT claims). | None. |
| **FR-10: Security** | COMPLETE | Sanitized JWT session storage, automatic `Authorization: Bearer` injection, 401 interceptor with silent token refresh, sanitized error logging, zero exposed secrets or sensitive keys. | Backend JWT authentication and refresh endpoint. | None. |
| **FR-11: Production Deployment** | BLOCKED | Frontend build verified (`vite build` in 8.99s, exit code 0). Docker multi-stage build scaffolded in `Dockerfile`. Production asset optimization verified. | Domain 5 owns cloud hosting, staging infrastructure, Nginx reverse proxy, and Docker Compose stack. | Intern 5 (Domain 5) to complete cloud deployment. |
| **FR-12: Production E2E** | BLOCKED | All frontend workflows, states, error boundaries, and interactions verified in isolation. Full user journeys simulated and verified. | Live multi-service Docker stack is currently offline; Gateway Nginx lacks M4 routes. | Full stack boot-up by Domain 5 for live cross-service test. |

---

## 2. Requirement Classification Summary

- **COMPLETE (Frontend Ownership Complete & Verified):**
  - **FR-05**: Job Freshness & Competition
  - **FR-06**: Job Seeker Analytics
  - **FR-07**: Recruiter Analytics
  - **FR-08**: Hiring Trends
  - **FR-09**: Role-Based Access Control (RBAC)
  - **FR-10**: Security & Token Hygiene

- **PARTIAL / BLOCKED (Frontend Complete, External Gateway/API Blocked):**
  - **FR-01**: Notifications (Gateway `/api/v1/notifications/` & `/ws/` missing)
  - **FR-02**: Alert Types (Gateway proxy missing)
  - **FR-03**: Alert Preferences (Gateway `/api/v1/alert-preferences/` missing)
  - **FR-04**: Application Tracking (Gateway `/api/v1/applications/` missing)

- **BLOCKED BY INFRASTRUCTURE (Domain 5 Scope):**
  - **FR-11**: Production Deployment
  - **FR-12**: Production E2E Multi-Service Validation

---

## 3. Cross-Domain Dependency Audit

| Domain | Dependency Item | Expected Contract | Actual Status | Impact on Domain-4 | Workaround / Fallback in Domain-4 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Domain 5** | Nginx M4 Route Proxying | `/api/v1/notifications/`<br>`/api/v1/alert-preferences/`<br>`/api/v1/applications/`<br>`/api/v1/analytics/` | ❌ Missing in `gateway/nginx.conf` | Public calls to port 8080 return HTTP 404 | Dual-mode fallback to local state / direct service port |
| **Domain 5** | WebSocket Upgrade Proxy | `/ws/notifications/` with `Upgrade: websocket` | ❌ Missing in `gateway/nginx.conf` | WebSocket connection fails | Automatic REST polling fallback (`45s` visibility-aware interval) |
| **Domain 1** | Linux AI Engine Import | `apps/analytics_service/views.py` importing Domain-3 engine | ❌ Hardcoded Windows path `r"r:\..."` causes `ImportError` | Analytics routes return `{"error": "AI Engine not available"}` | Honest engine error state banner + computation from real database jobs |
| **Domain 1** | Application Creation Route | `POST /api/v1/applications/` | ❌ Does not exist | Applications cannot be created via standalone endpoint | Reconciled via swipe history (`POST /api/v1/swipes/`) |
| **Domain 2** | Early Applicant Flag | `serialize_job` returning `early_applicant: boolean` | ⚠️ Field not computed in Python backend | `early_applicant` is undefined in payload | Normalized as falsy; rendered dynamically if provided without inventing fake data |
| **Domain 5** | Production Staging Hosting | Cloud container deployment & TLS | ❌ Staging environment not provisioned | Public URL unavailable | Production bundle verified locally (`dist/` build exit code 0) |

---

## 4. Final Audit Verdict

The **Domain-4 frontend implementation for Milestone 4 is 100% COMPLETE**. All UI components, services, charts, filters, responsive breakpoints, loading/error states, and M1–M3 regressions are verified.

Overall Milestone 4 full-stack live integration is **PARTIAL / BLOCKED** strictly by external platform infrastructure owned by Domain 5 (Gateway Nginx routes & staging deployment) and Domain 1 (Linux path import).
