from datetime import UTC, datetime, timedelta

from sqlalchemy.orm import Session

from .models import Company, Job

COMPANIES = [
    ("Tata Consultancy Services", "MNC", "IT Services", "Mumbai", 1968),
    ("Razorpay", "Startup", "FinTech", "Bengaluru", 2014),
    ("Zepto", "New Startup", "Quick Commerce", "Mumbai", 2021),
    ("Microsoft", "MNC", "Technology", "Hyderabad", 1975),
    ("Postman", "Startup", "Developer Tools", "Bengaluru", 2014),
    ("Sarvam AI", "New Startup", "Artificial Intelligence", "Bengaluru", 2023),
]

JOBS = [
    ("Junior Python Developer", "Build reliable APIs and automation workflows for enterprise clients.", "Full-time", "Hyderabad", False, 450000, 700000, "python|fastapi|sql|git|rest api", "Fresher", 48, 1, 1),
    ("Data Analyst Intern", "Analyze product data and create actionable dashboards.", "Internship", "Remote", True, 180000, 240000, "python|sql|excel|power bi|pandas", "Fresher", 21, 2, 2),
    ("Backend Engineer", "Design payment platform services with secure APIs.", "Full-time", "Bengaluru", True, 900000, 1500000, "python|django|postgresql|redis|docker", "1-3 years", 65, 3, 1),
    ("Machine Learning Intern", "Prototype ranking models for delivery operations.", "Internship", "Mumbai", False, 240000, 360000, "python|scikit-learn|pandas|sql|machine learning", "Fresher", 34, 3, 3),
    ("Software Engineer", "Create cloud-native services used by customers worldwide.", "Full-time", "Hyderabad", True, 1200000, 2000000, "c#|azure|react|sql|docker", "1-3 years", 102, 4, 2),
    ("Frontend Developer", "Build beautiful developer experiences for API teams.", "Full-time", "Bengaluru", True, 800000, 1300000, "javascript|typescript|react|css|rest api", "Fresher", 29, 5, 1),
    ("AI Research Intern", "Evaluate Indian-language language models and data pipelines.", "Internship", "Bengaluru", True, 300000, 480000, "python|nlp|pytorch|transformers|pandas", "Fresher", 18, 6, 1),
    ("DevOps Engineer", "Maintain CI/CD systems and container infrastructure.", "Full-time", "Pune", True, 850000, 1400000, "docker|kubernetes|aws|linux|github actions", "1-3 years", 40, 1, 2),
]


def seed_database(db: Session) -> None:
    if db.query(Job).first():
        return
    companies = {}
    for name, company_type, industry, hq, founded in COMPANIES:
        company = Company(name=name, company_type=company_type, industry=industry, headquarters=hq, founded_year=founded)
        db.add(company)
        db.flush()
        companies[len(companies) + 1] = company
    now = datetime.now(UTC)
    for index, (title, description, employment_type, location, remote, min_salary, max_salary, skills, level, applicants, company_id, age) in enumerate(JOBS):
        db.add(Job(company_id=companies[company_id].id, title=title, description=description, employment_type=employment_type,
                   location=location, is_remote=remote, salary_min=min_salary, salary_max=max_salary, skills=skills,
                   experience_level=level, applicant_count=applicants, posted_at=now - timedelta(days=age, hours=index)))
    db.commit()
