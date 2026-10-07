# SwipeX — Milestone 4: Domain 4 (Frontend & UX) Initial Audit

**Author:** Intern 1 — Frontend & User Experience
**Date:** October 7, 2026
**Scope:** Initial Baseline Audit for Milestone 4 (Notifications, Analytics & Deployment)
**Primary Reference:** Official SwipeX — Milestone 4 Software Requirements Specification (SRS)

---

## 1. Understanding of Milestone 4

Milestone 4 is the final and culminating milestone of SwipeX. Building upon M1 (Authentication, RBAC, Core DB), M2 (Job Discovery, Swipes, Search, Companies), and M3 (Resume Management, ATS Scoring, AI Suggestions, Semantic Recommendations), M4 shifts the platform into a production-ready, career-intelligence ecosystem.

### Key Functional Pillars:
1. **Smart Notifications & Alerts**: Real-time in-app notification center, unread counters, notification history, mark-as-read, alert preferences (instant job, startup hiring, high-match, low-competition), and WebSocket/Redis Pub-Sub streaming with in-app fallback.
2. **Real-Time Job Freshness & Competition Tracking**: Posted-time indicators, live applicant counts, Low/Medium/High competition levels, early-applicant window indicators, and dedicated search filters.
3. **Application Tracking System (ATS)**: Multi-stage tracking board (`saved` → `applied` → `shortlisted` → `interview` → `rejected`), status history timeline, and recruiter-side status management.
4. **Role-Based Analytics & Career Intelligence**:
   - **Job Seeker**: Application funnel, resume performance per version, skill-gap analysis, recommendation insights.
   - **Recruiter**: Applicants per job, status funnel, candidate trends.
   - **Admin**: Platform-wide user metrics, active jobs, applications, and market hiring trends (top in-demand skills, startup vs. MNC activity with date-range filters).
5. **Final Production Readiness**: Zero-cost deployment architecture, HTTPS, CORS compliance, secure environment configurations, and end-to-end integration across all roles.

---

## 2. Domain-4 Responsibilities (Intern 1)

As Intern 1 (Frontend & UX), our exclusive implementation domain is `Team-3/Domain-4/`. Our primary deliverables under M4 are:

1. **Notification Center & Bell**:
   - Notification bell in the global top header (`RoleDashboardShell.jsx`) with live unread badge.
   - Notification dropdown for quick triage and mark-as-read.
   - Dedicated Notification History page with filtering by alert type and read status.
2. **Alert Preferences Interface**:
   - User settings UI to configure alert categories (instant jobs, startup hiring, high match, low competition).
   - Notification delivery channels (in-app, email).
   - AI Match threshold slider (e.g., 70% – 95%).
   - Quiet hours time pickers (e.g., 22:00 – 08:00).
3. **Job Competition Indicators**:
   - Visual badges on `JobCard.jsx` displaying applicant count, competition level (`Low`, `Medium`, `High`), posted time, and the `Early Applicant` window badge.
   - Ensure `FilterBar.jsx` seamlessly passes `low_competition` and `recently_posted` query parameters.
4. **Application Tracking Board**:
   - Comprehensive tracking board supporting 5 core states: `Saved`, `Applied`, `Shortlisted`, `Interview`, `Rejected`.
   - Visual status progression timeline showing transition dates and actor roles.
   - Recruiter perspective: Status change actions with confirmation.
5. **Role-Based Analytics Dashboards & Charts**:
   - Job Seeker: Application funnel chart, resume performance by version, visual skill gaps.
   - Recruiter: Job application conversion funnel and applicant volume trends.
   - Admin: Platform user growth, jobs distribution, and market hiring trends (top skills, startup vs MNC) with date-range controls.
6. **Production Build & Responsive Polish**:
   - Mobile-responsive optimization for all new M4 views.
   - Friendly error states, empty states, and loading skeletons.
   - Zero-warning production bundle compilation (`npm run build`).

---

## 3. Existing Domain-4 Work (Current State)

