from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, and_
from pydantic import BaseModel
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.job import Job
from app.services.job_service import JobService
from app.services.ai_service import AIService
from app.core.logging_config import logger

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


class FeedbackRequest(BaseModel):
    job_id: int
    feedback: str  # "relevant", "not_relevant", "already_applied", "not_interested"
    reason: Optional[str] = None


class DigestJob(BaseModel):
    id: int
    title: str
    company: str
    location: Optional[str] = None
    match_score: Optional[float] = None
    ai_summary: Optional[str] = None
    why_relevant: Optional[str] = None
    source_url: Optional[str] = None
    posted_date: Optional[datetime] = None
    remote_type: Optional[str] = None


class DailyDigest(BaseModel):
    date: str
    total_new_jobs: int
    top_matches: List[DigestJob]
    skills_insight: Optional[str] = None
    market_summary: Optional[str] = None


@router.get("")
async def get_recommendations(
    limit: int = Query(20, ge=1, le=50),
    min_score: float = Query(60.0, ge=0, le=100),
    days_back: int = Query(7, ge=1, le=30),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get personalized AI-ranked job recommendations."""
    job_service = JobService(db)

    since_date = datetime.now(timezone.utc) - timedelta(days=days_back)

    jobs, total = await job_service.get_jobs_with_filters(
        filters={
            "min_score": min_score,
            "posted_after": since_date,
            "is_active": True,
        },
        page=1,
        limit=limit,
        sort_by="match_score",
        sort_order="desc",
        user_id=current_user.id,
    )

    results = []
    for job in jobs:
        results.append(
            {
                "id": job.id if hasattr(job, "id") else job.get("id"),
                "title": job.title if hasattr(job, "title") else job.get("title"),
                "company": job.company if hasattr(job, "company") else job.get("company"),
                "location": job.location if hasattr(job, "location") else job.get("location"),
                "remote_type": job.remote_type if hasattr(job, "remote_type") else job.get("remote_type"),
                "match_score": job.match_score if hasattr(job, "match_score") else job.get("match_score"),
                "ai_summary": job.ai_summary if hasattr(job, "ai_summary") else job.get("ai_summary"),
                "why_relevant": job.why_relevant if hasattr(job, "why_relevant") else job.get("why_relevant"),
                "missing_skills": job.missing_skills if hasattr(job, "missing_skills") else job.get("missing_skills"),
                "source_platform": job.source_platform if hasattr(job, "source_platform") else job.get("source_platform"),
                "source_url": job.source_url if hasattr(job, "source_url") else job.get("source_url"),
                "posted_date": job.posted_date if hasattr(job, "posted_date") else job.get("posted_date"),
                "score_breakdown": job.score_breakdown if hasattr(job, "score_breakdown") else job.get("score_breakdown"),
            }
        )

    return {
        "total": total,
        "recommendations": results,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "criteria": {
            "min_score": min_score,
            "days_back": days_back,
        },
    }


@router.get("/daily-digest", response_model=DailyDigest)
async def get_daily_digest(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get today's curated job digest."""
    ai_service = AIService()
    job_service = JobService(db)

    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    yesterday_start = today_start - timedelta(days=1)

    jobs, total = await job_service.get_jobs_with_filters(
        filters={
            "min_score": 65.0,
            "posted_after": yesterday_start,
            "is_active": True,
        },
        page=1,
        limit=10,
        sort_by="match_score",
        sort_order="desc",
        user_id=current_user.id,
    )

    top_matches = []
    for job in jobs:
        j_id = job.id if hasattr(job, "id") else job.get("id")
        j_title = job.title if hasattr(job, "title") else job.get("title")
        j_company = job.company if hasattr(job, "company") else job.get("company")
        j_location = job.location if hasattr(job, "location") else job.get("location")
        j_score = job.match_score if hasattr(job, "match_score") else job.get("match_score")
        j_summary = job.ai_summary if hasattr(job, "ai_summary") else job.get("ai_summary")
        j_why = job.why_relevant if hasattr(job, "why_relevant") else job.get("why_relevant")
        j_url = job.source_url if hasattr(job, "source_url") else job.get("source_url")
        j_date = job.posted_date if hasattr(job, "posted_date") else job.get("posted_date")
        j_remote = job.remote_type if hasattr(job, "remote_type") else job.get("remote_type")

        top_matches.append(
            DigestJob(
                id=j_id,
                title=j_title,
                company=j_company,
                location=j_location,
                match_score=j_score,
                ai_summary=j_summary,
                why_relevant=j_why,
                source_url=j_url,
                posted_date=j_date,
                remote_type=j_remote,
            )
        )

    skills_insight = (
        "Your profile is seeing strong demand for Digital Transformation and E-Governance roles. "
        "AI Governance skills are increasingly requested in multilateral postings."
    )
    market_summary = (
        f"Found {total} new high-relevance opportunities in the last 24 hours. "
        "Top sectors: Government IT, Public Health, Development Consulting."
    )

    return DailyDigest(
        date=today_start.strftime("%Y-%m-%d"),
        total_new_jobs=total,
        top_matches=top_matches,
        skills_insight=skills_insight,
        market_summary=market_summary,
    )


@router.post("/feedback")
async def submit_feedback(
    request: FeedbackRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Submit feedback to improve recommendations (thumbs up/down)."""
    # Verify job exists
    result = await db.execute(select(Job).where(Job.id == request.job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Store feedback in user preferences
    prefs = current_user.preferences or {}
    feedback_log = prefs.get("recommendation_feedback", [])
    feedback_log.append(
        {
            "job_id": request.job_id,
            "feedback": request.feedback,
            "reason": request.reason,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    )
    # Keep last 200 feedback entries
    prefs["recommendation_feedback"] = feedback_log[-200:]
    current_user.preferences = prefs
    db.add(current_user)

    # Adjust score based on feedback
    if request.feedback == "relevant" and job.match_score:
        job.match_score = min(100.0, (job.match_score or 0) + 5)
        db.add(job)
    elif request.feedback == "not_relevant" and job.match_score:
        job.match_score = max(0.0, (job.match_score or 0) - 10)
        db.add(job)

    logger.info(
        f"Feedback received: user={current_user.id}, job={request.job_id}, "
        f"feedback={request.feedback}"
    )
    return {"message": "Feedback recorded. Recommendations will improve over time."}
