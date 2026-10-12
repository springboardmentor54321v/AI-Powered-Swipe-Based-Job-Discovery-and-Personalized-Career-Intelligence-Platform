"""Idempotent schema upgrades for tables that already exist (db.create_all() never alters tables)."""
from sqlalchemy import text

_DDL = [
    "ALTER TABLE applications ADD COLUMN IF NOT EXISTS recruiter_notes TEXT",
    "ALTER TABLE applications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT now()",
]


def ensure_schema(db):
    if db.engine.dialect.name != "postgresql":
        return
    for statement in _DDL:  # one transaction per statement: a failure must not abort the others
        try:
            with db.engine.begin() as conn:
                conn.execute(text(statement))
        except Exception as exc:
            print("SCHEMA WARNING:", exc)
