"""Redis-first cache with a local development fallback."""
import json
import logging
import os
import time
from typing import Any

logger = logging.getLogger(__name__)

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
            try:
                raw = self._redis.get(key)
                return json.loads(raw) if raw else None
            except Exception:
                logger.warning("Redis cache read failed; falling back to local cache", exc_info=True)
                self._redis = None
        entry = self._local.get(key)
        if not entry or entry[0] < time.time():
            self._local.pop(key, None)
            return None
        return entry[1]

    def set(self, key: str, value: Any, ttl: int = 60) -> None:
        if self._redis:
            try:
                self._redis.setex(key, ttl, json.dumps(value, default=str))
                return
            except Exception:
                logger.warning("Redis cache write failed; falling back to local cache", exc_info=True)
                self._redis = None
        self._local[key] = (time.time() + ttl, value)

    def invalidate_jobs(self) -> None:
        if self._redis:
            try:
                for key in self._redis.scan_iter("jobs:*"):
                    self._redis.delete(key)
                return
            except Exception:
                logger.warning("Redis cache invalidation failed; clearing local cache", exc_info=True)
                self._redis = None
        self._local.clear()


cache = JobFeedCache()
