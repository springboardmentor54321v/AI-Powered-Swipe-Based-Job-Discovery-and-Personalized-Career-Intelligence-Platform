import hashlib
import json
from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import Depends, FastAPI, Header, HTTPException, Query, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session, joinedload

from .cache import cache
from .database import Base, engine, get_db
from .models import Job, Swipe
from .schemas import JobDetail, JobOut, SwipeCreate, SwipeCreated, SwipeHistoryItem
from .seed import seed_database


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    # create_all does not add newly declared indexes to an existing database.
    for table in (Job.__table__, Swipe.__table__):
        for index in table.indexes:
            index.create(bind=engine, checkfirst=True)
    with next(get_db()) as db:
        seed_database(db)
    yield


app = FastAPI(title="SwipeX Job & Swipe Service", version="1.0.0", lifespan=lifespan)


def serialize_job(job: Job, detail: bool = False) -> dict:
    result = {
        "job_id": job.id, "title": job.title, "company": job.company.name,
        "company_type": job.company.company_type, "location": job.location,
        "remote": job.is_remote, "salary_range": {"min": job.salary_min, "max": job.salary_max},
        "skills": job.skills.split("|"), "posted_at": job.posted_at,
        "experience_level": job.experience_level, "applicant_count": job.applicant_count,
    }
    if detail:
        result.update(description=job.description, industry=job.company.industry)
    return result


def user_id_from_gateway(x_user_id: Annotated[str | None, Header()] = None) -> int:
    if not x_user_id or not x_user_id.isdigit() or int(x_user_id) < 1:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="X-User-Id header is required")
    return int(x_user_id)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "job-swipe"}


@app.get("/api/v1/jobs", response_model=list[JobOut])
def list_jobs(
    type: str | None = Query(None, description="Employment type, e.g. Internship"),
    location: str | None = None,
    remote: bool | None = None,
    salary_min: int | None = Query(None, ge=0),
    salary_max: int | None = Query(None, ge=0),
    skills: str | None = Query(None, description="Comma-separated skills; any match"),
    company_type: str | None = None,
    db: Session = Depends(get_db),
) -> list[dict]:
    filters = {"type": type, "location": location, "remote": remote, "salary_min": salary_min, "salary_max": salary_max, "skills": skills, "company_type": company_type}
    key = "jobs:" + hashlib.sha256(json.dumps(filters, sort_keys=True, default=str).encode()).hexdigest()
    cached = cache.get(key)
    if cached is not None:
        return cached

    statement = select(Job).options(joinedload(Job.company)).order_by(Job.posted_at.desc())
    if type:
        statement = statement.where(Job.employment_type.ilike(type))
    if location:
        statement = statement.where(Job.location.ilike(f"%{location}%"))
    if remote is not None:
        statement = statement.where(Job.is_remote == remote)
    if salary_min is not None:
        statement = statement.where(Job.salary_max >= salary_min)
    if salary_max is not None:
        statement = statement.where(Job.salary_min <= salary_max)
    if company_type:
        from .models import Company
        statement = statement.join(Job.company).where(Company.company_type.ilike(company_type))
    if skills:
        requested = [item.strip().lower() for item in skills.split(",") if item.strip()]
        statement = statement.where(or_(*[Job.skills.ilike(f"%{skill}%") for skill in requested]))
    jobs = list(db.scalars(statement).unique())
    payload = [serialize_job(job) for job in jobs]
    cache.set(key, payload)
    return payload


@app.get("/api/v1/jobs/{job_id}", response_model=JobDetail)
def get_job(job_id: int, db: Session = Depends(get_db)) -> dict:
    job = db.scalar(select(Job).options(joinedload(Job.company)).where(Job.id == job_id))
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return serialize_job(job, detail=True)


@app.post("/api/v1/swipes", response_model=SwipeCreated, status_code=status.HTTP_201_CREATED)
def create_swipe(payload: SwipeCreate, user_id: int = Depends(user_id_from_gateway), db: Session = Depends(get_db)) -> dict:
    if not db.get(Job, payload.job_id):
        raise HTTPException(status_code=404, detail="Job not found")
    swipe = db.scalar(select(Swipe).where(Swipe.user_id == user_id, Swipe.job_id == payload.job_id))
    if swipe:
        swipe.direction = payload.direction
        db.commit()
        db.refresh(swipe)
        return {"swipe_id": swipe.id, "job_id": swipe.job_id, "direction": swipe.direction}
    swipe = Swipe(user_id=user_id, job_id=payload.job_id, direction=payload.direction)
    db.add(swipe)
    db.commit()
    db.refresh(swipe)
    return {"swipe_id": swipe.id, "job_id": swipe.job_id, "direction": swipe.direction}


@app.get("/api/v1/swipes/history", response_model=list[SwipeHistoryItem])
def swipe_history(user_id: int = Depends(user_id_from_gateway), db: Session = Depends(get_db)) -> list[dict]:
    swipes = db.scalars(select(Swipe).options(joinedload(Swipe.job).joinedload(Job.company)).where(Swipe.user_id == user_id).order_by(Swipe.swiped_at.desc())).all()
    return [{"job_id": swipe.job_id, "direction": swipe.direction, "swiped_at": swipe.swiped_at,
             "job_title": swipe.job.title, "company": swipe.job.company.name} for swipe in swipes]
