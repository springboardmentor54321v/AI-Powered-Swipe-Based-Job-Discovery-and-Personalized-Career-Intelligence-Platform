import express from 'express';
import multer from 'multer';
import crypto from 'node:crypto';
import { db } from './db.js';
import { ensureStorage, putResume, getResume } from './storage.js';

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
app.use(express.json());

app.post('/resumes', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.body.candidateId || !req.file) return res.status(400).json({ error: 'candidateId and file are required' });
    const id = crypto.randomUUID();
    const storageKey = await putResume(req.body.candidateId, req.file.originalname, req.file.buffer, req.file.mimetype);
    db.prepare('INSERT INTO resumes (id,candidate_id,filename,content_type,storage_key,size_bytes) VALUES (?,?,?,?,?,?)')
      .run(id, req.body.candidateId, req.file.originalname, req.file.mimetype, storageKey, req.file.size);
    res.status(201).json({ id, storageKey });
  } catch (error) { next(error); }
});

app.get('/resumes/:id/download', async (req, res, next) => {
  try {
    const item = db.prepare('SELECT * FROM resumes WHERE id = ?').get(req.params.id);
    if (!item) return res.sendStatus(404);
    res.type(item.content_type).attachment(item.filename).send(await getResume(item.storage_key));
  } catch (error) { next(error); }
});

app.get('/jobs', (_req, res) => res.json(db.prepare('SELECT id,title,company,required_skills,keywords FROM jobs').all().map(j => ({ ...j, required_skills: JSON.parse(j.required_skills), keywords: JSON.parse(j.keywords) }))));
app.use((err, _req, res, _next) => { console.error(err); res.status(500).json({ error: 'Internal server error' }); });

await ensureStorage();
app.listen(process.env.PORT || 3000, () => console.log('Resume API listening'));
