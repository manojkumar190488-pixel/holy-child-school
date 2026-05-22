from datetime import datetime, timezone
from typing import Optional, Dict, Any
from sqlalchemy import Integer, String, Text, DateTime, ForeignKey, Index
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class SearchHistory(Base):
    __tablename__ = "search_histories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    query: Mapped[str] = mapped_column(Text, nullable=False)
    search_type: Mapped[str] = mapped_column(String(50), default="semantic", nullable=False)
    filters: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    result_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    is_saved: Mapped[bool] = mapped_column(
        __import__("sqlalchemy").Boolean, default=False, nullable=False
    )
    saved_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="search_histories")

    __table_args__ = (
        Index("ix_search_histories_user_created", "user_id", "created_at"),
        Index("ix_search_histories_saved", "user_id", "is_saved"),
    )

    def __repr__(self) -> str:
        return f"<SearchHistory id={self.id} user_id={self.user_id} query={self.query[:50]}>"
