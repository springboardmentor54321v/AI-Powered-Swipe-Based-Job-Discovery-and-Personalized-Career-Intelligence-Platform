import os
import csv
import json
import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models.company import Company, CompanyType
from app.models.job import (
    Job, JobType, WorkplaceType, ExperienceLevel, CompetitionLevel
)
from app.models.swipe import Swipe, SwipeDirection, SwipeActionType
from app.models.saved_job import SavedJob

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data"))
COMPANIES_CSV = os.path.join(DATA_DIR, "companies_dataset.csv")
JOBS_CSV = os.path.join(DATA_DIR, "jobs_dataset.csv")


def seed_database(db: Session = None):
    """
    Ingests and seeds the database using the CSV dataset files in data/
    Populates Companies, Jobs, Swipes, and SavedJobs.
    """
    close_after = False
    if db is None:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        close_after = True

    try:
        # Check if already seeded
        existing_companies = db.query(Company).count()
        if existing_companies > 0:
            print(f"Database already contains {existing_companies} companies. Skipping seed.")
            return

        print(f"Ingesting datasets from {DATA_DIR} into database...")
        
        # 1. Ingest Companies CSV
        company_map = {}
        if os.path.exists(COMPANIES_CSV):
            with open(COMPANIES_CSV, mode="r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    c_type = CompanyType(row["company_type"])
                    is_new = row.get("is_newly_founded", "False").lower() == "true"
                    company = Company(
                        name=row["name"],
                        slug=row["slug"],
                        company_type=c_type,
                        is_newly_founded=is_new,
                        industry=row["industry"],
                        headquarters=row["headquarters"],
                        funding_stage=row.get("funding_stage", "Growth"),
                        website=row["website"],
                        founded_year=int(row["founded_year"]) if row["founded_year"] else None,
                        employee_count_range=row["employee_count_range"]
                    )
                    db.add(company)
                    db.flush()
                    company_map[row["name"]] = company.id
            db.commit()
            print(f"Ingested {len(company_map)} companies from CSV.")
        else:
            print(f"Warning: {COMPANIES_CSV} not found.")

        # 2. Ingest Jobs CSV
        jobs_created = []
        if os.path.exists(JOBS_CSV):
            with open(JOBS_CSV, mode="r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    comp_id = company_map.get(row["company_name"])
                    if not comp_id:
                        continue

                    # Parse dates
                    try:
                        posted_at = datetime.strptime(row["posted_at"], "%Y-%m-%d %H:%M:%S")
                    except Exception:
                        posted_at = datetime.utcnow()

                    # Parse skills list
                    try:
                        skills_list = json.loads(row["skills_required"])
                    except Exception:
                        skills_list = [s.strip() for s in row["skills_required"].split(",") if s.strip()]

                    job = Job(
                        company_id=comp_id,
                        title=row["job_title"],
                        role_category=row.get("role_category", "Technology"),
                        description=row["job_description"],
                        responsibilities=row.get("responsibilities", ""),
                        requirements=row.get("requirements", ""),
                        job_type=JobType(row["job_type"]),
                        workplace_type=WorkplaceType(row["workplace_type"]),
                        location=row["location"],
                        salary_min=int(row["salary_min"]) if row["salary_min"] else None,
                        salary_max=int(row["salary_max"]) if row["salary_max"] else None,
                        salary_currency=row.get("salary_currency", "INR"),
                        salary_period=row.get("salary_period", "Per Annum"),
                        experience_level=ExperienceLevel(row["experience_level"]),
                        experience_years_min=int(row["experience_years_min"]) if row.get("experience_years_min") else 0,
                        experience_years_max=int(row["experience_years_max"]) if row.get("experience_years_max") else 2,
                        competition_level=CompetitionLevel(row["competition_level"]),
                        applicant_count=int(row["applicant_count"]) if row.get("applicant_count") else 0,
                        is_fresher_friendly=row.get("is_fresher_friendly", "True").lower() == "true",
                        is_active=True,
                        posted_at=posted_at
                    )
                    job.skills = skills_list
                    db.add(job)
                    jobs_created.append(job)

            db.commit()
            print(f"Ingested {len(jobs_created)} jobs from CSV into database.")

        # 3. Insert sample user swipe interactions
        if jobs_created:
            now = datetime.utcnow()
            sample_swipes = [
                {"user_id": "demo-user-1", "job_id": jobs_created[0].id, "direction": SwipeDirection.RIGHT, "action": SwipeActionType.APPLY},
                {"user_id": "demo-user-1", "job_id": jobs_created[1].id, "direction": SwipeDirection.RIGHT, "action": SwipeActionType.SAVE},
                {"user_id": "demo-user-1", "job_id": jobs_created[2].id, "direction": SwipeDirection.LEFT, "action": SwipeActionType.SKIP},
                {"user_id": "demo-user-1", "job_id": jobs_created[3].id, "direction": SwipeDirection.RIGHT, "action": SwipeActionType.APPLY},
                {"user_id": "demo-user-1", "job_id": jobs_created[4].id, "direction": SwipeDirection.LEFT, "action": SwipeActionType.SKIP},
                {"user_id": "candidate-jane", "job_id": jobs_created[0].id, "direction": SwipeDirection.RIGHT, "action": SwipeActionType.APPLY},
                {"user_id": "candidate-jane", "job_id": jobs_created[5].id, "direction": SwipeDirection.RIGHT, "action": SwipeActionType.SAVE},
            ]

            for s in sample_swipes:
                swipe = Swipe(
                    user_id=s["user_id"],
                    job_id=s["job_id"],
                    direction=s["direction"],
                    action_type=s["action"],
                    created_at=now - timedelta(hours=random.randint(2, 48))
                )
                db.add(swipe)

            # 4. Insert sample saved jobs (Milestone 2 SavedJob table)
            sample_saved = [
                {"user_id": "demo-user-1", "job_id": jobs_created[1].id, "notes": "High priority: Python backend role at scale-up startup"},
                {"user_id": "demo-user-1", "job_id": jobs_created[5].id, "notes": "Generative AI role - review portfolio before applying"},
                {"user_id": "candidate-jane", "job_id": jobs_created[2].id, "notes": "Check remote flexibility and relocation stipend"},
            ]
            for sv in sample_saved:
                saved_job = SavedJob(
                    user_id=sv["user_id"],
                    job_id=sv["job_id"],
                    notes=sv["notes"],
                    saved_at=now - timedelta(hours=random.randint(1, 24))
                )
                db.add(saved_job)

            db.commit()
            print(f"Inserted {len(sample_swipes)} swipes and {len(sample_saved)} saved jobs.")

        print("Dataset ingestion and database seeding completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error during dataset ingestion: {e}")
        raise e
    finally:
        if close_after:
            db.close()


if __name__ == "__main__":
    seed_database()
