-- Production readiness verification. All expected values are supplied as psql variables.
-- Example: psql $DATABASE_URL -v expected_open_jobs=42 -v expected_users=1200 -f sql/production_verify.sql
SELECT 'open_jobs' AS check_name, count(*) AS actual, :expected_open_jobs::bigint AS expected,
       count(*) = :expected_open_jobs::bigint AS passed FROM public.jobs WHERE status='open'
UNION ALL
SELECT 'users', count(*), :expected_users::bigint, count(*) = :expected_users::bigint FROM public.users;

-- These must each produce zero rows.
\ir integrity_checks.sql

-- Confirm that the feature objects and indexes exist and are valid.
SELECT c.relname, i.indisvalid
FROM pg_index i JOIN pg_class c ON c.oid=i.indexrelid
WHERE c.relname IN ('notification_unread_idx','applications_job_created_idx','applications_applicant_created_idx','applications_status_created_idx','jobs_status_created_idx')
ORDER BY c.relname;
