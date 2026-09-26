import { mkdir, readFile, writeFile, unlink } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import crypto from 'node:crypto';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadBucketCommand, CreateBucketCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
dotenv.config();

const driver = process.env.STORAGE_DRIVER || 'disk';
const root = process.env.RESUME_STORAGE_PATH || './data/resumes';
const bucket = process.env.MINIO_BUCKET || 'resumes';
const keyFor = (candidateId, filename) => `${candidateId}/${crypto.randomUUID()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

function s3() {
  return new S3Client({
    endpoint: process.env.MINIO_ENDPOINT,
    region: process.env.MINIO_REGION || 'us-east-1',
    forcePathStyle: true,
    credentials: { accessKeyId: process.env.MINIO_ACCESS_KEY, secretAccessKey: process.env.MINIO_SECRET_KEY }
  });
}

export async function ensureStorage() {
  if (driver === 'disk') return mkdir(root, { recursive: true });
  const client = s3();
  try { await client.send(new HeadBucketCommand({ Bucket: bucket })); }
  catch { await client.send(new CreateBucketCommand({ Bucket: bucket })); }
}

export async function putResume(candidateId, filename, bytes, contentType) {
  const key = keyFor(candidateId, filename);
  if (driver === 'disk') {
    const path = join(root, key); await mkdir(dirname(path), { recursive: true }); await writeFile(path, bytes);
  } else await s3().send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: bytes, ContentType: contentType }));
  return key;
}

export async function getResume(key) {
  if (driver === 'disk') return readFile(join(root, key));
  const response = await s3().send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  return Buffer.from(await response.Body.transformToByteArray());
}

export async function deleteResume(key) {
  if (driver === 'disk') return unlink(join(root, key));
  return s3().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
