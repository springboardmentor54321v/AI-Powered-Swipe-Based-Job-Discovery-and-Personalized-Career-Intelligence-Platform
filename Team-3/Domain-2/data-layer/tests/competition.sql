BEGIN;
-- Run after replacing UUIDs with fixture ids. Ensures threshold semantics do not regress.
DO $$
BEGIN
  IF app.competition_level(0, now()) <> 'low' THEN RAISE EXCEPTION '0 must be low'; END IF;
  IF app.competition_level(10, now()) <> 'medium' THEN RAISE EXCEPTION '10 must be medium'; END IF;
  IF app.competition_level(20, now() - interval '7 days') <> 'high' THEN RAISE EXCEPTION 'age threshold must be high'; END IF;
  IF app.competition_level(100, now()) <> 'very_high' THEN RAISE EXCEPTION '100 must be very_high'; END IF;
END $$;
ROLLBACK;
