import { strict as assert } from 'node:assert';
import { ensureStorage, putResume, getResume, deleteResume } from '../src/storage.js';

await ensureStorage();
const body = Buffer.from('resume storage smoke test');
const key = await putResume('storage-check', 'smoke.txt', body, 'text/plain');
try {
  assert.deepEqual(await getResume(key), body);
  console.log(`Storage read/write verified (${process.env.STORAGE_DRIVER || 'disk'}): ${key}`);
} finally { await deleteResume(key); }
