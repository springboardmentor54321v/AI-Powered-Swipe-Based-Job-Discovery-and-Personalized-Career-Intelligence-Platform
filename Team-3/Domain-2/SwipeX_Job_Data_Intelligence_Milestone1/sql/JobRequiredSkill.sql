-- JobRequiredSkill table
CREATE TABLE IF NOT EXISTS job_required_skill (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES job(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    normalized_name TEXT,
    skill_level TEXT, -- e.g., beginner, intermediate, expert
    weight NUMERIC(5,2), -- relevance score
    source TEXT -- e.g., "hr", "auto-extracted"
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_job_required_skill_job ON job_required_skill(job_id);
CREATE INDEX IF NOT EXISTS idx_job_required_skill_name ON job_required_skill(skill_name);
