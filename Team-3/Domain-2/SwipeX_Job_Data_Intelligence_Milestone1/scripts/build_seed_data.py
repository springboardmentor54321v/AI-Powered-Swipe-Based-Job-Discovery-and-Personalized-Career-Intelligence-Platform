"""Build clean, deterministic SwipeX company and job seed CSV files from the supplied workbook."""

from __future__ import annotations

import argparse
import html
import json
import re
from datetime import datetime, timedelta
from pathlib import Path

import pandas as pd

TYPE_MAP = {"MNC": "MNC", "Startup": "STARTUP", "Newly Founded": "NEWLY_FOUNDED"}
RELATIVE_DAYS = re.compile(r"^(\d+) Days? Ago$", re.IGNORECASE)
ONE_DAY = re.compile(r"^1 Day Ago$", re.IGNORECASE)


def clean_text(value: object) -> str | None:
    if pd.isna(value):
        return None
    value = html.unescape(str(value))
    value = re.sub(r"<[^>]+>", " ", value)
    value = re.sub(r"\s+", " ", value).strip()
    return value or None


def skills(value: object) -> str:
    if pd.isna(value):
        return ""
    seen: set[str] = set()
    result: list[str] = []
    for item in str(value).split(","):
        normal = re.sub(r"\s+", " ", item).strip().lower()
        if normal and normal not in seen:
            seen.add(normal)
            result.append(normal)
    return "|".join(result)


def infer_posted_at(raw: object, reference: datetime | None) -> str | None:
    """Convert only unambiguous relative posting labels; preserve all raw labels separately."""
    if reference is None or pd.isna(raw):
        return None
    text = str(raw).strip()
    if text.lower() in {"just now", "today", "few hours ago"}:
        return reference.isoformat()
    if ONE_DAY.match(text):
        return (reference - timedelta(days=1)).isoformat()
    match = RELATIVE_DAYS.match(text)
    if match:
        return (reference - timedelta(days=int(match.group(1)))).isoformat()
    return None


def completeness(row: pd.Series) -> int:
    fields = ["title", "companyName", "tagsAndSkills", "jobDescription", "location", "minimumSalary", "maximumSalary", "minimumExperience", "maximumExperience"]
    return sum(pd.notna(row.get(field)) and str(row.get(field)).strip() != "" for field in fields)


