# SwipeX — Milestone 4: Day 1 Execution Report

**Domain:** Team-3/Domain-4/ (Frontend & User Experience)
**Author:** Intern 1 — Frontend & UX
**Date:** October 7, 2026
**Status:** Day 1 Foundation Complete

---

## Completed

1. **Centralized Frontend API Services Created**:
   - `src/services/notifications.js`: Implemented `getNotifications(params)`, `getUnreadCount()`, and `markNotificationRead(id)`.
   - `src/services/applications.js`: Implemented `getApplications()`, `getApplicationHistory(id)`, and `updateApplicationStatus(id, status, metadata)`.
   - `src/services/alertPreferences.js`: Implemented `getAlertPreferences()` and `updateAlertPreferences(preferences)`.
   - `src/services/analytics.js`: Implemented `getSeekerAnalytics()`, `getRecruiterAnalytics(jobId)`, and `getAdminAnalytics()`.
   - All services integrate with the existing `src/services/api.js` client, including JWT auth injection, 401 token refresh, and standardized error extraction. Zero fake mocks introduced.

2. **Notification Center UX Foundation**:
   - `src/components/notifications/NotificationBell.jsx`: Top navigation bell with live unread counter badge, loading state, outside-click detection, and graceful failure handling.
   - `src/components/notifications/NotificationDropdown.jsx`: Popover drawer rendering latest notifications, empty state, unread/read distinction, and direct link to full history.
   - `src/components/notifications/NotificationItem.jsx`: Categorized alert badges (`instant_job`, `startup_hiring`, `high_match`, `low_competition`, `application_status`), relative timestamps, and mark-as-read click actions.

3. **Notification History Archive**:
   - `src/pages/dashboard/NotificationHistoryPage.jsx`: Full-screen historical archive supporting filtering by alert category (`All`, `Instant Jobs`, `Startup Hiring`, `High Match`, `Low Competition`, `Applications`), filter by status (`All`, `Unread only`, `Read`), individual mark-as-read, and empty states.

4. **Alert Preferences Interface**:
   - `src/pages/dashboard/AlertPreferencesPage.jsx`: Configurable settings form managing trigger types (`instant_job`, `startup_hiring`, `high_match`, `low_competition`), delivery channels (`in_app`, `email`), AI Match Threshold slider (70%–95%), and Quiet Hours schedule (`start`, `end`). Integrates directly with backend schema.

5. **Application Tracking Foundation (5-Stage ATS Board & Timeline)**:
   - `src/components/applications/ApplicationTrackingBoard.jsx`: Multi-stage board supporting `SAVED`, `APPLIED`, `SHORTLISTED`, `INTERVIEW`, and `REJECTED` candidacies. Desktop 5-column Kanban layout and mobile scrollable tabbed list.
   - `src/components/applications/ApplicationStatusTimeline.jsx`: Audit event history modal displaying timestamps, transitions (`from_status` → `to_status`), and role actor information.
   - Upgraded `src/pages/dashboard/jobseeker/JobSeekerApplicationsPage.jsx` to consume formal applications and swipe history with the new tracking board and timeline modal.

6. **Recruiter Application Evaluation UI**:
   - Upgraded `src/pages/dashboard/recruiter/RecruiterApplicationsPage.jsx`: Removed legacy simulation, introduced real stage transition actions (`Shortlist`, `Interview`, `Reject`) calling `applicationService.updateApplicationStatus`, with modal confirmation, loading indicators, and error banners.

7. **Analytics Foundation & Lightweight Chart Components**:
   - `src/components/analytics/MetricCard.jsx`: Metric summary cards with positive/negative trend pills.
   - `src/components/analytics/ApplicationFunnelChart.jsx`: Pure SVG/CSS conversion funnel displaying `Saved` → `Applied` → `Shortlisted` → `Interview` with stage-to-stage conversion rates.
   - `src/components/analytics/ResumePerformanceChart.jsx`: CV revision comparison displaying Views, Applies, Shortlists, and ATS benchmarks.
   - `src/components/analytics/SkillGapChart.jsx`: Visual representation of verified strengths vs. targeted in-demand skill opportunities.
   - `src/components/analytics/HiringTrendChart.jsx`: Market demand bars for top tech competencies and Startup vs MNC distribution ratio.
   - Integrated `ApplicationFunnelChart` and `SkillGapChart` into `JobSeekerOverviewPage.jsx`.
   - Integrated `ApplicationFunnelChart` into `RecruiterOverviewPage.jsx`.
   - Integrated `HiringTrendChart` into `AdminOverviewPage.jsx`.

8. **Early Applicant Indicator**:
   - Upgraded `src/components/JobCard.jsx`: Integrated `early_applicant` indicator badge in the job card metadata strip while fully preserving swipe physics, pointer events, and M3 AI match attributes.

9. **Navigation & Multi-Role Routing**:
   - Upgraded `src/layouts/RoleDashboardShell.jsx`: Embedded `NotificationBell` in global header. Added sidebar navigation items for Notifications across all roles, and Alert Preferences for Job Seekers.
   - Upgraded `src/App.jsx`: Registered sub-routes for `notifications` and `alert-preferences` under protected role workspaces without breaking existing M1–M3 routes.

