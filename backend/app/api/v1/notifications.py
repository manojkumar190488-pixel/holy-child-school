from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.job import Job
from app.services.notification_service import NotificationService
from app.services.job_service import JobService
from app.core.logging_config import logger

router = APIRouter(prefix="/notifications", tags=["notifications"])


class NotificationPreferences(BaseModel):
    email_digest: bool = True
    telegram: bool = False
    digest_time: str = "08:00"  # HH:MM format
    min_score_threshold: float = 60.0
    telegram_chat_id: Optional[str] = None
    include_cover_letter_tips: bool = True
    weekly_skills_report: bool = True


class DigestRequest(BaseModel):
    user_ids: Optional[List[int]] = None  # None = all active users
    force: bool = False


class NotificationHistoryItem(BaseModel):
    type: str
    subject: str
    sent_at: datetime
    jobs_count: int
    status: str


@router.post("/send-digest")
async def send_digest(
    request: DigestRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Manually trigger a job digest email. Admin or self-service."""
    notification_service = NotificationService(db)
    job_service = JobService(db)

    # Get top jobs for digest
    since = datetime.now(timezone.utc) - timedelta(hours=24)
    jobs, total = await job_service.get_jobs_with_filters(
        filters={"min_score": 65.0, "posted_after": since, "is_active": True},
        page=1,
        limit=15,
        sort_by="match_score",
        sort_order="desc",
        user_id=current_user.id,
    )

    if not jobs and not request.force:
        return {
            "message": "No new high-relevance jobs found. Use force=true to send anyway.",
            "jobs_found": 0,
        }

    background_tasks.add_task(
        notification_service.send_email_digest,
        user=current_user,
        jobs=jobs,
    )

    return {
        "message": "Digest queued for delivery",
        "jobs_count": len(jobs),
        "recipient": current_user.email,
    }


@router.post("/preferences")
async def update_notification_preferences(
    prefs: NotificationPreferences,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update notification preferences."""
    current_user.notification_preferences = prefs.model_dump()

    # Update telegram chat ID if provided
    if prefs.telegram_chat_id:
        current_user.telegram_chat_id = prefs.telegram_chat_id

    db.add(current_user)
    return {"message": "Preferences updated", "preferences": prefs.model_dump()}


@router.get("/preferences")
async def get_notification_preferences(
    current_user: User = Depends(get_current_user),
):
    """Get current notification preferences."""
    prefs = current_user.notification_preferences or {
        "email_digest": True,
        "telegram": False,
        "digest_time": "08:00",
        "min_score_threshold": 60.0,
    }
    return prefs


@router.get("/history")
async def get_notification_history(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get notification history for the current user (from preferences log)."""
    prefs = current_user.preferences or {}
    history = prefs.get("notification_history", [])

    # Paginate
    offset = (page - 1) * limit
    page_items = history[offset: offset + limit]

    return {
        "items": page_items,
        "total": len(history),
        "page": page,
        "limit": limit,
    }


@router.post("/test-telegram")
async def test_telegram_notification(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Send a test Telegram message to verify bot setup."""
    if not current_user.telegram_chat_id:
        raise HTTPException(
            status_code=400,
            detail="No Telegram chat ID configured. Update notification preferences first.",
        )

    notification_service = NotificationService(db)
    success = await notification_service.send_telegram_message(
        chat_id=current_user.telegram_chat_id,
        message=(
            "Job Intelligence Agent is connected! You will receive daily digests of "
            "top job opportunities here."
        ),
    )

    if success:
        return {"message": "Test notification sent successfully"}
    else:
        raise HTTPException(
            status_code=500,
            detail="Failed to send Telegram message. Check bot token and chat ID.",
        )
