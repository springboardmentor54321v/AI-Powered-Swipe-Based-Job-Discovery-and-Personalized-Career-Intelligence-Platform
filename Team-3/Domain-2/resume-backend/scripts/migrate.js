import { readdir, readFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { db, withTransaction } from '../src/db.js';

await mkdir('./data', { recursive: true });
db.exec('CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)');
for (const name of (await readdir('./migrations')).filter(n => n.endsWith('.sql')).sort()) {
  if (db.prepare('SELECT 1 FROM schema_migrations WHERE name = ?').get(name)) continue;
  const sql = await readFile(join('./migrations', name), 'utf8');
  withTransaction(() => { db.exec(sql); db.prepare('INSERT INTO schema_migrations(name) VALUES (?)').run(name); });
  console.log(`Applied ${name}`);
}
