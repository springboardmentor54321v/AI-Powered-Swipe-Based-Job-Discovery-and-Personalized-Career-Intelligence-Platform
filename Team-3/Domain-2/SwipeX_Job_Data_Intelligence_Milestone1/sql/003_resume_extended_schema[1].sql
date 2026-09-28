-- SwipeX Day 1: Extended Resume Schema
-- Assumes an existing users table and jobs table.
-- Adjust existing table/column names if the current baseline differs.

CREATE TABLE IF NOT EXISTS resume_files (
    file_id BIGSERIAL PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    storage_key VARCHAR(500) NOT NULL,
    storage_type VARCHAR(20) NOT NULL
        CHECK (storage_type IN ('LOCAL', 'MINIO')),
    mime_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL CHECK (file_size >= 0),
    checksum VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS resumes (
    resume_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS resume_versions (
    resume_version_id BIGSERIAL PRIMARY KEY,
    resume_id BIGINT NOT NULL REFERENCES resumes(resume_id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL CHECK (version_number > 0),
    file_id BIGINT NOT NULL REFERENCES resume_files(file_id),
    extracted_text TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'UPLOADED'
        CHECK (status IN ('UPLOADED', 'PROCESSING', 'READY', 'FAILED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (resume_id, version_number),
    UNIQUE (file_id)
);

CREATE TABLE IF NOT EXISTS resume_skills (
    resume_skill_id BIGSERIAL PRIMARY KEY,
    resume_version_id BIGINT NOT NULL
        REFERENCES resume_versions(resume_version_id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    skill_type VARCHAR(50),
    confidence_score NUMERIC(5,4)
        CHECK (confidence_score >= 0 AND confidence_score <= 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE jobs
    ADD COLUMN IF NOT EXISTS required_skills JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE jobs
    ADD COLUMN IF NOT EXISTS required_keywords JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE jobs
    ADD COLUMN IF NOT EXISTS preferred_skills JSONB NOT NULL DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_resumes_user_id
    ON resumes(user_id);

CREATE INDEX IF NOT EXISTS idx_resume_versions_resume_id
    ON resume_versions(resume_id);

CREATE INDEX IF NOT EXISTS idx_resume_skills_version_id
    ON resume_skills(resume_version_id);

CREATE INDEX IF NOT EXISTS idx_jobs_required_skills_gin
    ON jobs USING GIN(required_skills);

CREATE INDEX IF NOT EXISTS idx_jobs_required_keywords_gin
    ON jobs USING GIN(required_keywords);