| Component / File | Current Capabilities | M4 Gap / Needed Enhancement |
| :--- | :--- | :--- |
| `src/components/Navbar.jsx` & `src/layouts/RoleDashboardShell.jsx` | Fixed desktop sidebar, mobile drawer, role switcher, user account badge. | **No Notification Bell or unread badge** in header. No sidebar links to Notification History or Alert Preferences. |
| `src/components/JobCard.jsx` | Displays applicant count, Low/Medium/High competition tag, posted time, and M3 AI match percentage / reason tags. | **Missing `Early Applicant` badge** (e.g. within 48h / <20 applicants window). |
| `src/components/FilterBar.jsx` | Contains search input, company type chips, and toggle chips for `fresher_friendly`, `low_competition`, and `recently_posted`. | **Complete in UI**, but needs verification against active backend search parameters. |
| `src/pages/dashboard/jobseeker/JobSeekerApplicationsPage.jsx` | Fetches right-swipes from swipe history and renders basic cards with company, role, and swipe timestamp. | **Not a true ATS tracking board**. Lacks the 5 application states (`saved`, `applied`, `shortlisted`, `interview`, `rejected`), status history timeline, and direct application actions. |
| `src/pages/dashboard/recruiter/RecruiterApplicationsPage.jsx` | Fetches right-swipes and provides a simulated "Schedule Interview" modal. | Lacks official recruiter status mutation (`PATCH /api/v1/applications/{id}/status`) to update candidates to `shortlisted`, `interview`, or `rejected`. |
| `src/pages/dashboard/*/OverviewPage.jsx` | Provides metric summaries (counts of swipes, jobs, users). | **Lacks visual charts** (funnel, trends, skill gaps, startup vs MNC distribution) and date-range filtering. |
| `src/services/` | Contains `auth.js`, `jobs.js`, `companies.js`, `resume.js`, `ats.js`, `suggestions.js`, `recommendations.js`. | **Missing dedicated services**: `notifications.js`, `applications.js`, `alertPreferences.js`, and `analytics.js`. |

---

## 4. Existing M1 / M2 / M3 Functionality to Preserve

All existing functionality from prior milestones must remain functional and unbroken:
- **Milestone 1**:
  - JWT Authentication, login/register flows, token refresh, and persistent user sessions.
  - Strict Role-Based Access Control (Job Seeker, Recruiter, Admin) route guards (`RoleRoute`, `ProtectedRoute`).
- **Milestone 2**:
  - Interactive Tinder-style job card swiping (left to pass, right to save/apply, undo swipe).
  - Job search, multi-criteria filtering, company directory, and company profile detail views.
- **Milestone 3**:
  - Multi-version resume management, active resume selection, and PDF upload.
  - ATS scoring gauge, keyword gap list, skill gap list, and actionable resume suggestions.
  - Semantic recommendation engine integration with AI match percentages and reason tags.

---

## 5. Other-Domain Dependencies & Artifacts Needed

According to the M4 SRS Cross-Team Dependency Matrix, Domain 4 relies on the following artifacts:

```
[Intern 3: Data Layer]
       │
       ▼ (Schema: notification, alert_preference, application, aggregates)
[Intern 2: Backend & Identity]  ◄────►  [Intern 4: AI Career Intelligence]
       │                                     (Alert rules, skill gaps, trends)
       ▼ (REST APIs, WebSockets, Gateway)
[Intern 1: Domain-4 Frontend]
       │
       ▼ (Tested, responsive UI)
[Intern 5: Platform & QA] (Docker, Gateway proxy, Staging, Production)
```

1. **Intern 2 (Domain 1 — Backend & Identity)**:
   - REST endpoints for Notifications, Alert Preferences, Application Tracking, and Analytics.
   - Real-time WebSocket gateway (`/ws/notifications/`) via Django Channels / Redis Pub-Sub.
   - Gateway routing and RBAC enforcement.
2. **Intern 3 (Domain 2 — Job & Data Intelligence)**:
   - Database tables: `app.notification`, `app.alert_preference`, `app.application_status_event`, `public.applications`.
   - Competition level calculations and applicant counter updates upon application submission.
   - Aggregated analytical views (`daily_funnel_aggregate`, `daily_resume_performance_aggregate`, `daily_hiring_trend_aggregate`).
3. **Intern 4 (Domain 3 — AI/ML Career Intelligence)**:
   - Alert trigger engine (`alert_rules.py`, `alert_trigger_service.py`).
   - Candidate skill-gap analytics and resume performance metrics (`metrics_spec.py`).
   - Market hiring trends and recommendation explanation insights (`insights_and_trends.py`).
