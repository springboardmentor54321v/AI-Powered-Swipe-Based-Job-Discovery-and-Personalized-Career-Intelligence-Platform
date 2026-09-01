"""Redis-first cache with a local development fallback."""
import json
import os
import time
from typing import Any

try:
    from redis import Redis
except ImportError:  # Allows source inspection before dependencies are installed.
    Redis = None


class JobFeedCache:
    def __init__(self) -> None:
        self._local: dict[str, tuple[float, Any]] = {}
        self._redis = None
        url = os.getenv("REDIS_URL")
        if url and Redis:
            try:
                candidate = Redis.from_url(url, decode_responses=True, socket_connect_timeout=1)
                candidate.ping()
                self._redis = candidate
            except Exception:
                self._redis = None

    def get(self, key: str) -> Any | None:
        if self._redis:
            raw = self._redis.get(key)
            return json.loads(raw) if raw else None
        entry = self._local.get(key)
        if not entry or entry[0] < time.time():
            self._local.pop(key, None)
            return None
        return entry[1]

    def set(self, key: str, value: Any, ttl: int = 60) -> None:
        if self._redis:
            self._redis.setex(key, ttl, json.dumps(value, default=str))
        else:
            self._local[key] = (time.time() + ttl, value)

    def invalidate_jobs(self) -> None:
        if self._redis:
            for key in self._redis.scan_iter("jobs:*"):
                self._redis.delete(key)
        else:
            self._local.clear()


cache = JobFeedCache()
