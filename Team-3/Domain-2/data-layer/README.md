# Recruitment data layer

PostgreSQL 15+ and Redis 7+ implementation for notifications, job competition,
analytics, and recommendation insights.

## Assumptions

Domain 1 owns `users` (bigint primary key) and Domain 2 owns `jobs` (integer
primary key, `posted_at`, and `company_id`). M4 migrations add `recruiter_id`
and feature tables using those existing identifier types:

- `users(id bigint primary key)`
- `jobs(id integer primary key, company_id integer, posted_at timestamptz)`
- `resumes(id uuid primary key, owner_id bigint)` and `resume_versions(id uuid, resume_id uuid)`
- `applications(id uuid primary key, job_id integer, applicant_id bigint, status text,
  resume_version_id uuid, resume_score numeric, created_at timestamptz not null)`

`applications` is created by migration 001 with a unique `(job_id, applicant_id)`
constraint. Domain 1's resume tables must be migrated before migration 001.
The resume skill gap and job demand summaries read the existing `resume_skills`
and pipe-delimited `jobs.skills` data; they do not assume `job_skills` or
`user_skills` tables.

`sql/local_demo_prerequisites.sql` remains an isolated legacy demo fixture and
does not represent the integrated schema. Do not use it with the service stack.

## Apply

Apply files in lexical order after Domain 1 and Domain 2 have initialized their
base tables. The deployment migrations image runs these files once before the
frontend becomes available. Rehearse the migrations against a restored staging
database before any production rollout.

```powershell
$env:DATABASE_URL = 'postgresql://...'
psql $env:DATABASE_URL -v ON_ERROR_STOP=1 -f migrations/001_core_features.sql
psql $env:DATABASE_URL -v ON_ERROR_STOP=1 -f migrations/002_competition_counter.sql
psql $env:DATABASE_URL -v ON_ERROR_STOP=1 -f migrations/003_analytics.sql
psql $env:DATABASE_URL -v ON_ERROR_STOP=1 -f sql/refresh_analytics.sql
```

Run `scripts/dry-run.ps1 -DatabaseUrl <isolated-copy-url> -IsolatedRestoredCopy`
against a restored staging copy before release, then `sql/integrity_checks.sql`.
Backup/restore is documented in
`scripts/backup.ps1` and `scripts/restore.ps1`.

## Cache

`src/cache.ts` exposes versioned Redis keys, JSON serialization, explicit TTLs,
and tag invalidation. Cache is strictly read-through: database commits succeed
even if Redis is unavailable. Invalidate after the database transaction commits.

## Analytics refresh

Call `SELECT app.refresh_analytics(date_trunc('day', now())::date);` hourly or
daily from your scheduler. It recomputes a rolling 180-day window, is idempotent,
and uses an advisory lock to avoid concurrent refreshes.

See `docs/data-dictionary.md` and `docs/maintenance.md` for operational details.
