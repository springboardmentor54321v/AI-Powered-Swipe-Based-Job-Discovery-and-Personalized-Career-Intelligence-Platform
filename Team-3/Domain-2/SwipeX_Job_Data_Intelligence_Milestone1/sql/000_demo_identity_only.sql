-- DEMO ONLY: this file is solely for testing the standalone Job & Data module.
-- Do not apply it when the Milestone 1 Authentication/RBAC migration is available.
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'JOB_SEEKER' CHECK (role IN ('JOB_SEEKER', 'RECRUITER', 'ADMIN')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