4. **Intern 5 (Domain 5 — Platform, Testing & Deployment)**:
   - Nginx gateway configuration (`gateway/nginx.conf`) forwarding new M4 paths.
   - Unified Docker Compose environment (`docker-compose.full.dev.yml`).
   - Contract compliance validation (`Team-3/Domain-5/contracts/milestone-4-api-contracts.md`).

---

## 6. APIs Needed (Contract vs. Implementation Status)

| API Route | Expected Contract (SRS / Domain 5) | Backend Status in Repo (Domain 1) | Gateway Routing Status (`gateway/nginx.conf`) |
| :--- | :--- | :--- | :--- |
| `GET /api/v1/notifications/` | List notifications (paginated, unread count) | **Implemented** (`NotificationListView`) | ❌ **Missing in Nginx** (Will return 404) |
| `GET /api/v1/notifications/unread-count` | Returns `{ unread_count: N }` | **Implemented** (`UnreadCountView`) | ❌ **Missing in Nginx** (Will return 404) |
| `PATCH /api/v1/notifications/{id}/read` | Marks notification as read | **Implemented** (`MarkReadView`) | ❌ **Missing in Nginx** (Will return 404) |
| `WS /ws/notifications/` | Real-time WebSocket stream | **Implemented** (`NotificationConsumer` in Channels) | ❌ **Missing in Nginx & Docker uses WSGI runserver** |
| `GET /api/v1/alert-preferences/` | Returns user alert preferences | **Implemented** (`AlertPreferenceView`) | ❌ **Missing in Nginx** (Will return 404) |
| `PUT /api/v1/alert-preferences/` | Updates alert types, channels, quiet hours | **Implemented** (`AlertPreferenceView`) | ❌ **Missing in Nginx** (Will return 404) |
| `GET /api/v1/applications/` | List user's applications | **Implemented** (`ApplicationListView`) | ❌ **Missing in Nginx** (Will return 404) |
| `POST /api/v1/applications/` | Create application with initial state `applied` | ⚠️ **Missing in Domain 1** (Only swipe records exist) | ❌ **Missing in Nginx** |
| `GET /api/v1/applications/{id}/history` | Application status timeline events | **Implemented** (`ApplicationHistoryView`) | ❌ **Missing in Nginx** (Will return 404) |
| `PATCH /api/v1/applications/{id}/status` | Recruiter updates application status | **Implemented** (`ApplicationStatusUpdateView`) | ❌ **Missing in Nginx** (Will return 404) |
| `GET /api/v1/jobs/{id}/competition` | Competition count, level, early applicant window | ⚠️ Embedded in `/api/v1/jobs` | ✅ Proxied via `/api/v1/jobs` |
| `GET /api/v1/analytics/seeker/resume-performance` | Funnel, score, interview rate | ⚠️ **Blocked by invalid path** (`r:\new projects\...`) | ❌ **Missing in Nginx** (Will return 404) |
| `GET /api/v1/analytics/recruiter/job-funnel` | Job applicant funnel aggregates | ⚠️ Mock stub in Domain 1 | ❌ **Missing in Nginx** (Will return 404) |
| `GET /api/v1/analytics/admin/hiring-trends` | Market trends, in-demand skills | ⚠️ Blocked by invalid path in Domain 1 | ❌ **Missing in Nginx** (Will return 404) |

---

## 7. Data & Schema Models Needed

1. **Notification Schema** (`app.notification`):
   - `id`: UUID (Primary Key)
   - `user_id`: UUID / Integer (Foreign Key to user)
   - `type`: Enum / String (`instant_job`, `startup_hiring`, `high_match`, `low_competition`, `application_status`)
   - `title`: String (max 180 chars)
   - `body`: Text
   - `payload`: JSON (contains `job_id`, `application_id`, `score`, etc.)
   - `read_at`: Timestamp (null if unread)
   - `created_at`: Timestamp
2. **Alert Preferences Schema** (`app.alert_preference`):
   - `user_id`: Foreign Key
   - `alert_type`: String (`instant_job`, `startup_hiring`, `high_match`, `low_competition`)
   - `channel`: String (`in_app`, `email`)
   - `enabled`: Boolean
   - `match_threshold`: Integer (70–95%)
   - `quiet_start`: Time (e.g. `22:00:00`)
   - `quiet_end`: Time (e.g. `08:00:00`)
