"""Import the supplied cleaned job CSV into the SwipeX Job Service database.

Usage (from the repository root):
  python scripts/import_cleaned_jobs.py "C:\\path\\to\\cleaned_jobs.csv" --replace
"""
import argparse
import ast
import csv
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.database import Base, SessionLocal, engine  # noqa: E402
from app.models import Company, Job, Swipe  # noqa: E402


def text(value: str | None, limit: int | None = None) -> str:
    value = (value or "").strip()
    return value[:limit] if limit else value


def optional_float(value: str | None) -> int | None:
    try:
        return int(float(value)) if value and value.strip() else None
    except ValueError:
        return None


def parse_skills(value: str | None) -> str:
    try:
        items = ast.literal_eval(value or "[]")
        if isinstance(items, list):
            return "|".join(text(str(item), 80).lower() for item in items if str(item).strip())
    except (ValueError, SyntaxError):
        pass
    return "|".join(part.strip().lower() for part in (value or "").split(",") if part.strip())


def import_csv(path: Path, replace: bool = False, limit: int | None = None, skip: int = 0) -> tuple[int, int]:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    jobs_created = 0
    try:
        if replace:
            db.query(Swipe).delete()
            db.query(Job).delete()
            db.query(Company).delete()
            db.commit()

        companies = {company.name: company.id for company in db.query(Company).all()}
        with path.open(encoding="utf-8-sig", newline="") as file:
            for row_number, row in enumerate(csv.DictReader(file), start=1):
                if row_number <= skip:
                    continue
                if limit and jobs_created >= limit:
                    break
                company_name = text(row.get("companyName"), 160) or "Unknown company"
                company_id = companies.get(company_name)
                if company_id is None:
                    company = Company(
                        name=company_name,
                        company_type="Not specified in source data",
                        industry="Not specified in source data",
                        headquarters="Not specified in source data",
                    )
                    db.add(company)
                    db.flush()
                    company_id = company.id
                    companies[company_name] = company_id

                db.add(Job(
                    source_job_id=text(row.get("jobId"), 64) or None,
                    company_id=company_id,
                    title=text(row.get("title"), 160) or "Untitled job",
                    description=text(row.get("jobDescription")) or "No description provided.",
                    employment_type="Not specified in source data",
                    location=text(row.get("location"), 120) or "Not specified",
                    is_remote=False,  # The supplied dataset has no remote-work column.
                    salary_min=optional_float(row.get("minimumSalary")),
                    salary_max=optional_float(row.get("maximumSalary")),
                    skills=parse_skills(row.get("skills_list") or row.get("tagsAndSkills")),
                    experience_level=text(row.get("experience"), 40) or "Not specified",
                ))
                jobs_created += 1
                if jobs_created % 1000 == 0:
                    db.commit()
                    print(f"Imported {jobs_created} jobs...")
        db.commit()
        return jobs_created, len(companies)
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Import cleaned job data into SwipeX.")
    parser.add_argument("csv_path", type=Path)
    parser.add_argument("--replace", action="store_true", help="Remove existing Job/Company/Swipe records first.")
    parser.add_argument("--limit", type=int, help="Import only this many rows (useful for a quick smoke test).")
    parser.add_argument("--skip", type=int, default=0, help="Skip this many input rows (useful for resumable batch imports).")
    args = parser.parse_args()
    if not args.csv_path.is_file():
        parser.error(f"CSV file not found: {args.csv_path}")
    count, companies = import_csv(args.csv_path, args.replace, args.limit, args.skip)
    print(f"Import complete: {count} jobs across {companies} companies.")
