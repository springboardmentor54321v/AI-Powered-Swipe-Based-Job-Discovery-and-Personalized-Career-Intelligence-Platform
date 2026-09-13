"""
app/schemas.py

Pydantic (v2) schemas used for request validation and response serialization
across the Auth, Job, Company, Swipe, and Recommendation services.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator

from app.models import UserRole, JobType, SwipeAction


# ==========================================================================
# Shared / generic
# ==========================================================================

class ErrorResponse(BaseModel):
    detail: str


# ==========================================================================
# Auth / User schemas
# ==========================================================================

class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    full_name: Optional[str] = Field(None, max_length=255)
    role: UserRole = UserRole.JOB_SEEKER
    skills: List[str] = Field(default_factory=list)

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    full_name: Optional[str] = None
    role: UserRole
    skills: List[str] = Field(default_factory=list)
    company_id: Optional[uuid.UUID] = None
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut


class AccessTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ==========================================================================
# Company schemas
# ==========================================================================

class CompanyCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    about: Optional[str] = None
    industry: Optional[str] = Field(None, max_length=150)
    location: Optional[str] = Field(None, max_length=255)
    website: Optional[str] = Field(None, max_length=255)
    logo_url: Optional[str] = Field(None, max_length=500)


class CompanyUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    about: Optional[str] = None
    industry: Optional[str] = Field(None, max_length=150)
    location: Optional[str] = Field(None, max_length=255)
    website: Optional[str] = Field(None, max_length=255)
    logo_url: Optional[str] = Field(None, max_length=500)


class CompanyOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    about: Optional[str] = None
    industry: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    logo_url: Optional[str] = None
    created_at: datetime
    job_count: int = 0


class CompanyDetailOut(CompanyOut):
    jobs: List["JobOut"] = Field(default_factory=list)


# ==========================================================================
# Job schemas
# ==========================================================================

class JobCreateRequest(BaseModel):
    company_id: uuid.UUID
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    location: str = Field(..., min_length=1, max_length=255)
    job_type: JobType = JobType.FULL_TIME
    salary_min: Optional[Decimal] = Field(None, ge=0)
    salary_max: Optional[Decimal] = Field(None, ge=0)
    skills_required: List[str] = Field(default_factory=list)

    @field_validator("salary_max")
    @classmethod
    def validate_salary_range(cls, v, info):
        salary_min = info.data.get("salary_min")
        if v is not None and salary_min is not None and v < salary_min:
            raise ValueError("salary_max must be greater than or equal to salary_min")
        return v


class JobUpdateRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    location: Optional[str] = Field(None, min_length=1, max_length=255)
    job_type: Optional[JobType] = None
    salary_min: Optional[Decimal] = Field(None, ge=0)
    salary_max: Optional[Decimal] = Field(None, ge=0)
    skills_required: Optional[List[str]] = None
    is_active: Optional[bool] = None


class JobOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    company_id: uuid.UUID
    company_name: Optional[str] = None
    title: str
    description: str
    location: str
    job_type: JobType
    salary_min: Optional[Decimal] = None
    salary_max: Optional[Decimal] = None
    skills_required: List[str] = Field(default_factory=list)
    applicant_count: int
    is_active: bool
    posted_at: datetime

    # Dynamic, computed-on-the-fly intelligence metrics (not stored columns)
    posted_time: str
    competition_level: str


class PaginatedJobsResponse(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    results: List[JobOut]


# ==========================================================================
# Swipe schemas
# ==========================================================================

class SwipeCreateRequest(BaseModel):
    job_id: uuid.UUID
    action: SwipeAction


class SwipeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    job_id: uuid.UUID
    action: SwipeAction
    created_at: datetime
    updated_at: datetime


class SwipeListResponse(BaseModel):
    total: int
    results: List[SwipeOut]


# ==========================================================================
# Recommendation schemas
# ==========================================================================

class RecommendationItem(BaseModel):
    job: JobOut
    match_score: float = Field(..., ge=0, le=100)
    match_reasons: List[str] = Field(default_factory=list)


class RecommendationResponse(BaseModel):
    user_id: uuid.UUID
    generated_at: datetime
    engine: str
    count: int
    recommendations: List[RecommendationItem]


CompanyDetailOut.model_rebuild()
