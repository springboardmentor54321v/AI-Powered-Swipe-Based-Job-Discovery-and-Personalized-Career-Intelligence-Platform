import hashlib
import json
from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import Depends, FastAPI, Header, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, joinedload

from .cache import cache
from .database import Base, engine, get_db
from .models import Company, Job, Swipe
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
    competition = "Low" if job.applicant_count < 50 else "Medium" if job.applicant_count < 100 else "High"
    result = {
        "job_id": job.id, "title": job.title, "company": job.company.name,
        "company_type": job.company.company_type, "location": job.location,
        "remote": job.is_remote, "salary_range": {"min": job.salary_min, "max": job.salary_max},
        "skills": job.skills.split("|"), "posted_at": job.posted_at, "posted_time": job.posted_at,
        "experience_level": job.experience_level, "applicant_count": job.applicant_count,
        "competition_level": competition,
    }
    if detail:
        result.update(description=job.description, industry=job.company.industry)
    return result


def apply_job_filters(
    statement,
    *,
    keyword: str | None = None,
    location: str | None = None,
    job_type: str | None = None,
    remote: bool | None = None,
    salary_min: int | None = None,
    salary_max: int | None = None,
    skills: str | None = None,
    company_type: str | None = None,
    experience_level: str | None = None,
    low_competition: bool = False,
    recently_posted: bool = False,
):
    if keyword:
        term = f"%{keyword}%"
        statement = statement.where(or_(Job.title.ilike(term), Job.description.ilike(term), Company.name.ilike(term), Job.skills.ilike(term)))
    if job_type:
        statement = statement.where(Job.employment_type.ilike(job_type))
    if location:
        statement = statement.where(Job.location.ilike(f"%{location}%"))
    if remote is not None:
        statement = statement.where(Job.is_remote == remote)
    if salary_min is not None:
        statement = statement.where(Job.salary_max >= salary_min)
    if salary_max is not None:
        statement = statement.where(Job.salary_min <= salary_max)
    if company_type:
        statement = statement.where(Company.company_type.ilike(company_type))
    if experience_level:
        statement = statement.where(Job.experience_level.ilike(experience_level))
    if skills:
        requested = [item.strip().lower() for item in skills.split(",") if item.strip()]
        if requested:
            statement = statement.where(or_(*[Job.skills.ilike(f"%{skill}%") for skill in requested]))
    if low_competition:
        statement = statement.where(Job.applicant_count < 50)
    if recently_posted:
        from datetime import datetime, timedelta, timezone
        statement = statement.where(Job.posted_at >= datetime.now(timezone.utc) - timedelta(days=7))
    return statement


def paginated_payload(items: list[dict], page: int, page_size: int) -> dict:
    total = len(items)
    start = (page - 1) * page_size
    return {"jobs": items[start:start + page_size], "page": page, "page_size": page_size, "total": total}


def user_id_from_gateway(x_user_id: Annotated[str | None, Header()] = None) -> int:
    if not x_user_id or not x_user_id.isdigit() or int(x_user_id) < 1:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="X-User-Id header is required")
    return int(x_user_id)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "job-swipe"}


@app.get("/api/v1/jobs")
def list_jobs(
    type: str | None = Query(None, description="Employment type, e.g. Internship"),
    location: str | None = None,
    remote: bool | None = None,
    salary_min: int | None = Query(None, ge=0),
    salary_max: int | None = Query(None, ge=0),
    skills: str | None = Query(None, description="Comma-separated skills; any match"),
    company_type: str | None = None,
    page: int | None = Query(None, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> list[dict] | dict:
    filters = {"type": type, "location": location, "remote": remote, "salary_min": salary_min, "salary_max": salary_max, "skills": skills, "company_type": company_type, "page": page, "page_size": page_size}
    # v2 prevents pre-M2 cached job objects (without freshness/competition
    # fields) from being returned after the API contract extension.
    key = "jobs:v2:" + hashlib.sha256(json.dumps(filters, sort_keys=True, default=str).encode()).hexdigest()
    cached = cache.get(key)
    if cached is not None:
        return cached

    statement = select(Job).join(Job.company).options(joinedload(Job.company)).order_by(Job.posted_at.desc())
    statement = apply_job_filters(statement, job_type=type, location=location, remote=remote, salary_min=salary_min, salary_max=salary_max, skills=skills, company_type=company_type)
    jobs = list(db.scalars(statement).unique())
    payload = [serialize_job(job) for job in jobs]
    response = paginated_payload(payload, page, page_size) if page else payload
    cache.set(key, response)
    return response


@app.get("/api/v1/jobs/search")
def search_jobs(
    keyword: str | None = None,
    search: str | None = None,
    q: str | None = None,
    location: str | None = None,
    job_type: str | None = None,
    type: str | None = None,
    remote: bool | None = None,
    is_remote: bool | None = None,
    salary_min: int | None = Query(None, ge=0),
    salary_max: int | None = Query(None, ge=0),
    experience_level: str | None = None,
    skills: str | None = None,
    company_type: str | None = None,
    low_competition: bool = False,
    recently_posted: bool = False,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> dict:
    term = keyword or search or q
    statement = select(Job).join(Job.company).options(joinedload(Job.company)).order_by(Job.posted_at.desc())
    statement = apply_job_filters(statement, keyword=term, location=location, job_type=job_type or type, remote=remote if remote is not None else is_remote, salary_min=salary_min, salary_max=salary_max, skills=skills, company_type=company_type, experience_level=experience_level, low_competition=low_competition, recently_posted=recently_posted)
    jobs = list(db.scalars(statement).unique())
    return paginated_payload([serialize_job(job) for job in jobs], page, page_size)


def serialize_company(company: Company, include_jobs: bool = False) -> dict:
    result = {
        "company_id": company.id, "id": company.id, "name": company.name,
        "company_type": company.company_type, "industry": company.industry,
        "headquarters": company.headquarters, "founded_year": company.founded_year,
        "website": company.website, "open_jobs_count": len(company.jobs),
    }
    if include_jobs:
        result["jobs"] = [serialize_job(job) for job in company.jobs]
    return result


@app.get("/api/v1/companies")
def list_companies(
    search: str | None = None,
    q: str | None = None,
    industry: str | None = None,
    company_type: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> dict:
    statement = select(Company).options(joinedload(Company.jobs)).order_by(Company.name)
    term = search or q
    if term:
        statement = statement.where(or_(Company.name.ilike(f"%{term}%"), Company.industry.ilike(f"%{term}%")))
    if industry:
        statement = statement.where(Company.industry.ilike(f"%{industry}%"))
    if company_type:
        statement = statement.where(Company.company_type.ilike(company_type))
    companies = list(db.scalars(statement).unique())
    total = len(companies)
    start = (page - 1) * page_size
    return {"companies": [serialize_company(company) for company in companies[start:start + page_size]], "page": page, "page_size": page_size, "total": total}


@app.get("/api/v1/companies/{company_id}")
def company_detail(company_id: int, db: Session = Depends(get_db)) -> dict:
    company = db.scalar(select(Company).options(joinedload(Company.jobs).joinedload(Job.company)).where(Company.id == company_id))
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return serialize_company(company, include_jobs=True)


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
