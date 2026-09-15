CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN CREATE TYPE company_type AS ENUM ('MNC', 'STARTUP', 'NEWLY_FOUNDED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE swipe_action AS ENUM ('APPLY', 'SAVE', 'SKIP'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_company_id TEXT UNIQUE,
  name TEXT NOT NULL,
  company_type company_type NOT NULL,
  about TEXT, company_size TEXT, industry TEXT,
  is_newly_founded BOOLEAN NOT NULL DEFAULT FALSE,
  review_count INTEGER CHECK (review_count IS NULL OR review_count >= 0),
  aggregate_rating NUMERIC(2,1) CHECK (aggregate_rating IS NULL OR aggregate_rating BETWEEN 0 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK ((company_type = 'NEWLY_FOUNDED') = is_newly_founded)
);

CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_job_id TEXT NOT NULL UNIQUE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
  title TEXT NOT NULL, description TEXT, location TEXT NOT NULL,
  is_remote BOOLEAN NOT NULL DEFAULT FALSE, job_type TEXT,
  skills TEXT[] NOT NULL DEFAULT '{}',
  minimum_salary NUMERIC(14,2) CHECK (minimum_salary IS NULL OR minimum_salary >= 0),
  maximum_salary NUMERIC(14,2) CHECK (maximum_salary IS NULL OR maximum_salary >= 0),
  salary_currency CHAR(3) NOT NULL DEFAULT 'INR', salary_display TEXT,
  minimum_experience NUMERIC(4,1) CHECK (minimum_experience IS NULL OR minimum_experience >= 0),
  maximum_experience NUMERIC(4,1) CHECK (maximum_experience IS NULL OR maximum_experience >= 0),
  posted_at TIMESTAMPTZ, raw_job_uploaded TEXT,
  applicant_count INTEGER NOT NULL DEFAULT 0 CHECK (applicant_count >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (maximum_salary IS NULL OR minimum_salary IS NULL OR maximum_salary >= minimum_salary),
  CHECK (maximum_experience IS NULL OR minimum_experience IS NULL OR maximum_experience >= minimum_experience)
);

-- Replace users(id) only if the Milestone 1 identity schema uses another table.
CREATE TABLE IF NOT EXISTS saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE, created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, job_id)
);
CREATE TABLE IF NOT EXISTS swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE, action swipe_action NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(user_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_companies_name_trgm ON companies USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_companies_type ON companies(company_type);
CREATE INDEX IF NOT EXISTS idx_jobs_title_trgm ON jobs USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_jobs_search_document ON jobs USING GIN (to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(description,'') || ' ' || coalesce(location,'') || ' ' || array_to_string(skills,' ')));
CREATE INDEX IF NOT EXISTS idx_jobs_skills_gin ON jobs USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON jobs(job_type) WHERE job_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_jobs_salary_range ON jobs(minimum_salary, maximum_salary) WHERE minimum_salary IS NOT NULL AND maximum_salary IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_jobs_experience_range ON jobs(minimum_experience, maximum_experience) WHERE minimum_experience IS NOT NULL AND maximum_experience IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_jobs_active_posted ON jobs(is_active, posted_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_jobs_applicant_count ON jobs(applicant_count);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user ON saved_jobs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_swipes_user ON swipes(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_swipes_job_action ON swipes(job_id, action);
