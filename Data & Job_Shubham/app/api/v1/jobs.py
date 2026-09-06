import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc, asc, String, cast

from app.api.deps import get_db, get_cache
from app.core.cache import CacheManager
from app.models.company import Company, CompanyType
from app.models.job import (
    Job, JobType, WorkplaceType, ExperienceLevel, CompetitionLevel
)
from app.schemas.job import (
    JobSummaryOut, JobDetailOut, JobListResponse
)
from app.schemas.company import CompanyOut

router = APIRouter()


def format_salary_range(sal_min: Optional[int], sal_max: Optional[int], currency: str = "INR", period: str = "Per Annum") -> str:
    """Formats salary integer values into clean human-readable text."""
    if not sal_min and not sal_max:
        return "Not Disclosed"
    
    symbol = "₹" if currency == "INR" else "$"
    suffix = " PA" if period == "Per Annum" else " /mo"

    def format_num(val: int) -> str:
        if currency == "INR":
            if val >= 100000:
                lakhs = val / 100000
                return f"{lakhs:.1f} LPA".replace(".0 LPA", " LPA")
            return f"{val:,}"
        else:
            if val >= 1000:
                return f"{val//1000}k"
            return f"{val:,}"

    if sal_min and sal_max:
        if currency == "INR" and period == "Per Annum":
            return f"{symbol}{format_num(sal_min)} - {symbol}{format_num(sal_max)}"
        return f"{symbol}{format_num(sal_min)} - {symbol}{format_num(sal_max)}{suffix}"
    elif sal_min:
        return f"From {symbol}{format_num(sal_min)}{suffix}"
    else:
        return f"Up to {symbol}{format_num(sal_max)}{suffix}"


