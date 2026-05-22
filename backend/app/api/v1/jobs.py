from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field
from app.core.database import get_db
from app.api.deps import get_current_user, get_optional_user
from app.models.user import User
from app.services.job_service import JobService
from app.core.logging_config import logger

router = APIRouter(prefix="/jobs", tags=["jobs"])


class JobResponse(BaseModel):
    id: int
    title: str
    company: str
    description: Optional[str] = None
    requirements: Optional[str] = None
    location: Optional[str] = None
    remote_type: Optional[str] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_currency: Optional[str] = None
    source_platform: Optional[str] = None
    source_url: Optional[str] = None
    recruiter_name: Optional[str] = None
    recruiter_linkedin: Optional[str] = None
    posted_date: Optional[datetime] = None
    scraped_at: datetime
    is_active: bool
    job_type: Optional[str] = None
    seniority_level: Optional[str] = None
    industry: Optional[str] = None
    match_score: Optional[float] = None
    ai_summary: Optional[str] = None
    why_relevant: Optional[str] = None
    missing_skills: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    score_breakdown: Optional[dict] = None

    class Config:
        from_attributes = True


class PaginatedJobResponse(BaseModel):
    items: List[JobResponse]
    total: int
    page: int
    limit: int
    pages: int


@router.get("", response_model=PaginatedJobResponse)
async def list_jobs(
    # Filters
    source: Optional[str] = Query(None, description="Filter by source platform"),
    location: Optional[str] = Query(None, description="Filter by location"),
    remote_type: Optional[str] = Query(None, description="remote/hybrid/onsite"),
    seniority: Optional[str] = Query(None, description="senior/lead/director/etc"),
    job_type: Optional[str] = Query(None, description="full-time/contract/etc"),
    industry: Optional[str] = Query(None, description="Filter by industry"),
    posted_after: Optional[datetime] = Query(None, description="Jobs posted after this date"),
    min_score: Optional[float] = Query(None, ge=0, le=100, description="Minimum match score"),
    max_score: Optional[float] = Query(None, ge=0, le=100, description="Maximum match score"),
    search: Optional[str] = Query(None, description="Text search in title/company/description"),
    # Pagination
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort_by: str = Query("match_score", description="match_score/posted_date/scraped_at"),
    sort_order: str = Query("desc", description="asc/desc"),
    # Auth (optional)
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    job_service = JobService(db)
    user_id = current_user.id if current_user else None

    filters = {
        "source": source,
        "location": location,
        "remote_type": remote_type,
        "seniority": seniority,
        "job_type": job_type,
        "industry": industry,
        "posted_after": posted_after,
        "min_score": min_score,
        "max_score": max_score,
        "search": search,
    }

    jobs, total = await job_service.get_jobs_with_filters(
        filters=filters,
        page=page,
        limit=limit,
        sort_by=sort_by,
        sort_order=sort_order,
        user_id=user_id,
    )

    return PaginatedJobResponse(
        items=jobs,
        total=total,
        page=page,
        limit=limit,
        pages=(total + limit - 1) // limit,
    )


@router.get("/trending", response_model=List[JobResponse])
async def get_trending_jobs(
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """Get trending jobs (recently scraped, high score, active)."""
    job_service = JobService(db)
    jobs = await job_service.get_trending_jobs(limit=limit)
    return jobs


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: int,
    db: AsyncSession = Depends(get_db),
):
    job_service = JobService(db)
    job = await job_service.get_job_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Increment view count
    await job_service.increment_view_count(job_id)
    return job


@router.get("/{job_id}/similar", response_model=List[JobResponse])
async def get_similar_jobs(
    job_id: int,
    limit: int = Query(5, ge=1, le=20),
    db: AsyncSession = Depends(get_db),
):
    """Find semantically similar jobs using vector similarity."""
    job_service = JobService(db)
    job = await job_service.get_job_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    similar = await job_service.get_similar_jobs(job_id=job_id, limit=limit)
    return similar


@router.post("/{job_id}/hide", status_code=status.HTTP_200_OK)
async def hide_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Hide a job from this user's feed."""
    job_service = JobService(db)
    await job_service.mark_job_hidden(user_id=current_user.id, job_id=job_id)
    return {"message": "Job hidden successfully"}


@router.delete("/{job_id}/hide", status_code=status.HTTP_200_OK)
async def unhide_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Unhide a previously hidden job."""
    job_service = JobService(db)
    await job_service.unmark_job_hidden(user_id=current_user.id, job_id=job_id)
    return {"message": "Job unhidden successfully"}
