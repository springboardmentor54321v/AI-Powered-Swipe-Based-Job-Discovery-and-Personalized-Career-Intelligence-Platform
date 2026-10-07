# SwipeX Milestone 4 API Contract Baseline

Status: **QA proposal for cross-domain freeze**. Intern 5 owns the checks; Interns 1–4 must review and agree response details before implementation sign-off. These routes are targets derived from the M4 SRS, not claims that the endpoints already exist.

All protected routes require `Authorization: Bearer <access_token>`. Use ISO-8601 UTC timestamps. Paginated collections return `{ "items": [], "next": null }`. Error responses use `{ "detail": "...", "code": "..." }`.

## Notifications and preferences

| Method and route | Access | Expected success |
| --- | --- | --- |
| GET `/api/v1/notifications?limit=20&cursor=...` | Job Seeker | `200 { "items": [{ "notification_id", "type", "title", "body", "job_id", "created_at", "read_at" }], "next": null, "unread_count": 0 }` |
| GET `/api/v1/notifications/unread-count` | Job Seeker | `200 { "unread_count": 0 }` |
| PATCH `/api/v1/notifications/{notification_id}` | Owning Job Seeker | `200 { "notification_id", "read_at" }`; only permits marking read |
| GET `/api/v1/notifications/stream` | Job Seeker | WebSocket; authenticated connection receives the same notification shape; disconnect when token is invalid/revoked |
| GET `/api/v1/alert-preferences` | Job Seeker | `200 { "types": ["instant_job", "startup_hiring", "high_match", "low_competition"], "channels": ["in_app"], "match_threshold": 80, "quiet_hours": null }` |
| PUT `/api/v1/alert-preferences` | Job Seeker | `200` with validated preferences; channels limited to configured delivery channels |

Notification `type` is one of `instant_job`, `startup_hiring`, `high_match`, `low_competition`, `application_status`. Persist in-app notification before attempting email/push; provider failure must not lose the in-app item.

## Application tracking

| Method and route | Access | Expected success |
| --- | --- | --- |
| GET `/api/v1/applications` | Job Seeker | `200 { "items": [{ "application_id", "job_id", "status", "applied_at", "updated_at" }], "next": null }`; only current user's applications |
| POST `/api/v1/applications` | Job Seeker | `201 { "application_id", "job_id", "status": "applied", "applied_at", "early_applicant": true }`; idempotency key supported |
| GET `/api/v1/applications/{application_id}/history` | Owning Job Seeker or owning Recruiter | `200 [{ "from_status", "to_status", "changed_at", "actor_role" }]` |
| PATCH `/api/v1/recruiter/applications/{application_id}` | Recruiter for that job; Admin | `200 { "application_id", "status", "updated_at" }`; valid states: `shortlisted`, `interview`, `rejected` |

The initial status is `applied`; recruiter updates append immutable history. Applicants cannot read or change another user's application. Job Seekers cannot use the recruiter update route.

## Competition and freshness

| Method and route | Access | Expected success |
| --- | --- | --- |
| GET `/api/v1/jobs` | Public | Job records include `posted_at`, `applicant_count`, `competition_level` (`low`, `medium`, `high`) and `early_applicant` for authenticated viewer; filters `competition=low` and `posted_within_hours=N` |
| GET `/api/v1/jobs/{job_id}/competition` | Public | `200 { "job_id", "posted_at", "applicant_count", "competition_level", "early_applicant_window_hours" }` |

Competition level calculation and early window thresholds must be confirmed by Domain 3 before contract freeze. Applicant count must not expose applicant identities.

## Analytics

| Method and route | Access | Expected success |
| --- | --- | --- |
| GET `/api/v1/analytics/job-seeker?from=...&to=...` | Job Seeker | `200 { "application_funnel": { "saved": 0, "applied": 0, "shortlisted": 0, "interview": 0, "rejected": 0 }, "resume_performance": [], "skill_gaps": [], "recommendation_insights": [] }`; current user only |
| GET `/api/v1/analytics/recruiter?from=...&to=...` | Recruiter for owned jobs; Admin | `200 { "jobs": [], "application_trends": [] }`; no other recruiter's data |
| GET `/api/v1/analytics/admin?from=...&to=...` | Admin | `200 { "users": 0, "jobs": 0, "applications": 0, "hiring_trends": [] }` |
| GET `/api/v1/analytics/hiring-trends?from=...&to=...` | Authenticated | `200 { "jobs_posted": [], "top_skills": [], "company_activity": [] }`; date range is bounded |

## Cross-cutting negative cases

- Missing/invalid/expired JWT: `401` or `403` for every protected REST/WebSocket route.
- Wrong role or cross-owner access: `403` (or `404` where hiding resource existence is the established policy); never return another user's records.
- Invalid status, preference, date range or filter: `400` with stable error shape.
- Public job response may expose aggregate counts only; never applicant PII or notification content.
- Rate-limited requests return `429` and a `Retry-After` header.
- Email, push and AI/vector providers are mocked in deterministic tests; provider outage falls back to persisted in-app notifications where applicable.
