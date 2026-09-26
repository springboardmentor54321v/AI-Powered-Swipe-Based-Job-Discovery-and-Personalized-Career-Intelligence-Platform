import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { db } from '../src/db.js';

const tables = ['jobs', 'resumes', 'skills', 'resume_skills', 'resume_versions', 'resume_version_skills'];
const data = Object.fromEntries(tables.map(table => [table, db.prepare(`SELECT * FROM ${table}`).all()]));
const destination = process.argv[2] || join('backups', `resume-metadata-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
await mkdir('backups', { recursive: true });
await writeFile(destination, JSON.stringify({ version: 1, createdAt: new Date().toISOString(), tables: data }, null, 2));
console.log(`Backup written: ${destination}`);
