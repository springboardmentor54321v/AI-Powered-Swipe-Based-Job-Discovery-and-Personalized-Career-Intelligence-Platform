# Maintenance and production sign-off

## Release order

1. Restore a recent, sanitized production backup into an isolated database.
2. Run `scripts/dry-run.ps1`; inspect zero-row integrity checks.
3. Apply 001 and 002 in a normal transactional migration window.
4. Apply 003 outside a transaction. `CREATE INDEX CONCURRENTLY` avoids long
   write locks but can run longer; monitor `pg_stat_progress_create_index`.
5. Refresh aggregates, warm only high-traffic cache keys, and monitor error rate.

`gen_random_uuid()` needs `pgcrypto` enabled by the platform owner. If UUIDs are
created by the application instead, remove that default. The migration role needs
DDL rights on schema `app` and the stated public tables.

## Scheduled operations

- Hourly: `SELECT app.refresh_analytics(current_date - 180);`
- Daily after midnight: recompute competition whose age can change its level:
  `UPDATE public.jobs SET competition_level=app.competition_level(applicant_count, posted_at), competition_updated_at=now();`
- Daily: remove expired notifications in bounded batches and refresh backup.
- Weekly: `ANALYZE public.jobs, public.applications, app.notification` and inspect
  slow-query statistics.

## Load and integrity verification

Run at least 20 concurrent workers that insert distinct applications for the
same job and assert `jobs.applicant_count` equals `count(applications)` afterward.
Then exercise delete and job-transfer cases. Repeat `sql/integrity_checks.sql`
before and after a refresh. Trigger serialization is protected by the locked job
row in `sync_job_competition`; if workload grows, replace count-recompute with a
locked delta counter and retain the nightly reconciliation query.

## Restore drill

Use `scripts/backup.ps1` to create custom-format dumps, restore into a named
non-production database with `scripts/restore.ps1`, then run integrity checks and
the aggregate refresh. Record dump timestamp, restore duration, row checks, and
the operator. Never test `restore.ps1` against production.

## Cache rules

Keys are versioned (`v1`) and tag-indexed. TTL is the stale-data bound: jobs 5m,
search 1m, recommendations 10m, unread count 30s. Invalidate relevant tags only
after commit; Redis failure must log/metric but never roll back a database write.
Rotate to `v2` on incompatible serialized-payload changes.
