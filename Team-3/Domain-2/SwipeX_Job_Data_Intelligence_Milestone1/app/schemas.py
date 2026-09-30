from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class JobOut(BaseModel):
    job_id: int
    title: str
    company: str
    company_type: str
    location: str
    remote: bool
    salary_range: dict[str, int | None]
    skills: list[str]
    posted_at: datetime
    experience_level: str
    applicant_count: int
    posted_time: datetime
    competition_level: str


class JobDetail(JobOut):
    description: str
    industry: str


class SwipeCreate(BaseModel):
    job_id: int = Field(gt=0)
    direction: str

    @field_validator("direction")
    @classmethod
    def valid_direction(cls, value: str) -> str:
        value = value.lower()
        if value not in {"left", "right"}:
            raise ValueError("direction must be 'left' or 'right'")
        return value


class SwipeCreated(BaseModel):
    swipe_id: int
    job_id: int
    direction: str


class SwipeHistoryItem(BaseModel):
    job_id: int
    direction: str
    swiped_at: datetime
    job_title: str
    company: str
