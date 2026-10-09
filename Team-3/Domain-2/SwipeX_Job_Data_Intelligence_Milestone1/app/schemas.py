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


class JobCreate(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    company_id: int = Field(default=1, gt=0)
    description: str = "Exciting career opportunity."
    employment_type: str = "Full-time"
    location: str = "Remote"
    is_remote: bool = False
    salary_min: int | None = Field(default=500000, ge=0)
    salary_max: int | None = Field(default=1000000, ge=0)
    skills: list[str] = Field(default_factory=list)
    experience_level: str = "Mid-Level"

    @field_validator("salary_max")
    @classmethod
    def salary_range_valid(cls, value, info):
        minimum = info.data.get("salary_min")
        if value is not None and minimum is not None and value < minimum:
            raise ValueError("salary_max must be greater than or equal to salary_min")
        return value


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
