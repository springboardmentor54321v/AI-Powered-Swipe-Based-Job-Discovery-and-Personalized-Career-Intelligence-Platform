import { db } from '../src/db.js';

const checks = {
  orphanVersions: `SELECT COUNT(*) AS count FROM resume_versions v LEFT JOIN resumes r ON r.id = v.resume_id WHERE r.id IS NULL`,
  orphanVersionSkills: `SELECT COUNT(*) AS count FROM resume_version_skills rvs LEFT JOIN resume_versions v ON v.id = rvs.resume_version_id WHERE v.id IS NULL`,
  multipleDefaults: `SELECT COUNT(*) AS count FROM (SELECT resume_id FROM resume_versions GROUP BY resume_id HAVING SUM(is_default) > 1)`,
  missingDefaults: `SELECT COUNT(*) AS count FROM (SELECT resume_id FROM resume_versions GROUP BY resume_id HAVING SUM(is_default) = 0)`,
  invalidJobJson: `SELECT COUNT(*) AS count FROM jobs WHERE NOT json_valid(required_skills) OR NOT json_valid(keywords)`
};

const failures = Object.entries(checks).map(([name, sql]) => [name, db.prepare(sql).get().count]).filter(([, count]) => count > 0);
if (failures.length) {
  console.error('Data-integrity validation failed:', Object.fromEntries(failures));
  process.exitCode = 1;
} else console.log('Data-integrity validation passed: no orphan records, duplicate defaults, or invalid ATS JSON.');
