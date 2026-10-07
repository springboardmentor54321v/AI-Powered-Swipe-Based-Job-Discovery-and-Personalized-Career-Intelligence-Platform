BEGIN;

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS applicant_count integer NOT NULL DEFAULT 0 CHECK (applicant_count >= 0),
  ADD COLUMN IF NOT EXISTS competition_level text NOT NULL DEFAULT 'low'
    CHECK (competition_level IN ('low','medium','high','very_high')),
  ADD COLUMN IF NOT EXISTS competition_updated_at timestamptz NOT NULL DEFAULT now();

CREATE OR REPLACE FUNCTION app.competition_level(p_count integer, p_created_at timestamptz, p_now timestamptz DEFAULT now())
RETURNS text LANGUAGE sql STABLE PARALLEL SAFE AS $$
  SELECT CASE
    WHEN p_count >= 100 OR (p_count >= 50 AND p_now - p_created_at >= interval '14 days') THEN 'very_high'
    WHEN p_count >= 50 OR (p_count >= 20 AND p_now - p_created_at >= interval '7 days') THEN 'high'
    WHEN p_count >= 10 OR (p_count >= 5 AND p_now - p_created_at >= interval '3 days') THEN 'medium'
    ELSE 'low'
  END
$$;

CREATE OR REPLACE FUNCTION app.sync_job_competition(p_job_id uuid)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE v_count integer; v_created_at timestamptz;
BEGIN
  SELECT count(*)::integer, min(a.created_at)
    INTO v_count, v_created_at
  FROM public.applications a WHERE a.job_id = p_job_id;
  SELECT created_at INTO v_created_at FROM public.jobs WHERE id = p_job_id FOR UPDATE;
  IF FOUND THEN
    UPDATE public.jobs SET applicant_count = v_count,
      competition_level = app.competition_level(v_count, v_created_at),
      competition_updated_at = now()
    WHERE id = p_job_id;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION app.application_counter_trigger()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM app.sync_job_competition(NEW.job_id);
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM app.sync_job_competition(OLD.job_id);
  ELSIF NEW.job_id IS DISTINCT FROM OLD.job_id THEN
    PERFORM app.sync_job_competition(OLD.job_id);
    PERFORM app.sync_job_competition(NEW.job_id);
  END IF;
  RETURN COALESCE(NEW, OLD);
END $$;

DROP TRIGGER IF EXISTS application_counter_trg ON public.applications;
CREATE TRIGGER application_counter_trg AFTER INSERT OR DELETE OR UPDATE OF job_id
ON public.applications FOR EACH ROW EXECUTE FUNCTION app.application_counter_trigger();

UPDATE public.jobs j SET applicant_count = s.cnt,
  competition_level = app.competition_level(s.cnt, j.created_at), competition_updated_at = now()
FROM (SELECT job_id, count(*)::integer cnt FROM public.applications GROUP BY job_id) s
WHERE j.id = s.job_id;
UPDATE public.jobs SET applicant_count = 0, competition_level = app.competition_level(0, created_at), competition_updated_at = now()
WHERE NOT EXISTS (SELECT 1 FROM public.applications a WHERE a.job_id = jobs.id);

COMMIT;
