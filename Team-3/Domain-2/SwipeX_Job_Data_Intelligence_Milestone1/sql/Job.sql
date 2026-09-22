-- Job table
CREATE TABLE IF NOT EXISTS job (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    posted_at TIMESTAMPTZ DEFAULT now(),
    company_id UUID NOT NULL -- assumes a Companies table exists
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_job_company ON job(company_id);
CREATE INDEX IF NOT EXISTS idx_job_posted ON job(posted_at);
