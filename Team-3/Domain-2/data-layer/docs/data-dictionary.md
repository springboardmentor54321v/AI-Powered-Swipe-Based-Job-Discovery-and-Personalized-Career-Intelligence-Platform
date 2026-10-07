# Data dictionary

| Object | Purpose | Retention / owner |
|---|---|---|
| `app.notification` | User-visible delivery record; payload holds typed IDs only, never resume PII | Delete expired records nightly; Product |
| `app.alert_preference` | Per-user, type, channel opt-in and quiet hours | Deleted with user; Product |
| `app.application_status_event` | Immutable application audit/history | Retain per hiring policy; Recruiting |
| `jobs.applicant_count` | Transactionally maintained denormalized count | Derived from applications; Platform |
| `jobs.competition_level` | Derived label: low, medium, high, very_high | Recalculated on application changes; Platform |
| `app.daily_funnel_aggregate` | Daily job pipeline counts | 180-day rolling refresh; Analytics |
| `app.daily_resume_performance_aggregate` | Daily score/conversion metrics | 180-day rolling refresh; Analytics |
| `app.daily_hiring_trend_aggregate` | Daily platform hiring trend | 180-day rolling refresh; Analytics |

## Competition thresholds

| Level | Condition |
|---|---|
| low | fewer than 10 applicants, without an age threshold |
| medium | 10+ applicants, or 5+ after 3 days |
| high | 50+ applicants, or 20+ after 7 days |
| very_high | 100+ applicants, or 50+ after 14 days |

Thresholds are deliberately ordered from highest to lowest in `app.competition_level`.
Job age is based on `jobs.created_at`; a scheduled recomputation is required for
level changes caused solely by age (see maintenance notes).

## Index rationale

- Unread notifications use a partial `(user_id, created_at DESC)` index.
- Status-history and application lookup indexes match their foreign-key/time order.
- Concurrent application indexes support aggregate scans and candidate/job pages.
- Do not add generic JSONB indexes until a measured query needs one; JSONB indexes
increase write amplification on notification delivery.
