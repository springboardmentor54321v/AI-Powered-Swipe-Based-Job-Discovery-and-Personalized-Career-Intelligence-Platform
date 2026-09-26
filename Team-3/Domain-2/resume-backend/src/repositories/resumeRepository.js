import crypto from 'node:crypto';
import { db, withTransaction } from '../db.js';

export function createVersion(resumeId, { status = 'UPLOADED', extractedText = null, makeDefault = true } = {}) {
  return withTransaction(() => {
    const next = db.prepare('SELECT COALESCE(MAX(version_number), 0) + 1 AS number FROM resume_versions WHERE resume_id = ?').get(resumeId).number;
    if (makeDefault) db.prepare('UPDATE resume_versions SET is_default = 0 WHERE resume_id = ?').run(resumeId);
    const id = crypto.randomUUID();
    db.prepare('INSERT INTO resume_versions (id, resume_id, version_number, status, is_default, extracted_text) VALUES (?, ?, ?, ?, ?, ?)')
      .run(id, resumeId, next, status, makeDefault ? 1 : 0, extractedText);
    return db.prepare('SELECT * FROM resume_versions WHERE id = ?').get(id);
  });
}

export function getDefaultVersion(resumeId) {
  return db.prepare('SELECT * FROM resume_versions WHERE resume_id = ? AND is_default = 1').get(resumeId) || null;
}

export function setDefaultVersion(resumeId, versionId) {
  return withTransaction(() => {
    const version = db.prepare('SELECT id FROM resume_versions WHERE id = ? AND resume_id = ?').get(versionId, resumeId);
    if (!version) throw new Error('Resume version not found');
    db.prepare('UPDATE resume_versions SET is_default = 0 WHERE resume_id = ?').run(resumeId);
    db.prepare('UPDATE resume_versions SET is_default = 1 WHERE id = ?').run(versionId);
    return getDefaultVersion(resumeId);
  });
}

export function addSkillsToVersion(resumeVersionId, skills, source = 'parsed') {
  return withTransaction(() => {
    const skill = db.prepare('INSERT INTO skills (name, normalized_name) VALUES (?, ?) ON CONFLICT(normalized_name) DO UPDATE SET name = excluded.name RETURNING id');
    const link = db.prepare('INSERT INTO resume_version_skills (resume_version_id, skill_id, source) VALUES (?, ?, ?) ON CONFLICT(resume_version_id, skill_id) DO NOTHING');
    for (const name of skills) {
      const normalized = name.trim().toLowerCase();
      if (!normalized) continue;
      link.run(resumeVersionId, skill.get(name.trim(), normalized).id, source);
    }
  });
}

// SQL performs the set intersection; no resume text or full skill catalog is loaded into the API process.
export function matchVersionToJob(resumeVersionId, jobId) {
  const row = db.prepare(`
    WITH required AS (
      SELECT DISTINCT lower(value) AS skill FROM json_each((SELECT required_skills FROM jobs WHERE id = ?))
    ), matched AS (
      SELECT r.skill FROM required r
      JOIN skills s ON s.normalized_name = r.skill
      JOIN resume_version_skills rvs ON rvs.skill_id = s.id
      WHERE rvs.resume_version_id = ?
    )
    SELECT (SELECT COUNT(*) FROM required) AS required_count,
           (SELECT COUNT(*) FROM matched) AS matched_count,
           COALESCE((SELECT json_group_array(skill) FROM matched), '[]') AS matched_skills
  `).get(jobId, resumeVersionId);
  if (row.required_count === 0 && !db.prepare('SELECT 1 FROM jobs WHERE id = ?').get(jobId)) throw new Error('Job not found');
  return {
    requiredCount: row.required_count,
    matchedCount: row.matched_count,
    score: row.required_count ? Math.round((row.matched_count / row.required_count) * 10000) / 100 : 0,
    matchedSkills: JSON.parse(row.matched_skills)
  };
}

export function matchDefaultResumeToJob(resumeId, jobId) {
  const version = getDefaultVersion(resumeId);
  if (!version) throw new Error('Default resume version not found');
  return { resumeVersionId: version.id, ...matchVersionToJob(version.id, jobId) };
}
