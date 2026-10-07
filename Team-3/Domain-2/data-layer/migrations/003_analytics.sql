-- Run this file in a non-transactional migration. CREATE INDEX CONCURRENTLY
-- must not be wrapped in BEGIN/COMMIT.
CREATE INDEX CONCURRENTLY IF NOT EXISTS applications_job_created_idx ON public.applications (job_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS applications_applicant_created_idx ON public.applications (applicant_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS applications_status_created_idx ON public.applications (status, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS jobs_status_created_idx ON public.jobs (status, created_at DESC);

CREATE TABLE IF NOT EXISTS app.daily_funnel_aggregate (
  day date NOT NULL,
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  applications integer NOT NULL DEFAULT 0,
  screened integer NOT NULL DEFAULT 0,
  interviewed integer NOT NULL DEFAULT 0,
  offered integer NOT NULL DEFAULT 0,
  hired integer NOT NULL DEFAULT 0,
  PRIMARY KEY (day, job_id)
);

CREATE TABLE IF NOT EXISTS app.daily_resume_performance_aggregate (
  day date NOT NULL,
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  application_count integer NOT NULL,
  average_resume_score numeric(6,2),
  interview_rate numeric(7,4),
  hire_rate numeric(7,4),
  PRIMARY KEY (day, job_id)
);

CREATE TABLE IF NOT EXISTS app.daily_hiring_trend_aggregate (
  day date PRIMARY KEY,
  jobs_posted integer NOT NULL DEFAULT 0,
  applications integer NOT NULL DEFAULT 0,
  hires integer NOT NULL DEFAULT 0
);

CREATE OR REPLACE FUNCTION app.refresh_analytics(p_from date DEFAULT current_date - 180)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF NOT pg_try_advisory_xact_lock(hashtext('app.refresh_analytics')) THEN RETURN; END IF;
  DELETE FROM app.daily_funnel_aggregate WHERE day >= p_from;
  INSERT INTO app.daily_funnel_aggregate
  SELECT a.created_at::date, a.job_id, count(*)::int,
    count(*) FILTER (WHERE a.status IN ('screened','interviewed','offered','hired'))::int,
    count(*) FILTER (WHERE a.status IN ('interviewed','offered','hired'))::int,
    count(*) FILTER (WHERE a.status IN ('offered','hired'))::int,
    count(*) FILTER (WHERE a.status = 'hired')::int
  FROM public.applications a WHERE a.created_at::date >= p_from GROUP BY 1,2;
  DELETE FROM app.daily_resume_performance_aggregate WHERE day >= p_from;
  INSERT INTO app.daily_resume_performance_aggregate
  SELECT a.created_at::date, a.job_id, count(*)::int, round(avg(a.resume_score),2),
    round(avg((a.status IN ('interviewed','offered','hired'))::int),4),
    round(avg((a.status = 'hired')::int),4)
  FROM public.applications a WHERE a.created_at::date >= p_from GROUP BY 1,2;
  DELETE FROM app.daily_hiring_trend_aggregate WHERE day >= p_from;
  INSERT INTO app.daily_hiring_trend_aggregate
  SELECT d.day::date,
    (SELECT count(*)::int FROM public.jobs j WHERE j.created_at::date = d.day::date),
    (SELECT count(*)::int FROM public.applications a WHERE a.created_at::date = d.day::date),
    (SELECT count(*)::int FROM public.applications a WHERE a.created_at::date = d.day::date AND a.status='hired')
  FROM generate_series(p_from, current_date, interval '1 day') d(day);
END $$;
