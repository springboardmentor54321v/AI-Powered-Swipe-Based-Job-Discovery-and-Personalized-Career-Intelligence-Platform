-- Raises an error on any integrity violation so scripts/CI can fail reliably.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.jobs j
    LEFT JOIN public.applications a ON a.job_id = j.id
    GROUP BY j.id, j.applicant_count
    HAVING j.applicant_count <> count(a.id) FILTER (WHERE a.status <> 'saved')
  ) THEN
    RAISE EXCEPTION 'jobs.applicant_count differs from non-saved applications';
  END IF;

  IF EXISTS (
    SELECT 1 FROM app.notification n
    WHERE n.read_at IS NOT NULL AND n.read_at < n.created_at
  ) THEN
    RAISE EXCEPTION 'notification read_at precedes created_at';
  END IF;

  IF EXISTS (
    SELECT 1 FROM app.application_status_event e
    JOIN public.applications a ON a.id = e.application_id
    WHERE e.job_id <> a.job_id OR e.applicant_id <> a.applicant_id
  ) THEN
    RAISE EXCEPTION 'application status event does not match its application';
  END IF;

  IF EXISTS (
    SELECT 1 FROM app.daily_funnel_aggregate
    WHERE applications <> saved + applied + shortlisted + interview + rejected
  ) THEN
    RAISE EXCEPTION 'daily application funnel stage totals do not match';
  END IF;
END $$;
