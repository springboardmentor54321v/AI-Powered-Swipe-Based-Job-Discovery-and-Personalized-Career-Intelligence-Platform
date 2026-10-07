# M4 Day 2 Report

**Domain:** Team-3/Domain-4/ (Frontend & User Experience)
**Author:** Intern 1 — Frontend & UX
**Milestone:** Milestone 4 — Notifications, Analytics & Deployment
**Date:** October 7, 2026
**Status:** Day 2 Objectives Accomplished & Verified

---

## Completed

1. **Dual-Mode Live Notification Stream & Resilient Polling Fallback**:
   - `NotificationBell.jsx`: Implemented dual-mode real-time architecture. Attempts live WebSocket connection on `ws://${host}/ws/notifications/?token=${token}`. If WebSocket is unreachable or blocked by Gateway/Nginx, gracefully falls back to clean, visibility-aware REST polling (`GET /api/v1/notifications/unread-count`).
   - Clean timer lifecycle: Only polls when `document.visibilityState === 'visible'` (at 45-second intervals). Clears all interval timers on window hide or component unmount to prevent resource leaks.
   - Synchronized unread badge: Synchronizes unread count across views and drops count immediately upon marking an alert as read.
   - Multi-tab and cross-view sync: Implemented `swipex:notification_read` event bus to synchronize unread count between the navigation bell, dropdown drawer, and full history page.

2. **Keyboard Accessibility & Dropdown Dismissal**:
   - Upgraded `NotificationBell.jsx`: Added `Escape` key listener alongside outside-click detection to cleanly close the popover.

3. **Job Competition & Early Applicant Pass-Through**:
   - `src/services/jobs.js`: Updated `normalizeJob` to preserve `early_applicant` / `is_early_applicant` attributes from backend payloads without dropping or fabricating values.
   - `JobCard.jsx`: Verified applicant counter, competition level badges (`Low`, `Medium`, `High`), and early applicant indicator.
   - `FilterBar.jsx` & `SwipeDiscoveryPage.jsx`: Verified `low_competition` and `recently_posted` filter parameters pass to the Job & Swipe service.

4. **Application Tracking ATS Workflow Verification**:
   - `JobSeekerApplicationsPage.jsx`: Merges swipe history with formal backend applications into a unified 5-stage tracking board (`SAVED`, `APPLIED`, `SHORTLISTED`, `INTERVIEW`, `REJECTED`).
   - `ApplicationStatusTimeline.jsx`: Audit event modal displays stage transitions, actor roles, and timestamps.
   - `RecruiterApplicationsPage.jsx`: Recruiter status transition flow (`Shortlist`, `Interview`, `Reject`) calls `PATCH /api/v1/applications/{id}/status` with confirmation modal and feedback banner.

5. **Role-Based Analytics Dashboards Verification**:
   - `JobSeekerOverviewPage.jsx`: Renders `ApplicationFunnelChart` and `SkillGapChart` derived from actual candidate applications and ATS evaluations.
   - `RecruiterOverviewPage.jsx`: Renders `ApplicationFunnelChart` and sourcing velocity statistics based on real candidate pipeline depth.
   - `AdminOverviewPage.jsx`: Renders `HiringTrendChart` displaying market competencies demand and Startup vs MNC distribution.
   - Zero fabricated numbers: Empty/loading/error states render properly when backend analytics data is unavailable.

6. **Alert Preferences Persistence**:
   - `AlertPreferencesPage.jsx`: Configurable settings form managing trigger types (`instant_job`, `startup_hiring`, `high_match`, `low_competition`), delivery channels (`in_app`, `email`), AI match threshold slider (70%–95%), and quiet hours schedule (`start`, `end`). Integrates directly with `GET` / `PUT /api/v1/alert-preferences/`.

7. **Production Build & Code Hygiene**:
   - `npm --prefix Team-3/Domain-4 run build` builds cleanly in 8.81s with 0 errors.
   - `git diff --check` passed with 0 issues.

---

## Partial

1. **Early Applicant Indicator**:
   - Frontend is fully compatible and displays the badge when present; backend Domain-2 does not yet compute/return `early_applicant` in `serialize_job`.

2. **Date-Range Analytics Filtering**:
   - Date range selector exists in UI, but backend aggregated views currently return fixed daily snapshots.

