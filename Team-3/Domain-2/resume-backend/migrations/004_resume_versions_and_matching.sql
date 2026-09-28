-- One resume can have many parsed/uploaded versions. Exactly one may be default.
CREATE TABLE IF NOT EXISTS resume_versions (
  id TEXT PRIMARY KEY,
  resume_id TEXT NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL CHECK (version_number > 0),
  status TEXT NOT NULL DEFAULT 'READY' CHECK (status IN ('UPLOADED', 'PROCESSING', 'READY', 'FAILED')),
  is_default INTEGER NOT NULL DEFAULT 0 CHECK (is_default IN (0, 1)),
  extracted_text TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (resume_id, version_number)
);

-- Make existing uploaded resumes usable immediately as their own first version.
INSERT INTO resume_versions (id, resume_id, version_number, status, is_default)
SELECT 'legacy-' || id, id, 1, 'READY', 1 FROM resumes
WHERE NOT EXISTS (SELECT 1 FROM resume_versions v WHERE v.resume_id = resumes.id);

CREATE UNIQUE INDEX IF NOT EXISTS resume_versions_one_default_idx
  ON resume_versions(resume_id) WHERE is_default = 1;
CREATE INDEX IF NOT EXISTS resume_versions_resume_default_idx
  ON resume_versions(resume_id, is_default, version_number DESC);

CREATE TABLE IF NOT EXISTS resume_version_skills (
  resume_version_id TEXT NOT NULL REFERENCES resume_versions(id) ON DELETE CASCADE,
  skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'parsed' CHECK (source IN ('parsed', 'manual', 'imported')),
  confidence REAL CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
  PRIMARY KEY (resume_version_id, skill_id)
);
CREATE INDEX IF NOT EXISTS resume_version_skills_skill_idx
  ON resume_version_skills(skill_id, resume_version_id);
