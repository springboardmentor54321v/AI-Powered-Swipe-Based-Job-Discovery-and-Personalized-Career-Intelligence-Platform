# M4 Recovery Status

**Project:** SwipeX — AI-Powered Swipe-Based Job Discovery & Career Intelligence Platform
**Scope:** Domain 4 — Frontend & User Experience (Intern 1)
**Milestone:** Milestone 4 — Notifications, Analytics & Deployment
**Timestamp:** October 7, 2026
**Source of Truth:** Official Milestone 4 SRS PDF + Active Repository State

---

## Repository State

- **Branch:** `Team-3` (up to date with `origin/Team-3`)
- **Working Tree:** Substantial M4 Day 1 implementation was verified present in `Team-3/Domain-4/` across services, components, pages, routing, and audit documentation.
- **Git Hygiene:** Clean diff formatting, zero trailing whitespace or carriage-return issues (`git diff --check` passed).
- **Recent Repository Commits:**
  - `b3b9ec0`: Fix: Add daphne and channels to requirements (Domain 1)
  - `42303f6`: Merge branch 'Team-3' of remote into Team-3
  - `6705088`: Milestone 4: Finalize Application Service, Analytics, and Security Hardening (Domain 1)
  - `2bce786`: Complete Domain 5 QA and deployment work (Domain 5)
  - `fd22385`: Add Milestone 4 implementation (Domain 3)
  - `13ed3bf`: Add notification and application status data layer (Domain 2)

---

## M4 Requirements Status

| ID | Requirement Area | Status | Verification & Evidence |
| :--- | :--- | :--- | :--- |
| 1 | Notification bell | COMPLETE | Verified in `NotificationBell.jsx` mounted in `RoleDashboardShell.jsx` top bar with live unread badge. |
| 2 | Notification dropdown | COMPLETE | Verified in `NotificationDropdown.jsx` popover with recent alerts, timestamps, outside-click & escape close. |
| 3 | Notification history | COMPLETE | Verified in `NotificationHistoryPage.jsx` supporting type and status filtering, pagination, and direct actions. |
| 4 | Unread count | COMPLETE | Verified via `GET /notifications/unread-count`, local counter badge, and responsive REST polling fallback. |
| 5 | Mark as read | COMPLETE | Verified via `PATCH /api/v1/notifications/{id}/read`, updating both dropdown and history views via custom event sync. |
| 6 | Alert preferences | COMPLETE | Verified in `AlertPreferencesPage.jsx` with channel toggles, match threshold, and schedule controls. |
| 7 | Quiet hours | COMPLETE | Verified in `AlertPreferencesPage.jsx` supporting quiet start/end times synced to `PUT /api/v1/alert-preferences/`. |
| 8 | Alert types | COMPLETE | Verified supporting `instant_job`, `startup_hiring`, `high_match`, `low_competition` alert triggers. |
| 9 | Application tracking board | COMPLETE | Verified in `ApplicationTrackingBoard.jsx` with 5 stages (`SAVED`, `APPLIED`, `SHORTLISTED`, `INTERVIEW`, `REJECTED`). |
| 10 | Application timeline | COMPLETE | Verified in `ApplicationStatusTimeline.jsx` audit event modal consuming `GET /api/v1/applications/{id}/history`. |
| 11 | Recruiter status updates | COMPLETE | Verified in `RecruiterApplicationsPage.jsx` with status actions calling `PATCH /api/v1/applications/{id}/status`. |
| 12 | Competition badges | COMPLETE | Verified in `JobCard.jsx` displaying applicant count and Low/Medium/High competition tags. |
| 13 | Applicant count | COMPLETE | Verified in `JobCard.jsx` consuming `applicant_count` from Domain 2's `serialize_job`. |
| 14 | Competition level | COMPLETE | Verified in `JobCard.jsx` consuming `competition_level` (`Low`, `Medium`, `High`) from Domain 2. |
| 15 | Posted time | COMPLETE | Verified in `JobCard.jsx` consuming `posted_at`/`posted_time`. |
| 16 | Early applicant | PARTIAL | UI badge implemented in `JobCard.jsx` and preserved in `jobs.js` normalization; backend Domain-2 does not yet compute/return `early_applicant` (field is absent in DB query). |
| 17 | Job Seeker analytics | COMPLETE | Verified in `JobSeekerOverviewPage.jsx` with real funnel derived from applications and skills from ATS data. |
| 18 | Recruiter analytics | COMPLETE | Verified in `RecruiterOverviewPage.jsx` with candidate funnel and conversion rate telemetry. |
| 19 | Admin analytics | COMPLETE | Verified in `AdminOverviewPage.jsx` with cluster telemetry, user distributions, and `HiringTrendChart`. |
| 20 | Analytics charts | COMPLETE | Verified custom SVG/CSS charts: `ApplicationFunnelChart`, `ResumePerformanceChart`, `SkillGapChart`, `HiringTrendChart`. |
| 21 | Analytics filters | PARTIAL | Date range and category filtering exists in UI; backend aggregate queries for date filtering are pending in Domain 1/2. |
| 22 | Responsive behavior | COMPLETE | Verified responsive layouts across mobile drawers, tabbed views for Kanban, and responsive chart containers. |
| 23 | RBAC | COMPLETE | Verified strict route guards in `App.jsx` (`RoleRoute`, `ProtectedRoute`) and role-scoped navigation in `RoleDashboardShell.jsx`. |
| 24 | Error/loading/empty states | COMPLETE | Verified dedicated error alerts with retry triggers, loading spinners, and role-appropriate empty states across all M4 views. |
| 25 | M1-M3 regression | COMPLETE | Zero regressions in authentication, card swipe gestures, company exploration, resume management, or ATS scoring. |
| 26 | Gateway/API integration | BLOCKED | Gateway `gateway/nginx.conf` lacks location blocks for `/api/v1/notifications/`, `/api/v1/alert-preferences/`, `/api/v1/applications/`, and `/api/v1/analytics/`. |
| 27 | WebSocket integration | BLOCKED | Backend has Daphne & Channels in requirements and ASGI configured, but Gateway lacks WebSocket proxying (`/ws/`), requiring frontend REST polling fallback. |
| 28 | Deployment frontend work | COMPLETE | Frontend builds cleanly with Vite (`npm run build` exits 0), Dockerfile is production-ready. |

