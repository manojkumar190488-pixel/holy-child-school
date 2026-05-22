from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from sqlalchemy import (
    String, Text, DateTime, Integer, Float, Boolean, ForeignKey, Index
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pgvector.sqlalchemy import Vector
from app.core.database import Base
from app.core.config import settings


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    # Core fields
    title: Mapped[str] = mapped_column(String(500), nullable=False, index=True)
    company: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    requirements: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Location & Work mode
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    remote_type: Mapped[Optional[str]] = mapped_column(
        String(50), nullable=True, index=True
    )  # remote, hybrid, onsite

    # Compensation
    salary_min: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    salary_max: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    salary_currency: Mapped[Optional[str]] = mapped_column(String(10), nullable=True, default="INR")
    salary_period: Mapped[Optional[str]] = mapped_column(String(20), nullable=True, default="annual")

    # Source
    source_platform: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    source_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True, unique=True)
    external_job_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Recruiter info
    recruiter_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    recruiter_linkedin: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    recruiter_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Dates
    posted_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    scraped_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)
    is_filled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Classification
    job_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)  # full-time, contract, etc.
    seniority_level: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    industry: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    department: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # AI fields
    embedding: Mapped[Optional[List[float]]] = mapped_column(
        Vector(settings.OPENAI_EMBEDDING_DIMENSIONS), nullable=True
    )
    match_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True, index=True)
    ai_summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    why_relevant: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    missing_skills: Mapped[Optional[List[str]]] = mapped_column(JSONB, nullable=True)
    score_breakdown: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    tags: Mapped[Optional[List[str]]] = mapped_column(JSONB, nullable=True, default=list)
    raw_data: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)

    # Deduplication hash
    content_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)

    # Metadata
    view_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    application_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    bookmarks: Mapped[list["Bookmark"]] = relationship("Bookmark", back_populates="job")
    applications: Mapped[list["Application"]] = relationship("Application", back_populates="job")
    hidden_by: Mapped[list["HiddenJob"]] = relationship("HiddenJob", back_populates="job")

    __table_args__ = (
        Index("ix_jobs_match_score_active", "match_score", "is_active"),
        Index("ix_jobs_posted_date", "posted_date"),
        Index("ix_jobs_source_platform", "source_platform"),
        Index("ix_jobs_company_title", "company", "title"),
    )

    def __repr__(self) -> str:
        return f"<Job id={self.id} title={self.title} company={self.company}>"


class HiddenJob(Base):
    """Tracks jobs hidden by users (user-level, not global)."""
    __tablename__ = "hidden_jobs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    job_id: Mapped[int] = mapped_column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user: Mapped["User"] = relationship("User", back_populates="hidden_jobs")
    job: Mapped["Job"] = relationship("Job", back_populates="hidden_by")

    __table_args__ = (
        Index("ix_hidden_jobs_user_job", "user_id", "job_id", unique=True),
    )
