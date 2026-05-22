from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import Integer, String, Text, DateTime, Float, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Recruiter(Base):
    __tablename__ = "recruiters"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    linkedin_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True, unique=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    company: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Interaction tracking
    interaction_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_interaction: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    first_interaction: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # User notes & rating
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    rating: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # 1-5

    # Source / discovery
    source_job_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("jobs.id", ondelete="SET NULL"), nullable=True
    )
    is_active: Mapped[bool] = mapped_column(
        __import__("sqlalchemy").Boolean, default=True, nullable=False
    )

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
    source_job: Mapped[Optional["Job"]] = relationship("Job", foreign_keys=[source_job_id])

    __table_args__ = (
        Index("ix_recruiters_company", "company"),
        Index("ix_recruiters_name", "name"),
    )

    def __repr__(self) -> str:
        return f"<Recruiter id={self.id} name={self.name} company={self.company}>"
