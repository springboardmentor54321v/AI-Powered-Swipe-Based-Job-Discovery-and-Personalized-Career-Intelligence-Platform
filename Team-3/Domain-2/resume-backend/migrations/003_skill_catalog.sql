CREATE TABLE IF NOT EXISTS skills (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  normalized_name TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS resume_skills (
  resume_id TEXT NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'parsed',
  confidence REAL,
  PRIMARY KEY (resume_id, skill_id)
);

CREATE INDEX IF NOT EXISTS resume_skills_skill_id_idx ON resume_skills(skill_id);
