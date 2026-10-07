// Invoke only after the surrounding database transaction has committed.
import { invalidateTag, keys, TTL, getOrSet } from './cache.js';
export async function afterApplicationCreated(redis: Parameters<typeof invalidateTag>[0], jobId: string, applicantId: string) {
  await Promise.all([invalidateTag(redis, `job:${jobId}`), invalidateTag(redis, `recommendation:${applicantId}`)]);
}
export async function cachedJob<T>(redis: Parameters<typeof getOrSet>[0], jobId: string, read: () => Promise<T>) {
  return getOrSet(redis, keys.job(jobId), TTL.job, read, [`job:${jobId}`]);
}
