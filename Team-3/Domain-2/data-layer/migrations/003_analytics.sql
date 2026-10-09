-- Safe to execute as one script; PostgreSQL will block briefly when creating
-- these small, feature-specific indexes. No assumed jobs.status/created_at fields.
CREATE INDEX IF NOT EXISTS applications_job_created_idx ON public.applications (job_id, created_at DESC);
CREATE INDEX IF NOT EXISTS applications_applicant_created_idx ON public.applications (applicant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS applications_status_created_idx ON public.applications (status, created_at DESC);
CREATE INDEX IF NOT EXISTS jobs_recruiter_posted_idx ON public.jobs (recruiter_id, posted_at DESC);

CREATE TABLE IF NOT EXISTS app.daily_funnel_aggregate (
  day date NOT NULL,
  job_id integer NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  applications integer NOT NULL DEFAULT 0,
  saved integer NOT NULL DEFAULT 0,
  applied integer NOT NULL DEFAULT 0,
  shortlisted integer NOT NULL DEFAULT 0,
  interview integer NOT NULL DEFAULT 0,
  rejected integer NOT NULL DEFAULT 0,
  PRIMARY KEY (day, job_id)
);

CREATE TABLE IF NOT EXISTS app.daily_resume_performance_aggregate (
  day date NOT NULL,
  job_id integer NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
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
    count(*) FILTER (WHERE a.status = 'saved')::int,
    count(*) FILTER (WHERE a.status = 'applied')::int,
    count(*) FILTER (WHERE a.status = 'shortlisted')::int,
    count(*) FILTER (WHERE a.status = 'interview')::int,
    count(*) FILTER (WHERE a.status = 'rejected')::int
  FROM public.applications a WHERE a.created_at::date >= p_from GROUP BY 1,2;
  DELETE FROM app.daily_resume_performance_aggregate WHERE day >= p_from;
  INSERT INTO app.daily_resume_performance_aggregate
  SELECT a.created_at::date, a.job_id, count(*)::int, round(avg(a.resume_score),2),
    round(avg((a.status = 'interview')::int),4),
    NULL::numeric
  FROM public.applications a WHERE a.created_at::date >= p_from GROUP BY 1,2;
  DELETE FROM app.daily_hiring_trend_aggregate WHERE day >= p_from;
  INSERT INTO app.daily_hiring_trend_aggregate
  SELECT d.day::date,
    (SELECT count(*)::int FROM public.jobs j WHERE j.posted_at::date = d.day::date),
    (SELECT count(*)::int FROM public.applications a WHERE a.created_at::date = d.day::date),
    -- The M4 lifecycle has no hired state; keep this metric zero until a
    -- hiring-completion status is agreed and added to the API contract.
    0::integer
  FROM generate_series(p_from, current_date, interval '1 day') d(day);
END $$;
