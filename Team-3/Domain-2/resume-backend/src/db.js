import { DatabaseSync } from 'node:sqlite';
import dotenv from 'dotenv';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
dotenv.config();

const databasePath = process.env.DATABASE_PATH || './data/resume.db';
mkdirSync(dirname(databasePath), { recursive: true });
export const db = new DatabaseSync(databasePath);
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

export function withTransaction(fn) {
  db.exec('BEGIN');
  try { const result = fn(); db.exec('COMMIT'); return result; }
  catch (error) { db.exec('ROLLBACK'); throw error; }
}