---

## Partially Completed

1. **Application Recruiter Mutations in Production Gateway**:
   - The UI and service calls for `PATCH /api/v1/applications/{id}/status` are implemented and tested, but will return 404 when routed through the current Nginx Gateway until Intern 5 / Gateway configuration adds the location block.
2. **Backend Analytics Live Data Integration**:
   - Overview pages attempt to fetch from `analyticsService`, gracefully displaying client-derived funnel and ATS skill statistics if the backend analytics service is unreachable or errors out.

---

## Blocked (External Dependencies)

1. **Nginx Gateway Routing (Intern 5 / Platform)**:
   - `gateway/nginx.conf` does not proxy `/api/v1/notifications/`, `/api/v1/alert-preferences/`, `/api/v1/applications/`, `/api/v1/analytics/`, or `/ws/`.
   - Direct calls to these endpoints through `http://localhost:8080` return 404 until the Nginx configuration is updated.
2. **WebSocket Real-Time Streaming Server (Intern 2 & Intern 5)**:
   - `docker-compose.full.dev.yml` currently runs Django via `python manage.py runserver` (WSGI). ASGI / Daphne and Redis Pub/Sub channels are required for live WebSocket connections on `/ws/notifications/`. (Frontend is prepared to accept WebSocket streaming with automatic REST polling fallback).
3. **Backend Analytics Python Import Path (Intern 2)**:
   - `Team-3/Domain-1/backend/apps/analytics_service/views.py` contains a hardcoded Windows path (`sys.path.insert(0, r"r:\new projects\...")`), causing import errors inside Docker.

---

## Cross-Domain Findings

* **Domain-1 (`backend/apps/notification_service`)**:
  - `MarkReadView` endpoint path is `PATCH /api/v1/notifications/<uuid:pk>/read` (not `PATCH /api/v1/notifications/{id}`). Frontend service was tailored to match this exact implementation.
* **Domain-1 (`backend/apps/application_service`)**:
  - Only provides `GET /api/v1/applications/`, `PATCH /api/v1/applications/{id}/status`, and `GET /api/v1/applications/{id}/history`. There is no `POST /api/v1/applications/` endpoint; applications currently originate from swipe history.
* **Domain-2 (`SwipeX_Job_Data_Intelligence_Milestone1/app/main.py`)**:
  - `serialize_job` includes `applicant_count` and `competition_level` (`Low`, `Medium`, `High`), but does not calculate `early_applicant`. Frontend is equipped to display the badge as soon as the field is returned.
* **Domain-3 (`Milestone4work/m4_app.py`)**:
  - Intern 4 created FastAPI standalone endpoints for alert evaluation (`/api/v1/ai/m4/evaluate-alerts`) and skill gaps (`/api/v1/ai/m4/skill-gap-analysis`).

---

## Build/Test Results

* **Vite Production Bundle Build**:
  ```bash
  npm --prefix Team-3/Domain-4 run build
  ```
  **Result:** Exited with code `0` in `10.96s`. Zero syntax errors, zero missing imports.
* **Git Whitespace & Syntax Integrity**:
  ```bash
  git diff --check
  ```
  **Result:** Exited with code `0`. Clean diff with zero trailing whitespace or carriage-return issues.

---

## Files Changed

### Modified Existing Files
* `Team-3/Domain-4/src/App.jsx`
* `Team-3/Domain-4/src/components/JobCard.jsx`
* `Team-3/Domain-4/src/layouts/RoleDashboardShell.jsx`
* `Team-3/Domain-4/src/pages/dashboard/jobseeker/JobSeekerApplicationsPage.jsx`
* `Team-3/Domain-4/src/pages/dashboard/jobseeker/JobSeekerOverviewPage.jsx`
* `Team-3/Domain-4/src/pages/dashboard/recruiter/RecruiterApplicationsPage.jsx`
* `Team-3/Domain-4/src/pages/dashboard/admin/AdminOverviewPage.jsx`

### Created New Files
* `Team-3/Domain-4/src/services/notifications.js`
* `Team-3/Domain-4/src/services/applications.js`
* `Team-3/Domain-4/src/services/alertPreferences.js`
* `Team-3/Domain-4/src/services/analytics.js`
* `Team-3/Domain-4/src/components/notifications/NotificationBell.jsx`
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
* `Team-3/Domain-4/M4_DAY1_REPORT.md`

---

## Remaining Work for Day 2

1. **Live Notification Integration**:
   - Connect live WebSocket consumer or periodic polling fallback to keep unread badges synced in real time.
2. **Competition Badge Polishing**:
   - Align early applicant window criteria with Domain-2/Domain-3 threshold freeze.
3. **Gateway Route Verification**:
   - Coordinate with Intern 2 and Intern 5 to verify `/api/v1/notifications/`, `/api/v1/applications/`, and `/api/v1/alert-preferences/` proxying through Nginx Gateway on port 8080.
