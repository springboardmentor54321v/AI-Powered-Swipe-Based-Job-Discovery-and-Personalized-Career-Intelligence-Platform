from flask import Blueprint, request
from sqlalchemy import or_

from app.extensions import db
from app.models.company import Company
from app.models.job import Job


companies_bp = Blueprint(
    "companies",
    __name__
)


# =========================================================
# GET ALL COMPANIES
# =========================================================

@companies_bp.get("/")
def get_companies():

    query = Company.query

    # -----------------------------------------------------
    # SEARCH
    # -----------------------------------------------------

    search = request.args.get(
        "search",
        ""
    ).strip()

    if search:

        search_value = f"%{search}%"

        query = query.filter(
            or_(
                Company.name.ilike(search_value),
                Company.industry.ilike(search_value),
                Company.location.ilike(search_value),
            )
        )

    # -----------------------------------------------------
    # CATEGORY
    # -----------------------------------------------------

    category = request.args.get(
        "category",
        ""
    ).strip()

    if category and category != "All":

        query = query.filter(
            Company.category == category
        )

    # -----------------------------------------------------
    # ORDER
    # -----------------------------------------------------

    companies = (
        query
        .order_by(Company.name.asc())
        .all()
    )

    result = []

    for company in companies:

        open_jobs_count = (
            Job.query
            .filter(
                Job.company.ilike(
                    company.name
                )
            )
            .filter(
                Job.status == "Active"
            )
            .count()
        )

        result.append(
            company.to_dict(
                open_jobs_count
            )
        )

    return {
        "success": True,
        "count": len(result),
        "companies": result
    }, 200


# =========================================================
# GET COMPANY BY ID
# =========================================================

@companies_bp.get("/<int:company_id>")
def get_company(company_id):

    company = Company.query.get(
        company_id
    )

    if not company:

        return {
            "success": False,
            "message": "Company not found"
        }, 404

    open_jobs_count = (
        Job.query
        .filter(
            Job.company.ilike(
                company.name
            )
        )
        .filter(
            Job.status == "Active"
        )
        .count()
    )

    return {
        "success": True,
        "company": company.to_dict(
            open_jobs_count
        )
    }, 200