import enum
from datetime import datetime, timezone, date
from typing import Optional
from sqlalchemy import Integer, ForeignKey, Text, DateTime, Date, String, Enum, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class ApplicationStatus(str, enum.Enum):
    INTERESTED = "interested"
    APPLIED = "applied"
    INTERVIEWING = "interviewing"
    OFFERED = "offered"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"
    ON_HOLD = "on_hold"


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    job_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True
    )
    status: Mapped[ApplicationStatus] = mapped_column(
        Enum(ApplicationStatus), default=ApplicationStatus.INTERESTED, nullable=False, index=True
    )
    applied_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    cover_letter: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    next_action: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    next_action_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    interview_rounds: Mapped[Optional[int]] = mapped_column(Integer, default=0, nullable=True)
    offer_amount: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    rejection_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    referral_contact: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
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
    user: Mapped["User"] = relationship("User", back_populates="applications")
    job: Mapped["Job"] = relationship("Job", back_populates="applications")

    __table_args__ = (
        Index("ix_applications_user_job", "user_id", "job_id", unique=True),
        Index("ix_applications_status", "user_id", "status"),
    )

    def __repr__(self) -> str:
        return f"<Application id={self.id} user_id={self.user_id} job_id={self.job_id} status={self.status}>"