3. **Application Tracking Schema** (`public.applications` & `app.application_status_event`):
   - `id`: UUID
   - `job_id`: UUID / Integer
   - `applicant_id`: Foreign Key to user
   - `status`: String (`saved`, `applied`, `shortlisted`, `interview`, `rejected`)
   - `resume_score`: Float
   - `status_history`: Events containing `from_status`, `to_status`, `actor_role`, `occurred_at`.
4. **Competition Attributes** (`jobs`):
   - `applicant_count`: Integer
   - `competition_level`: String (`Low`, `Medium`, `High`)
   - `posted_at`: Timestamp
   - `early_applicant`: Boolean (derived: applicant count < 25 or posted within 48h)

---

## 8. AI/ML Dependencies (Intern 4)

Domain 4 needs to display insights and analytics computed by Intern 4's engines:
1. **High-Match Alerts**: Generated when `ai_match_score >= user.match_threshold` (default 75%).
2. **Low-Competition Alerts**: Generated when `applicant_count < 10` and `is_recently_posted == True`.
3. **Startup Hiring Alerts**: Generated for jobs flagged with `company_type == "Startup"` or `"New Startup"`.
4. **Skill-Gap Analysis**: Visual list of candidate missing skills relative to target jobs.
5. **Resume Performance**: Conversion rate from view → apply → shortlist.
6. **Market Hiring Trends**: Top in-demand skills and ratio of Startup vs MNC job postings.

---

## 9. Deployment & Testing Dependencies (Intern 5)