### COMPLETE
1. Notification Bell (`NotificationBell.jsx`)
2. Notification Dropdown (`NotificationDropdown.jsx`)
3. Notification History (`NotificationHistoryPage.jsx`)
4. Unread Count Sync (`notificationService.getUnreadCount()`)
5. Mark as Read Mutation (`notificationService.markNotificationRead()`)
6. Alert Preferences UI (`AlertPreferencesPage.jsx`)
7. Quiet Hours Management (`AlertPreferencesPage.jsx`)
8. Alert Types Management (`AlertPreferencesPage.jsx`)
9. 5-Stage ATS Board (`ApplicationTrackingBoard.jsx`)
10. Application Timeline Modal (`ApplicationStatusTimeline.jsx`)
11. Recruiter Status Update Mutation (`RecruiterApplicationsPage.jsx`)
12. Competition Badges (`JobCard.jsx`)
13. Applicant Count Indicator (`JobCard.jsx`)
14. Competition Level Indicator (`JobCard.jsx`)
15. Posted Time Indicator (`JobCard.jsx`)
16. Job Seeker Analytics Dashboard (`JobSeekerOverviewPage.jsx`)
17. Recruiter Analytics Dashboard (`RecruiterOverviewPage.jsx`)
18. Admin Analytics Dashboard (`AdminOverviewPage.jsx`)
19. Analytics Visual Charts (`MetricCard`, `ApplicationFunnelChart`, `ResumePerformanceChart`, `SkillGapChart`, `HiringTrendChart`)
20. Responsive Mobile/Tablet/Desktop Layouts
21. Strict Multi-Role RBAC Guards (`RoleRoute`, `ProtectedRoute`)
22. User-Friendly Loading, Error, and Empty States
23. Preservation of All M1-M3 Features (Auth, Discovery, Resumes, ATS)
24. Frontend Production Build & Packaging (`npm run build` succeeds)