---

## Blocked

1. **Nginx Gateway Routing (Intern 5 / Platform)**:
   - `gateway/nginx.conf` does not proxy `/api/v1/notifications/`, `/api/v1/alert-preferences/`, `/api/v1/applications/`, `/api/v1/analytics/`, or `/ws/` to `auth-service:8000`. Direct access via Gateway returns 404 until Nginx is updated.
2. **WebSocket Proxying in Gateway (Intern 5 & Intern 2)**:
   - Requires Nginx `proxy_set_header Upgrade $http_upgrade` and `proxy_set_header Connection "upgrade"` for `/ws/`. Handled gracefully in frontend via REST polling fallback.
3. **Hardcoded Windows Path in Backend Analytics (Intern 2)**:
   - `Team-3/Domain-1/backend/apps/analytics_service/views.py` contains Windows path `r"r:\new projects\..."` which fails on Linux/Docker, causing analytics endpoints to return `{"error": "AI Engine not available"}`.

---

## Cross-Domain Findings

* **Domain-1 (`apps/notification_service`)**:
  - `MarkReadView` endpoint path is `PATCH /api/v1/notifications/<uuid:pk>/read`. Frontend service matches this exact contract.
* **Domain-1 (`apps/application_service`)**:
  - Provides `GET /api/v1/applications/`, `PATCH /api/v1/applications/{id}/status`, and `GET /api/v1/applications/{id}/history`. There is no `POST /api/v1/applications/` endpoint; applications originate from right-swipes in Domain 2.
* **Domain-2 (`SwipeX_Job_Data_Intelligence_Milestone1/app/main.py`)**:
  - `serialize_job` includes `applicant_count` and `competition_level` (`Low`, `Medium`, `High`), but does not calculate `early_applicant`.
* **Domain-3 (`Milestone4work/m4_app.py`)**:
  - Standalone FastAPI endpoints exist for alert evaluation and skill-gap analysis.

---

## API Verification

| Route | Method | Role | Status |
| :--- | :--- | :--- | :--- |
| `/api/v1/notifications/` | GET | Authenticated | Verified in service & history view |
| `/api/v1/notifications/unread-count` | GET | Authenticated | Verified in service & bell polling |
| `/api/v1/notifications/{id}/read` | PATCH | Authenticated | Verified in dropdown & history actions |
| `/api/v1/alert-preferences/` | GET, PUT | Authenticated | Verified in Alert Preferences page |
| `/api/v1/applications/` | GET | Candidate | Verified in Application Tracking Board |
| `/api/v1/applications/{id}/history` | GET | Authenticated | Verified in Application Timeline modal |
| `/api/v1/applications/{id}/status` | PATCH | Recruiter | Verified in Recruiter status change modal |
| `/api/v1/jobs` | GET | Public | Verified in JobCard & FilterBar |
| `/api/v1/analytics/seeker/resume-performance` | GET | Candidate | Verified in Seeker Overview |
| `/api/v1/analytics/recruiter/job-funnel` | GET | Recruiter | Verified in Recruiter Overview |
| `/api/v1/analytics/admin/hiring-trends` | GET | Admin | Verified in Admin Overview |

---

## WebSocket Verification

- Protocol: `ws://${host}/ws/notifications/?token=${token}`
- Channels consumer: `NotificationConsumer` in `apps/notification_service/consumers.py`
- Authentication middleware: `JWTAuthMiddleware` extracting JWT token from query string
- Graceful degradation: On connection error or close, frontend activates visibility-aware REST polling (45s interval) and keeps unread count synchronized.

---

## Analytics Verification

- **Job Seeker**: Displays actual application funnel from swipe/application history, matched skills, and identified skill gaps from ATS analysis.
- **Recruiter**: Displays applicant pipeline funnel with conversion percentage from swipes to active stages.
- **Admin**: Displays platform-wide distributions, in-demand skills, and Startup vs. MNC requisitions ratio.
- No fabricated random metrics.

---

## Application Tracking Verification

- 5 stages supported: `SAVED`, `APPLIED`, `SHORTLISTED`, `INTERVIEW`, `REJECTED`.
- Desktop view: 5-column Kanban layout.
- Mobile view: Horizontal scrollable stage selector.
- Recruiter mutations: Confirmation modal before status patch with loading indicators and error banners.

