-- ResumeVersion table
CREATE TABLE IF NOT EXISTS resume_version (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID NOT NULL REFERENCES resume(id) ON DELETE CASCADE,
    file_object_key TEXT NOT NULL, -- MinIO object key or local absolute path
    original_filename TEXT NOT NULL,
    mime_type TEXT,
    sha256_hash TEXT NOT NULL,
    file_size_bytes BIGINT,
    uploaded_at TIMESTAMPTZ DEFAULT now(),
    metadata JSONB,
    CONSTRAINT uq_resume_version_resume_file UNIQUE (resume_id, file_object_key)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_resume_version_resume ON resume_version(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_version_hash ON resume_version(sha256_hash);
