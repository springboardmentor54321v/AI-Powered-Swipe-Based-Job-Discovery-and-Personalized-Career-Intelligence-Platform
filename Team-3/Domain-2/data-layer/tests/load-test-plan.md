# Counter load-test plan

Run this plan against a disposable database only.

1. Create one job and 1,000 fixture users; record the job ID.
2. From 20 concurrent workers, insert non-overlapping `(job_id, applicant_id)`
   application sets, committing every insert or small batch.
3. Assert `jobs.applicant_count = count(*)` for that job and compare the stored
   level with `app.competition_level(count(*), jobs.created_at)`.
4. Concurrently delete 100 applications, then move 100 remaining applications to
   a second job. Repeat the assertion for both jobs.
5. Run `sql/integrity_checks.sql`, then run `EXPLAIN (ANALYZE, BUFFERS)` on the
   notification, job-application, and analytics queries with production-like data.

Pass criteria: no deadlocks, no count mismatch, no negative count, and p95 write
latency stays within the service SLO. Capture query plans before adding any index.
