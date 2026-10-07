# Recruitment data layer

PostgreSQL 15+ and Redis 7+ implementation for notifications, job competition,
analytics, and recommendation insights.

## Assumptions

The application already owns these tables:

- `users(id uuid primary key)`
- `jobs(id uuid primary key, title text, created_at timestamptz not null, status text)`
- `applications(id uuid primary key, job_id uuid, applicant_id uuid, status text,
  resume_score numeric, created_at timestamptz not null)`

`applications` must have a unique `(job_id, applicant_id)` constraint. If its
column names differ, adapt the two trigger functions in migration 002.
The skills and recommendation queries additionally expect `skills`, `job_skills`,
and `user_skills` join tables; they are read-only consumers and are not created
by this migration set.

For an empty local development database only, `sql/local_demo_prerequisites.sql`
creates minimal versions of the three prerequisite application tables. Never run
it against an existing application database.

## Apply

Apply files in lexical order with a migration runner. Files are transaction-safe
unless marked otherwise. For production, run the concurrent-index section of
`migrations/003_analytics.sql` separately (it cannot run in a transaction).

```powershell
$env:DATABASE_URL = 'postgresql://...'
psql $env:DATABASE_URL -v ON_ERROR_STOP=1 -f migrations/001_core_features.sql
psql $env:DATABASE_URL -v ON_ERROR_STOP=1 -f migrations/002_competition_counter.sql
psql $env:DATABASE_URL -v ON_ERROR_STOP=1 -f migrations/003_analytics.sql
psql $env:DATABASE_URL -v ON_ERROR_STOP=1 -f sql/refresh_analytics.sql
```

Run `scripts/dry-run.ps1` against a restored production snapshot before release,
then `sql/integrity_checks.sql`. Backup/restore is documented in
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
