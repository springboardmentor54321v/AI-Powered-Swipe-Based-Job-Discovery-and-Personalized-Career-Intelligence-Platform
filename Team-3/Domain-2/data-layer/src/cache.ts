import type { RedisClientType } from 'redis';

export const keys = {
  job: (id: string) => `v1:job:${id}`,
  jobSearch: (hash: string) => `v1:job-search:${hash}`,
  recommendation: (userId: string) => `v1:recommendation:${userId}`,
  notificationUnread: (userId: string) => `v1:notification-unread:${userId}`,
  tag: (name: string) => `v1:tag:${name}`,
};

const TTL = { job: 300, search: 60, recommendation: 600, unread: 30 } as const;
type Redis = Pick<RedisClientType, 'get' | 'set' | 'sMembers' | 'sAdd' | 'expire' | 'del'>;

export async function getOrSet<T>(redis: Redis, key: string, ttlSeconds: number, loader: () => Promise<T>, tags: string[] = []): Promise<T> {
  try {
    const hit = await redis.get(key);
    if (hit) return JSON.parse(hit) as T;
  } catch { /* cache unavailable: fall through to DB */ }
  const value = await loader();
  try {
    await redis.set(key, JSON.stringify(value), { EX: ttlSeconds });
    await Promise.all(tags.map(async tag => { await redis.sAdd(keys.tag(tag), key); await redis.expire(keys.tag(tag), ttlSeconds + 60); }));
  } catch { /* data remains correct without cache */ }
  return value;
}

export async function invalidateTag(redis: Redis, tag: string): Promise<void> {
  try {
    const tagKey = keys.tag(tag); const members = await redis.sMembers(tagKey);
    if (members.length) await redis.del(members); await redis.del(tagKey);
  } catch { /* best effort; TTL bounds staleness */ }
}

export { TTL };