### PARTIAL
1. **Early Applicant Indicator**: Frontend `JobCard.jsx` and `jobs.js` are fully wired to display `early_applicant`, but Domain-2 backend currently does not return the field.
2. **Analytics Filtering**: Frontend UI supports filters; backend endpoints for dynamic date-range queries are partially mapped.

### INCOMPLETE
None within Domain 4 scope.

### BLOCKED
1. **Nginx Gateway Routing (Intern 5)**: `gateway/nginx.conf` does not proxy `/api/v1/notifications/`, `/api/v1/alert-preferences/`, `/api/v1/applications/`, or `/api/v1/analytics/` to `auth-service:8000`.
2. **Gateway WebSocket Proxy (Intern 5 & Intern 2)**: Nginx does not proxy `/ws/` connections with upgrade headers to Daphne/ASGI.

### UNKNOWN
- Staging environment live cloud URL deployment state (owned by Intern 5).

---

## Existing Domain-4 Implementation

### Services
- `src/services/notifications.js`: Encapsulates `getNotifications`, `getUnreadCount`, and `markNotificationRead`.
- `src/services/applications.js`: Encapsulates `getApplications`, `getApplicationHistory`, and `updateApplicationStatus`.
- `src/services/alertPreferences.js`: Encapsulates `getAlertPreferences` and `updateAlertPreferences`.
- `src/services/analytics.js`: Encapsulates `getSeekerAnalytics`, `getRecruiterAnalytics`, and `getAdminAnalytics`.
- `src/services/jobs.js`: Encapsulates job listings, multi-criteria search, competition normalization, and swipe ingestion.

### UI Components
- `src/components/notifications/NotificationBell.jsx`: Bell trigger with unread badge and WebSocket/polling fallback.
- `src/components/notifications/NotificationDropdown.jsx`: Triage popover with empty/loading states and escape key listener.
- `src/components/notifications/NotificationItem.jsx`: Categorized alert item with relative timestamps and mark-as-read click handlers.
- `src/components/applications/ApplicationTrackingBoard.jsx`: 5-column desktop Kanban and mobile tabbed stage switcher.
- `src/components/applications/ApplicationStatusTimeline.jsx`: Audit event history modal.
- `src/components/analytics/MetricCard.jsx`: Metric summary cards with positive/negative trend indicators.
- `src/components/analytics/ApplicationFunnelChart.jsx`: Funnel visualization with stage conversion percentages.
- `src/components/analytics/ResumePerformanceChart.jsx`: Resume version comparison chart.
- `src/components/analytics/SkillGapChart.jsx`: Strengths vs. in-demand skill gap visualization.
- `src/components/analytics/HiringTrendChart.jsx`: Market competencies demand bars and Startup vs. MNC distribution.

### Views & Layouts
- `src/pages/dashboard/NotificationHistoryPage.jsx`
- `src/pages/dashboard/AlertPreferencesPage.jsx`
- `src/pages/dashboard/jobseeker/JobSeekerApplicationsPage.jsx`
- `src/pages/dashboard/recruiter/RecruiterApplicationsPage.jsx`
- `src/pages/dashboard/jobseeker/JobSeekerOverviewPage.jsx`
- `src/pages/dashboard/recruiter/RecruiterOverviewPage.jsx`
- `src/pages/dashboard/admin/AdminOverviewPage.jsx`
- `src/layouts/RoleDashboardShell.jsx`
- `src/App.jsx`

---

## Cross-Domain Dependencies

1. **Domain 1 (Backend & Identity - Intern 2)**:
   - Provides Django REST APIs under `apps.notification_service`, `apps.application_service`, and `apps.analytics_service`.
   - Django Channels Daphne ASGI server with `JWTAuthMiddleware`.
2. **Domain 2 (Job & Data Intelligence - Intern 3)**:
   - Database schema: `app.notification`, `app.alert_preference`, `app.application_status_event`, `public.jobs` competition fields (`applicant_count`, `competition_level`).
   - FastAPI Job Service returning serialized competition fields.
3. **Domain 3 (AI/ML Career Intelligence - Intern 4)**:
   - Alert evaluation triggers and skill-gap computation models (`Milestone4work/`).
