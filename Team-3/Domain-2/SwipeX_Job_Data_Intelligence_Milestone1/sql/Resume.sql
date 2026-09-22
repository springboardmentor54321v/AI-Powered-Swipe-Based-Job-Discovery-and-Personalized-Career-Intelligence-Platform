-- Resume table
CREATE TABLE IF NOT EXISTS resume (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    current_version_id UUID REFERENCES resume_version(id),
    owner_user_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_resume_owner ON resume(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_resume_current_version ON resume(current_version_id);
