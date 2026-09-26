import test from 'node:test';
import assert from 'node:assert/strict';
import { rm, readFile } from 'node:fs/promises';

process.env.DATABASE_PATH = './data/repository-test.db';
await rm(process.env.DATABASE_PATH, { force: true });
const { db } = await import('../src/db.js');
for (const migration of ['001_initial.sql', '002_job_ats_fields.sql', '003_skill_catalog.sql', '004_resume_versions_and_matching.sql']) {
  db.exec(await readFile(`./migrations/${migration}`, 'utf8'));
}
const { createVersion, getDefaultVersion, setDefaultVersion, addSkillsToVersion, matchDefaultResumeToJob } = await import('../src/repositories/resumeRepository.js');

function makeResume(id) {
  db.prepare('INSERT INTO resumes (id,candidate_id,filename,content_type,storage_key,size_bytes) VALUES (?,?,?,?,?,?)')
    .run(id, 'candidate-1', 'resume.pdf', 'application/pdf', `${id}.pdf`, 10);
}

test('new default version replaces the previous default', () => {
  makeResume('resume-a');
  const first = createVersion('resume-a');
  const second = createVersion('resume-a');
  assert.equal(getDefaultVersion('resume-a').id, second.id);
  assert.equal(db.prepare('SELECT COUNT(*) AS count FROM resume_versions WHERE resume_id = ? AND is_default = 1').get('resume-a').count, 1);
  assert.equal(setDefaultVersion('resume-a', first.id).id, first.id);
});

test('skill-match helper returns an ATS percentage from required skills only', () => {
  makeResume('resume-b');
  const version = createVersion('resume-b');
  addSkillsToVersion(version.id, ['Node.js', 'SQL', 'Docker']);
  db.prepare('INSERT INTO jobs (id,title,company,description,required_skills,keywords) VALUES (?,?,?,?,?,?)')
    .run(42, 'Backend Engineer', 'Acme', '', JSON.stringify(['node.js', 'sql', 'python']), JSON.stringify(['express']));
  assert.deepEqual(matchDefaultResumeToJob('resume-b', 42), {
    resumeVersionId: version.id, requiredCount: 3, matchedCount: 2, score: 66.67, matchedSkills: ['node.js', 'sql']
  });
});
