from flask import Blueprint
from sqlalchemy import func

from app.extensions import db
from app.models.company import Company
from app.models.job import Job

companies_bp = Blueprint("companies", __name__)


def _open_job_counts():
    """{lower(company name): number of active jobs} in ONE grouped query."""
    rows = (
        db.session.query(func.lower(Job.company), func.count(Job.id))
        .filter(func.lower(func.coalesce(Job.status, "Active")) == "active")
        .group_by(func.lower(Job.company))
        .all()
    )
    return {name: n for name, n in rows if name}


@companies_bp.get("/")
def get_companies():
    companies = Company.query.order_by(Company.id.asc()).all()
    counts = _open_job_counts()

    return {
        "success": True,
        "companies": [
            company.to_dict(open_jobs_count=counts.get((company.name or "").lower(), 0))
            for company in companies
        ]
    }, 200


@companies_bp.get("/<int:company_id>")
def get_company(company_id):
    company = Company.query.get(company_id)

    if not company:
        return {
            "success": False,
            "message": "Company not found"
        }, 404

    counts = _open_job_counts()

    return {
        "success": True,
        "company": company.to_dict(open_jobs_count=counts.get((company.name or "").lower(), 0))
    }, 200