@router.get("", response_model=List[JobSummaryOut], summary="List Jobs (Frozen Contract API)")
@router.get("/list", response_model=JobListResponse, summary="List Jobs (With Pagination Metadata)")
def get_jobs(
    type: Optional[str] = Query(None, description="Filter by Company Type (MNC, Startup, Newly Founded) or Job Type (Full-time, Internship)"),
    location: Optional[str] = Query(None, description="Filter by city/location substring (e.g. Bengaluru, Pune, Remote)"),
    remote: Optional[bool] = Query(None, description="True for remote-only roles"),
    salary_min: Optional[int] = Query(None, description="Minimum salary threshold"),
    salary_max: Optional[int] = Query(None, description="Maximum salary threshold"),
    skills: Optional[str] = Query(None, description="Comma-separated skill names (e.g. Python,React,SQL)"),
    experience_level: Optional[str] = Query(None, description="Experience level: Fresher, Entry-level, Mid-level, Senior"),
    competition_level: Optional[str] = Query(None, description="Competition level: Low, Medium, High"),
    search: Optional[str] = Query(None, description="Keyword search across title, description, company"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    sort_by: Optional[str] = Query("posted_at_desc", description="Sort: posted_at_desc, salary_desc, competition_asc"),
    db: Session = Depends(get_db),
    cache: CacheManager = Depends(get_cache)
):
    """
    Returns filtered job listings matching SRS 7.2 Interface Contract:
    `GET /api/v1/jobs?type=&location=&remote=&salary_min=&salary_max=&skills=` -> 200 `[ { job_id, title, company, type, location, salary_range, skills[], posted_at } ]`
    """
    # Cache key for identical queries
    cache_key = f"jobs:t={type}:loc={location}:rem={remote}:smin={salary_min}:smax={salary_max}:sk={skills}:exp={experience_level}:comp={competition_level}:q={search}:p={page}:ps={page_size}:sort={sort_by}"
    cached_data = cache.get(cache_key)
    if cached_data:
        return cached_data

    # Query construction
    query = db.query(Job).join(Company).filter(Job.is_active == True)

    # 1. Type filter (Can match either company_type or job_type)
    if type:
        type_clean = type.strip()
        query = query.filter(
            or_(
                cast(Company.company_type, String).ilike(f"%{type_clean}%"),
                cast(Job.job_type, String).ilike(f"%{type_clean}%")
            )
        )

    # 2. Location filter
    if location:
        query = query.filter(
            or_(
                Job.location.ilike(f"%{location.strip()}%"),
                Company.headquarters.ilike(f"%{location.strip()}%")
            )
        )

    # 3. Remote filter
    if remote is not None:
        if remote is True:
            query = query.filter(Job.workplace_type == WorkplaceType.REMOTE)
        else:
            query = query.filter(Job.workplace_type != WorkplaceType.REMOTE)

    # 4. Salary filters
    if salary_min is not None:
        query = query.filter(Job.salary_max >= salary_min)
    if salary_max is not None:
        query = query.filter(Job.salary_min <= salary_max)

    # 5. Skills filter (Checks inside skills serialized text)
    if skills:
        skill_list = [s.strip().lower() for s in skills.split(",") if s.strip()]
        for skill in skill_list:
            query = query.filter(Job._skills.ilike(f"%{skill}%"))

    # 6. Experience level
    if experience_level:
        query = query.filter(cast(Job.experience_level, String).ilike(f"%{experience_level.strip()}%"))

    # 7. Competition level
    if competition_level:
        query = query.filter(cast(Job.competition_level, String).ilike(f"%{competition_level.strip()}%"))

    # 8. Free-text search query
    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Job.title.ilike(search_term),
                Job.description.ilike(search_term),
                Job.role_category.ilike(search_term),
                Company.name.ilike(search_term)
            )
        )

    # 9. Sorting
    if sort_by == "salary_desc":
        query = query.order_by(desc(Job.salary_max), desc(Job.posted_at))
    elif sort_by == "competition_asc":
        query = query.order_by(asc(Job.applicant_count), desc(Job.posted_at))
    else:  # default posted_at_desc
        query = query.order_by(desc(Job.posted_at))

    total = query.count()
    total_pages = (total + page_size - 1) // page_size if page_size > 0 else 1

    jobs_slice = query.offset((page - 1) * page_size).limit(page_size).all()

    formatted_jobs = [
        JobSummaryOut(
            job_id=j.id,
            title=j.title,
            company=j.company.name if j.company else "Unknown",
            company_id=j.company_id,
            company_type=j.company.company_type if j.company else CompanyType.STARTUP,
            company_logo_url=j.company.logo_url if j.company else None,
            type=j.job_type.value,
            workplace_type=j.workplace_type.value,
            location=j.location,
            salary_range=format_salary_range(j.salary_min, j.salary_max, j.salary_currency, j.salary_period),
            salary_min=j.salary_min,
            salary_max=j.salary_max,
            salary_currency=j.salary_currency,
            skills=j.skills,
            experience_level=j.experience_level.value,
            competition_level=j.competition_level.value,
            applicant_count=j.applicant_count,
            is_fresher_friendly=j.is_fresher_friendly,
            posted_at=j.posted_at
        )
        for j in jobs_slice
    ]

    # Save to cache
    serialized = [j.model_dump(mode="json") for j in formatted_jobs]
    cache.set(cache_key, serialized, ttl=300)

    return formatted_jobs


@router.get("/{job_id}", response_model=JobDetailOut, summary="Get Job Detail by ID")
def get_job_by_id(
    job_id: int,
    db: Session = Depends(get_db),
    cache: CacheManager = Depends(get_cache)
):
    """
    Returns full job details including company profile, description,
    requirements, and compensation metadata.
    """
    cache_key = f"job_detail:{job_id}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    job = db.query(Job).filter(Job.id == job_id, Job.is_active == True).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID {job_id} not found."
        )

    company_out = CompanyOut.model_validate(job.company) if job.company else None

    detail = JobDetailOut(
        id=job.id,
        job_id=job.id,
        title=job.title,
        company=company_out,
        role_category=job.role_category,
        description=job.description,
        responsibilities=job.responsibilities,
        requirements=job.requirements,
        skills=job.skills,
        job_type=job.job_type,
        workplace_type=job.workplace_type,
        location=job.location,
        salary_min=job.salary_min,
        salary_max=job.salary_max,
        salary_currency=job.salary_currency,
        salary_period=job.salary_period,
        salary_range=format_salary_range(job.salary_min, job.salary_max, job.salary_currency, job.salary_period),
        experience_level=job.experience_level,
        experience_years_min=job.experience_years_min,
        experience_years_max=job.experience_years_max,
        competition_level=job.competition_level,
        applicant_count=job.applicant_count,
        is_fresher_friendly=job.is_fresher_friendly,
        is_active=job.is_active,
        posted_at=job.posted_at,
        expires_at=job.expires_at,
        created_at=job.posted_at
    )

    cache.set(cache_key, detail.model_dump(mode="json"), ttl=600)
    return detail