def deduplicate(raw: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    staged = raw.copy()
    staged["_source_row"] = range(2, len(staged) + 2)
    staged["_completeness"] = staged.apply(completeness, axis=1)
    staged["_description_length"] = staged["jobDescription"].fillna("").astype(str).str.len()
    staged = staged.sort_values(
        ["jobId", "_completeness", "_description_length", "_source_row"],
        ascending=[True, False, False, False],
        kind="stable",
    )
    keep = staged.drop_duplicates("jobId", keep="first").copy()
    rejects = staged[staged.duplicated("jobId", keep="first")].copy()
    rejects["rejection_reason"] = "duplicate source jobId; lower data completeness or description length"
    return keep.sort_values("_source_row"), rejects.sort_values("_source_row")


def build(source: Path, output: Path, reference: datetime | None, demo_per_type: int) -> dict[str, int]:
    raw = pd.read_excel(source, sheet_name="Sheet1")
    jobs, rejects = deduplicate(raw)

    jobs["company_type"] = jobs["company_type"].map(TYPE_MAP)
    if jobs["company_type"].isna().any():
        raise ValueError("Unmapped company_type values found")
    jobs["title"] = jobs["title"].map(clean_text)
    jobs["description"] = jobs["jobDescription"].map(clean_text)
    jobs["location"] = jobs["location"].map(clean_text)
    jobs["skills"] = jobs["tagsAndSkills"].map(skills)
    jobs["raw_job_uploaded"] = jobs["jobUploaded"].map(clean_text)
    jobs["posted_at"] = jobs["jobUploaded"].map(lambda value: infer_posted_at(value, reference))
    jobs["is_remote"] = jobs["location"].fillna("").str.contains(r"\bremote\b", case=False, regex=True)
    jobs["salary_display"] = jobs["salary"].map(clean_text)
    salary_unknown = (jobs["minimumSalary"].fillna(0) == 0) & (jobs["maximumSalary"].fillna(0) == 0)
    jobs.loc[salary_unknown, ["minimumSalary", "maximumSalary"]] = None

    companies = jobs[["companyId", "companyName", "company_type", "ReviewsCount", "AggregateRating"]].copy()
    companies["companyName"] = companies["companyName"].map(clean_text)
    companies = companies[companies["companyName"].notna()].copy()
    companies["_name_frequency"] = companies.groupby(["companyId", "companyName"])["companyName"].transform("size")
    companies = companies.sort_values(["companyId", "_name_frequency", "companyName"], ascending=[True, False, True])
    companies = companies.drop_duplicates("companyId", keep="first")
    companies["is_newly_founded"] = companies["company_type"].eq("NEWLY_FOUNDED")
    companies["about"] = None
    companies["company_size"] = None
    companies["industry"] = None

    clean_jobs = pd.DataFrame({
        "source_job_id": jobs["jobId"].astype(str),
        "source_company_id": jobs["companyId"].astype(str),
        "company_type": jobs["company_type"],
        "title": jobs["title"],
        "description": jobs["description"],
        "location": jobs["location"],
        "is_remote": jobs["is_remote"],
        "job_type": None,
        "skills_pipe_delimited": jobs["skills"],
        "minimum_salary": jobs["minimumSalary"],
        "maximum_salary": jobs["maximumSalary"],
        "salary_currency": jobs["currency"],
        "salary_display": jobs["salary_display"],
        "minimum_experience": jobs["minimumExperience"],
        "maximum_experience": jobs["maximumExperience"],
        "posted_at": jobs["posted_at"],
        "raw_job_uploaded": jobs["raw_job_uploaded"],
        "applicant_count": 0,
        "is_active": True,
    })
    clean_companies = pd.DataFrame({
        "source_company_id": companies["companyId"].astype(str),
        "name": companies["companyName"],
        "company_type": companies["company_type"],
        "about": companies["about"],
        "company_size": companies["company_size"],
        "industry": companies["industry"],
        "is_newly_founded": companies["is_newly_founded"],
        "review_count": companies["ReviewsCount"],
        "aggregate_rating": companies["AggregateRating"],
    })

    output.mkdir(parents=True, exist_ok=True)
    clean_jobs.to_csv(output / "jobs.csv", index=False)
    clean_companies.to_csv(output / "companies.csv", index=False)
    rejects[["jobId", "_source_row", "rejection_reason"]].to_csv(output / "import_rejects.csv", index=False)

    demo_jobs = (
        clean_jobs.sort_values("source_job_id")
        .groupby("company_type", group_keys=False)
        .head(demo_per_type)
        .sort_values(["company_type", "source_job_id"])
    )
    demo_companies = clean_companies[clean_companies["source_company_id"].isin(demo_jobs["source_company_id"])].copy()
    demo_jobs.to_csv(output / "demo_jobs.csv", index=False)
    demo_companies.to_csv(output / "demo_companies.csv", index=False)

    report = {
        "source_rows": len(raw),
        "clean_job_rows": len(clean_jobs),
        "clean_company_rows": len(clean_companies),
        "duplicate_jobs_rejected": len(rejects),
        "unknown_salary_rows": int(salary_unknown.sum()),
        "inferred_posted_at_rows": int(clean_jobs["posted_at"].notna().sum()),
        "demo_jobs": len(demo_jobs),
        "demo_company_counts": demo_jobs["company_type"].value_counts().sort_index().to_dict(),
        "seed_reference_at": reference.isoformat() if reference else None,
    }
    (output / "seed_quality_report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    return report


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--seed-reference-at", help="ISO-8601 timestamp for relative posting labels")
    parser.add_argument("--demo-per-type", type=int, default=34)
    args = parser.parse_args()
    reference = datetime.fromisoformat(args.seed_reference_at) if args.seed_reference_at else None
    print(json.dumps(build(args.source, args.output, reference, args.demo_per_type), indent=2))


if __name__ == "__main__":
    main()