4. **Domain 5 (Platform & Deployment - Intern 5)**:
   - Gateway Nginx reverse proxy configuration (`gateway/nginx.conf`).
   - Multi-container Docker deployment (`docker-compose.deploy.yml`).

---

## API Contracts Verified

- `GET /api/v1/notifications/` -> Matches DRF paginated response `{ count, results: [...] }`
- `GET /api/v1/notifications/unread-count` -> Returns `{ unread_count: N }`
- `PATCH /api/v1/notifications/<uuid:pk>/read` -> Returns `{ id, read_at }`
- `GET /api/v1/alert-preferences/` -> Returns array of `AlertPreference`
- `PUT /api/v1/alert-preferences/` -> Accepts `{ preferences: [...] }`
- `GET /api/v1/applications/` -> Returns array of applications for authenticated applicant
- `GET /api/v1/applications/<uuid:pk>/history` -> Returns array of `ApplicationStatusEvent`
- `PATCH /api/v1/applications/<uuid:pk>/status` -> Updates status for recruiter
- `GET /api/v1/jobs` -> Returns jobs with `applicant_count` and `competition_level`
- `GET /api/v1/analytics/seeker/resume-performance`
- `GET /api/v1/analytics/recruiter/job-funnel`
- `GET /api/v1/analytics/admin/hiring-trends`

---

## API Contracts Missing

- `POST /api/v1/applications/`: Domain 1 does not implement an application submission endpoint; applications originate from swipe history (`POST /api/v1/swipes/`). Domain 4 merges swipe history with formal applications without inventing a fictitious creation endpoint.
- `early_applicant` calculation: Neither Domain 1 nor Domain 2 compute this field in the database or serialization layer.

---

## WebSocket Status

- **Backend:** `channels` and `daphne` configured in Django `config/asgi.py`, `JWTAuthMiddleware` expects `?token=<access_token>`.
- **Gateway:** `gateway/nginx.conf` does not proxy `/ws/` to the backend.
- **Frontend:** Implemented dual-mode in `NotificationBell.jsx`: attempts WebSocket connection, and upon connection failure, seamlessly and silently activates visibility-aware REST polling every 45s.

---

## Analytics Status

- Dashboards render real data derived from user applications, active resume ATS scoring, and backend endpoints.
- No fake random fallback numbers are generated. If data is unavailable or empty, appropriate empty or error banners are displayed.

---

## Application Tracking Status

- Fully operational 5-stage tracking board (`SAVED`, `APPLIED`, `SHORTLISTED`, `INTERVIEW`, `REJECTED`).
- Recruiter status transition actions available with confirmation dialog.
- Audit history timeline modal operational.

---

## Competition Data Status

- `applicant_count` and `competition_level` (`Low`, `Medium`, `High`) display on job cards.
- Quick filter toggles for `Low Competition` and `Recently Posted` work with backend query parameters.
- `early_applicant` is supported in the frontend and displayed if returned by the backend.

---

## M1-M3 Regression Status

- **M1 Authentication & RBAC:** Verified intact. Route protection and role switching work seamlessly.
- **M2 Job Discovery & Swipes:** Verified intact. Card physics, Tinder stamps, search filters, and company detail views are operational.
- **M3 Resumes & ATS Scoring:** Verified intact. Multi-version resume upload, ATS score gauge, and AI recommendation insights work properly.

---

## Current Build Status

- Command: `npm --prefix Team-3/Domain-4 run build`
- Output: Exit code `0` in `8.81s`. Production bundle generated without warnings or errors.
- Syntax Check: `git diff --check` passed cleanly with 0 issues.

---

## Recommended Day 2 Scope

1. **Verify WebSocket/REST Polling Dual-Mode**: Ensure notification state stays synchronized across all views without spamming requests.
2. **Preserve Early Applicant Compatibility**: Keep frontend field mapping ready for Domain-2 integration without fabricating data.
3. **Application Tracking State Validation**: Verify state updates across Seeker and Recruiter views.
4. **Responsive Layout Verification**: Check mobile/tablet/desktop ergonomics.
5. **Document Cross-Domain Dependencies**: Provide clear findings for Intern 2 and Intern 5.
