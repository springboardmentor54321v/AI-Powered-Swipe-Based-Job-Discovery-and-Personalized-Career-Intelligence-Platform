import { readFile } from 'node:fs/promises';
import { db, withTransaction } from '../src/db.js';

const path = process.argv[2];
if (!path) throw new Error('Usage: npm run restore -- backups/<file>.json');
const backup = JSON.parse(await readFile(path, 'utf8'));
const ordered = ['resume_version_skills', 'resume_skills', 'resume_versions', 'resumes', 'skills', 'jobs'];
withTransaction(() => {
  for (const table of ordered) db.exec(`DELETE FROM ${table}`);
  for (const table of [...ordered].reverse()) {
    for (const row of backup.tables[table] || []) {
      const columns = Object.keys(row); const marks = columns.map(() => '?').join(',');
      db.prepare(`INSERT INTO ${table} (${columns.join(',')}) VALUES (${marks})`).run(...columns.map(column => row[column]));
    }
  }
});
console.log(`Restored resume metadata from ${path}`);
