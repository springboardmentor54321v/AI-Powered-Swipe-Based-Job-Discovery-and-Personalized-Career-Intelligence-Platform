"""
SwipeX Local Environment Verification Script (Milestone 1 - Day 2)
Verifies:
1. PostgreSQL connectivity and seeded roles via Django ORM.
2. Redis connectivity.
"""
import os
import sys

# Setup Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
import django
django.setup()

from django.db import connection
from apps.users.models import Role
from django.conf import settings

def verify_postgresql():
    """Verify PostgreSQL connectivity and query tables."""
    print("--- PostgreSQL Verification ---")
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            ver = cursor.fetchone()
            print("Status: CONNECTED")
            print(f"Version: {ver[0]}")

            roles = list(Role.objects.all().order_by("id"))
            print(f"Seeded Roles count: {len(roles)}")
            for r in roles:
                print(f"  - Role ID {r.id}: {r.name} ({r.description})")
            return True
    except Exception as e:
        print("Status: NOT CONNECTED")
        print(f"Error: {e}")
        return False

def verify_redis():
    """Verify Redis connectivity."""
    print("\n--- Redis Verification ---")
    try:
        import redis
        client = redis.Redis(
            host=settings.REDIS_HOST,
            port=int(settings.REDIS_PORT),
            password=settings.REDIS_PASSWORD or None,
            db=int(settings.REDIS_DB),
            socket_timeout=2.0
        )
        ping_ok = client.ping()
        if ping_ok:
            print("Status: CONNECTED")
            return True
        else:
            print("Status: NOT CONNECTED")
            print("Blocker: Ping returned False.")
            return False
    except Exception as e:
        print("Status: NOT CONNECTED")
        print(f"Blocker: Cannot reach Redis on {settings.REDIS_HOST}:{settings.REDIS_PORT} ({e}).")
        print("Note: Redis server or Docker is not currently running on the local Windows host.")
        return False

if __name__ == "__main__":
    pg_ok = verify_postgresql()
    redis_ok = verify_redis()
    print("\nSummary:")
    print(f"PostgreSQL: {'CONNECTED' if pg_ok else 'NOT CONNECTED'}")
    print(f"Redis:      {'CONNECTED' if redis_ok else 'NOT CONNECTED'}")