1. **Docker Compose Stack** ([`docker-compose.full.dev.yml`](file:///home/avoxb/Documents/Codes/Team/AI-Powered-Swipe-Based-Job-Discovery-and-Personalized-Career-Intelligence-Platform/docker-compose.full.dev.yml)):
   - Must orchestrate `postgres`, `redis`, `auth-service`, `job-service`, `resume-service`, `matching-engine`, `gateway`, and `frontend`.
2. **Nginx Reverse Proxy** ([`gateway/nginx.conf`](file:///home/avoxb/Documents/Codes/Team/AI-Powered-Swipe-Based-Job-Discovery-and-Personalized-Career-Intelligence-Platform/gateway/nginx.conf)):
   - Must expose proxy paths for all new M4 endpoints.
3. **Frontend Production Build**:
   - `Team-3/Domain-4/Dockerfile` must build the Vite production bundle without missing asset errors or broken imports.

---

## 10. Identified Blockers & Integration Risks

> [!WARNING]
> The following blockers must be formally reported and addressed during Day 1 cross-team sync:

1. **BLOCKER 1: Gateway Configuration Lacks M4 Routes**:
   - File: `gateway/nginx.conf`
   - Issue: Nginx does not proxy `/api/v1/notifications/`, `/api/v1/alert-preferences/`, `/api/v1/applications/`, or `/api/v1/analytics/`. Calling these from the frontend currently yields `404 Not Found`.
   - Resolution Needed: Add proxy routes in `gateway/nginx.conf` forwarding to `http://auth-service:8000`.

2. **BLOCKER 2: Real-Time WebSocket Support in Docker**:
   - Files: `docker-compose.full.dev.yml`, `Team-3/Domain-1/backend/docker-entrypoint.sh`
   - Issue: `auth-service` runs via `python manage.py runserver 0.0.0.0:8000` (WSGI). Channels WebSocket support requires an ASGI server (`daphne` or `uvicorn config.asgi:application`). Furthermore, Nginx must configure `proxy_set_header Upgrade $http_upgrade` for `/ws/`.
   - Resolution Needed: In the frontend, implement graceful WebSocket connection with automatic polling fallback so the UI never crashes if the WebSocket server is unavailable.

3. **BLOCKER 3: Hardcoded Windows Path in Backend Analytics**:
   - File: `Team-3/Domain-1/backend/apps/analytics_service/views.py` (Line 9)
   - Issue: Contains `sys.path.insert(0, r"r:\new projects\resume-ats\Team-3\Domain-3\Milestone4work")`. Inside Linux Docker, this path does not exist, causing `ImportError` and returning `{"error": "AI Engine not available"}`.
   - Resolution Needed: Intern 2 must update the import or use an internal Docker mount.

4. **BLOCKER 4: Application Creation (`POST /api/v1/applications/`)**:
   - File: `Team-3/Domain-1/backend/apps/application_service/views.py`
   - Issue: Domain 1 has `ApplicationListView` (`GET`), but no `ApplicationCreateView` (`POST`). Applications were previously tracked solely through right-swipes in Domain 2.
   - Resolution Needed: Support both swipe-based application records and explicit application submissions.

---

## 11. Work Classification Matrix

### ✅ COMPLETE
1. **Core Navigation & Role Layout** (`RoleDashboardShell.jsx`): Responsive sidebar, workspace indicator, role switching (Candidate, Recruiter, Admin), user profile badge.
2. **Base Competition Indicators on Job Cards** (`JobCard.jsx`): Applicant counter, posted time, and Low/Medium/High competition tags.
3. **FilterBar Search & Tags** (`FilterBar.jsx`): Keyword search and quick toggle chips for `low_competition` and `recently_posted`.
4. **All M1 / M2 / M3 Baselines**: Authentication, session subscription, card swipe gestures, company pages, resume versioning, ATS gauge, and AI recommendation insights.
5. **Frontend Build Verification**: Vite production bundle builds cleanly (`npm run build` exits 0).

### ⚠️ PARTIAL
1. **Application Tracking**:
   - Existing: Simple list of right-swiped jobs in `JobSeekerApplicationsPage.jsx`.
   - Missing: True 5-state kanban/table board (`Saved`, `Applied`, `Shortlisted`, `Interview`, `Rejected`), status timeline modal/card, and recruiter status update actions.
2. **Early Applicant Indicator**:
   - Existing: Applicant count and level are shown on `JobCard.jsx`.
   - Missing: Dedicated `Early Applicant` badge/indicator when job meets early criteria.
3. **Analytics Views**:
   - Existing: Basic statistic cards (swipes count, active jobs) on overview pages.
   - Missing: Dedicated visual charts (application funnel, resume version comparison, skill-gap radar/list, hiring trends by industry/skill) and date-range controls.

### ❌ NOT COMPLETE (Our Primary Implementation Tasks)
1. **Notification Center & Bell Component** (`NotificationBell.jsx`, `NotificationDropdown.jsx`): Top header bell icon with unread count badge and quick-view popover.
2. **Notification History Page** (`NotificationHistoryPage.jsx`): Dedicated view with filters by category (`Instant Job`, `Startup Hiring`, `High Match`, `Low Competition`, `Application Status`) and mark-all-as-read action.
3. **Alert Preferences Settings** (`AlertPreferencesPage.jsx`): Channel toggles (in-app, email), category checkboxes, match threshold slider, and quiet hours schedule.
4. **Frontend API Services**:
   - `src/services/notifications.js`
   - `src/services/applications.js`
   - `src/services/analytics.js`
5. **Interactive Charts**: Lightweight, zero-dependency SVG/CSS or Canvas visual charts for the application funnel, resume performance, and market hiring trends.

### 🚫 BLOCKED (External Dependencies)
1. **Live Gateway Routing for M4 Endpoints**: Blocked by missing `location` directives in `gateway/nginx.conf`.
2. **Real-Time WebSocket Streaming**: Blocked by ASGI / Daphne server requirement and Nginx WebSocket proxy configuration (Frontend will implement a resilient dual-mode: WebSocket with automatic REST polling fallback).
3. **Backend Analytics Live Data**: Blocked by hardcoded Windows path in `apps/analytics_service/views.py`.

---

## 12. Conclusion & Day 1 Readiness

Domain 4 has a solid M1–M3 foundation and clean build hygiene. Day 1 implementation can begin immediately upon authorization, focusing on:
1. Drafting wireframes and UX architectures for the Notification Center, Alert Preferences, Application Tracking Board, and Analytics Dashboards.
2. Building the API contract layer (`src/services/notifications.js`, `src/services/applications.js`, `src/services/analytics.js`) designed to interface with Intern 2's backend contracts while providing robust resilience against backend blockers.
3. Adding the `Early Applicant` badge logic to `JobCard.jsx`.

**Status:** Awaiting user instruction: `"START DAY 1"`.
