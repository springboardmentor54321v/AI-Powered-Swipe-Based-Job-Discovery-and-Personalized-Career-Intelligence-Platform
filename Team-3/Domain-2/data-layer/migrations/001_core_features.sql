BEGIN;

CREATE SCHEMA IF NOT EXISTS app;

CREATE TABLE IF NOT EXISTS app.notification (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('application_status','job_match','message','system')),
  title text NOT NULL CHECK (char_length(title) <= 180),
  body text NOT NULL CHECK (char_length(body) <= 4000),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);

CREATE TABLE IF NOT EXISTS app.alert_preference (
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  alert_type text NOT NULL CHECK (alert_type IN ('application_status','job_match','message','system')),
  channel text NOT NULL CHECK (channel IN ('in_app','email','push')),
  enabled boolean NOT NULL DEFAULT true,
  quiet_start time,
  quiet_end time,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, alert_type, channel),
  CHECK ((quiet_start IS NULL) = (quiet_end IS NULL))
);

CREATE TABLE IF NOT EXISTS app.application_status_event (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  applicant_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  from_status text,
  to_status text NOT NULL,
  actor_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  CHECK (from_status IS NULL OR from_status <> to_status)
);

CREATE INDEX IF NOT EXISTS notification_unread_idx ON app.notification (user_id, created_at DESC) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS notification_expiry_idx ON app.notification (expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS status_event_application_idx ON app.application_status_event (application_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS status_event_job_time_idx ON app.application_status_event (job_id, occurred_at DESC);

CREATE OR REPLACE FUNCTION app.application_status_event_trigger()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' OR NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO app.application_status_event (application_id, job_id, applicant_id, from_status, to_status)
    VALUES (NEW.id, NEW.job_id, NEW.applicant_id,
            CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE OLD.status END, NEW.status);
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS application_status_event_trg ON public.applications;
CREATE TRIGGER application_status_event_trg AFTER INSERT OR UPDATE OF status
ON public.applications FOR EACH ROW EXECUTE FUNCTION app.application_status_event_trigger();

COMMIT;