---

## Competition Verification

- `applicant_count` rendered on all job cards.
- `competition_level` badges (`Low`, `Medium`, `High`) with appropriate color coding.
- `early_applicant` badge conditionally rendered without fabricating values.
- Search filters: `low_competition` and `recently_posted` query parameters pass seamlessly to backend.

---

## Responsive/UX Changes

- Added `Escape` key close listener to `NotificationBell.jsx` dropdown.
- Mobile popover width capped at `w-[calc(100vw-2rem)]` to prevent viewport horizontal overflow.
- Mobile tabbed stage switcher in `ApplicationTrackingBoard.jsx` ensures usable layout on small screens.
- Chart containers are fluid and responsive across desktop, tablet, and mobile.

---

## Build/Test Results

- **Vite Production Build**:
  ```bash
  npm --prefix Team-3/Domain-4 run build
  ```
  Result: Exited with code `0` in `8.81s`. Zero syntax errors, zero missing imports.
- **Git Formatting Integrity**:
  ```bash
  git diff --check
  ```
  Result: Exited with code `0`. Clean diff with zero trailing whitespace.

---

## Files Changed

### Modified Existing Files
* `Team-3/Domain-4/src/services/jobs.js`
* `Team-3/Domain-4/src/components/notifications/NotificationBell.jsx`
* `Team-3/Domain-4/src/App.jsx`
* `Team-3/Domain-4/src/components/JobCard.jsx`
* `Team-3/Domain-4/src/layouts/RoleDashboardShell.jsx`
* `Team-3/Domain-4/src/pages/dashboard/jobseeker/JobSeekerApplicationsPage.jsx`
* `Team-3/Domain-4/src/pages/dashboard/jobseeker/JobSeekerOverviewPage.jsx`
* `Team-3/Domain-4/src/pages/dashboard/recruiter/RecruiterApplicationsPage.jsx`
* `Team-3/Domain-4/src/pages/dashboard/recruiter/RecruiterOverviewPage.jsx`
* `Team-3/Domain-4/src/pages/dashboard/admin/AdminOverviewPage.jsx`

### Created New Files
* `Team-3/Domain-4/M4_RECOVERY_STATUS.md`
* `Team-3/Domain-4/M4_DAY2_REPORT.md`
* `Team-3/Domain-4/src/services/notifications.js`
* `Team-3/Domain-4/src/services/applications.js`
* `Team-3/Domain-4/src/services/alertPreferences.js`
* `Team-3/Domain-4/src/services/analytics.js`
* `Team-3/Domain-4/src/components/notifications/NotificationDropdown.jsx`
* `Team-3/Domain-4/src/components/notifications/NotificationItem.jsx`
* `Team-3/Domain-4/src/components/applications/ApplicationTrackingBoard.jsx`
* `Team-3/Domain-4/src/components/applications/ApplicationStatusTimeline.jsx`
* `Team-3/Domain-4/src/components/analytics/MetricCard.jsx`
* `Team-3/Domain-4/src/components/analytics/ApplicationFunnelChart.jsx`
* `Team-3/Domain-4/src/components/analytics/ResumePerformanceChart.jsx`
* `Team-3/Domain-4/src/components/analytics/SkillGapChart.jsx`
* `Team-3/Domain-4/src/components/analytics/HiringTrendChart.jsx`
* `Team-3/Domain-4/src/pages/dashboard/NotificationHistoryPage.jsx`
* `Team-3/Domain-4/src/pages/dashboard/AlertPreferencesPage.jsx`

---

## Remaining Work for Day 3

1. **Verify Gateway Proxy Integration**:
   - Coordinate with Intern 5 to ensure Gateway proxies `/api/v1/notifications/`, `/api/v1/applications/`, `/api/v1/alert-preferences/`, and `/api/v1/analytics/`.
2. **End-to-End Live Staging Smoke Check**:
   - Rehearse the complete candidate workflow: sign in → upload resume → swipe apply → receive alert → track application stage → view analytics.
3. **Demo Rehearsal & Documentation**:
   - Verify presentation flow across Candidate, Recruiter, and Admin role workspaces.
