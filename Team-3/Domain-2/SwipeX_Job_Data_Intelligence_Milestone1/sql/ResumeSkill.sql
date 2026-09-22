-- ResumeSkill table
CREATE TABLE IF NOT EXISTS resume_skill (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_version_id UUID NOT NULL REFERENCES resume_version(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    normalized_name TEXT,
    extracted_at TIMESTAMPTZ DEFAULT now(),
    source TEXT,
    confidence NUMERIC(5,2)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_resume_skill_version ON resume_skill(resume_version_id);
CREATE INDEX IF NOT EXISTS idx_resume_skill_name ON resume_skill(skill_name);
