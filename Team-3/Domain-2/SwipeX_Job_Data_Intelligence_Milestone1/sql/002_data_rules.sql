CREATE OR REPLACE FUNCTION job_freshness(p_posted_at TIMESTAMPTZ, p_now TIMESTAMPTZ DEFAULT now())
RETURNS TEXT LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN p_posted_at IS NULL THEN 'UNKNOWN'
    WHEN p_posted_at >= p_now - INTERVAL '24 hours' THEN 'JUST_POSTED'
    WHEN p_posted_at >= p_now - INTERVAL '3 days' THEN 'RECENT'
    WHEN p_posted_at >= p_now - INTERVAL '7 days' THEN 'THIS_WEEK'
    ELSE 'OLDER'
  END;
$$;

CREATE OR REPLACE FUNCTION competition_level(p_applicant_count INTEGER)
RETURNS TEXT LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN p_applicant_count < 25 THEN 'LOW'
    WHEN p_applicant_count < 100 THEN 'MEDIUM'
    ELSE 'HIGH'
  END;
$$;

CREATE OR REPLACE VIEW job_discovery_catalog AS
SELECT j.id, j.source_job_id, j.title, j.description, j.location, j.is_remote, j.job_type,
       j.skills, j.minimum_salary, j.maximum_salary, j.salary_currency, j.salary_display,
       j.minimum_experience, j.maximum_experience, j.posted_at, j.raw_job_uploaded,
       j.applicant_count, job_freshness(j.posted_at) AS freshness,
       competition_level(j.applicant_count) AS competition_level,
       c.id AS company_id, c.name AS company_name, c.company_type, c.about AS company_about,
       c.company_size, c.industry, c.aggregate_rating
FROM jobs j JOIN companies c ON c.id = j.company_id
WHERE j.is_active;

-- The backend records an APPLY in the same transaction as this function call.
-- SAVE and SKIP do not change applicant_count.
CREATE OR REPLACE FUNCTION adjust_applicant_count_for_swipe()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.action = 'APPLY' THEN
    UPDATE jobs SET applicant_count = applicant_count + 1, updated_at = now() WHERE id = NEW.job_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.action = 'APPLY' AND NEW.action <> 'APPLY' THEN
      UPDATE jobs SET applicant_count = GREATEST(applicant_count - 1, 0), updated_at = now() WHERE id = NEW.job_id;
    ELSIF OLD.action <> 'APPLY' AND NEW.action = 'APPLY' THEN
      UPDATE jobs SET applicant_count = applicant_count + 1, updated_at = now() WHERE id = NEW.job_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.action = 'APPLY' THEN
    UPDATE jobs SET applicant_count = GREATEST(applicant_count - 1, 0), updated_at = now() WHERE id = OLD.job_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_adjust_applicant_count ON swipes;
CREATE TRIGGER trg_adjust_applicant_count
AFTER INSERT OR UPDATE OF action OR DELETE ON swipes
FOR EACH ROW EXECUTE FUNCTION adjust_applicant_count_for_swipe();
