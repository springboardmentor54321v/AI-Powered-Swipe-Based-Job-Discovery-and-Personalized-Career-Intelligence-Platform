#!/bin/sh
set -eu

until pg_isready -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE"; do
  sleep 2
done

psql -v ON_ERROR_STOP=1 -f /migrations/001_core_features.sql
psql -v ON_ERROR_STOP=1 -f /migrations/002_competition_counter.sql
psql -v ON_ERROR_STOP=1 -f /migrations/003_analytics.sql
psql -v ON_ERROR_STOP=1 -f /migrations/refresh_analytics.sql
