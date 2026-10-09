from datetime import datetime

from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, Index, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class Company(Base):
    __tablename__ = "companies"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    company_type: Mapped[str] = mapped_column(String(30), index=True)
    industry: Mapped[str] = mapped_column(String(100))
    headquarters: Mapped[str] = mapped_column(String(120))
    founded_year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    website: Mapped[str | None] = mapped_column(String(240), nullable=True)
    jobs: Mapped[list["Job"]] = relationship(back_populates="company")


class Job(Base):
    __tablename__ = "jobs"
    __table_args__ = (Index("ix_jobs_location_remote_posted", "location", "is_remote", "posted_at"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    source_job_id: Mapped[str | None] = mapped_column(String(64), index=True, nullable=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id"), index=True)
    title: Mapped[str] = mapped_column(String(160), index=True)
    description: Mapped[str] = mapped_column(Text)
    employment_type: Mapped[str] = mapped_column(String(30), index=True)
    location: Mapped[str] = mapped_column(String(120), index=True)
    is_remote: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    salary_min: Mapped[int | None] = mapped_column(Integer, nullable=True)
    salary_max: Mapped[int | None] = mapped_column(Integer, nullable=True)
    skills: Mapped[str] = mapped_column(Text)  # JSON-free, pipe-delimited normalized skills
    experience_level: Mapped[str] = mapped_column(String(40), default="Fresher")
    applicant_count: Mapped[int] = mapped_column(Integer, default=0)
    recruiter_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    competition_level: Mapped[str] = mapped_column(String(16), default="low")
    competition_updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    posted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
    company: Mapped[Company] = relationship(back_populates="jobs")
    swipes: Mapped[list["Swipe"]] = relationship(back_populates="job", cascade="all, delete-orphan")


class Swipe(Base):
    __tablename__ = "swipes"
    __table_args__ = (
        UniqueConstraint("user_id", "job_id", name="uq_user_job_swipe"),
        Index("ix_swipes_user_swiped_at", "user_id", "swiped_at"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, index=True)
    job_id: Mapped[int] = mapped_column(ForeignKey("jobs.id"), index=True)
    direction: Mapped[str] = mapped_column(String(8), index=True)
    swiped_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    job: Mapped[Job] = relationship(back_populates="swipes")
