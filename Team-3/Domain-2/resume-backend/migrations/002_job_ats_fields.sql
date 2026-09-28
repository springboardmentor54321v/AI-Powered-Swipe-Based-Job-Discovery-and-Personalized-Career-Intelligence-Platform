-- JSON text keeps SQLite local development simple and maps directly to JSONB in Postgres.
-- required_skills: canonical skills expected for the role; keywords: ATS matching terms.
ALTER TABLE jobs ADD COLUMN required_skills TEXT NOT NULL DEFAULT '[]';
ALTER TABLE jobs ADD COLUMN keywords TEXT NOT NULL DEFAULT '[]';
