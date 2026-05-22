from datetime import datetime, timezone, date
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from pydantic import BaseModel
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.application import Application, ApplicationStatus
from app.models.job import Job
from app.services.ai_service import AIService
from app.core.logging_config import logger

router = APIRouter(prefix="/applications", tags=["applications"])


class ApplicationCreate(BaseModel):
    job_id: int
    status: ApplicationStatus = ApplicationStatus.INTERESTED
    applied_date: Optional[date] = None
    notes: Optional[str] = None
    cover_letter: Optional[str] = None
    next_action: Optional[str] = None
    next_action_date: Optional[date] = None
    referral_contact: Optional[str] = None


class ApplicationUpdate(BaseModel):
    status: Optional[ApplicationStatus] = None
    applied_date: Optional[date] = None
    notes: Optional[str] = None
    cover_letter: Optional[str] = None
    next_action: Optional[str] = None
    next_action_date: Optional[date] = None
    interview_rounds: Optional[int] = None
    offer_amount: Optional[str] = None
    rejection_reason: Optional[str] = None
    referral_contact: Optional[str] = None


class ApplicationResponse(BaseModel):
    id: int
    job_id: int
    status: ApplicationStatus
    applied_date: Optional[date] = None
    notes: Optional[str] = None
    cover_letter: Optional[str] = None
    next_action: Optional[str] = None
    next_action_date: Optional[date] = None
    interview_rounds: Optional[int] = None
    offer_amount: Optional[str] = None
    rejection_reason: Optional[str] = None
    referral_contact: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    # Job details
    job_title: Optional[str] = None
    job_company: Optional[str] = None
    job_location: Optional[str] = None
    job_source_url: Optional[str] = None
    job_match_score: Optional[float] = None

    class Config:
        from_attributes = True


class CoverLetterRequest(BaseModel):
    job_id: int
    custom_notes: Optional[str] = None


@router.get("", response_model=List[ApplicationResponse])
async def list_applications(
    status_filter: Optional[ApplicationStatus] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all applications for the current user."""
    offset = (page - 1) * limit
    query = (
        select(Application)
        .options(selectinload(Application.job))
        .where(Application.user_id == current_user.id)
    )
    if status_filter:
        query = query.where(Application.status == status_filter)

    query = query.order_by(Application.updated_at.desc()).offset(offset).limit(limit)
    result = await db.execute(query)
    apps = result.scalars().all()

    return [
        ApplicationResponse(
            id=app.id,
            job_id=app.job_id,
            status=app.status,
            applied_date=app.applied_date,
            notes=app.notes,
            cover_letter=app.cover_letter,
            next_action=app.next_action,
            next_action_date=app.next_action_date,
            interview_rounds=app.interview_rounds,
            offer_amount=app.offer_amount,
            rejection_reason=app.rejection_reason,
            referral_contact=app.referral_contact,
            created_at=app.created_at,
            updated_at=app.updated_at,
            job_title=app.job.title if app.job else None,
            job_company=app.job.company if app.job else None,
            job_location=app.job.location if app.job else None,
            job_source_url=app.job.source_url if app.job else None,
            job_match_score=app.job.match_score if app.job else None,
        )
        for app in apps
    ]


@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def create_application(
    data: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new application entry."""
    job_result = await db.execute(select(Job).where(Job.id == data.job_id))
    job = job_result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    existing = await db.execute(
        select(Application).where(
            Application.user_id == current_user.id,
            Application.job_id == data.job_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Application already exists for this job")

    app = Application(
        user_id=current_user.id,
        job_id=data.job_id,
        status=data.status,
        applied_date=data.applied_date,
        notes=data.notes,
        cover_letter=data.cover_letter,
        next_action=data.next_action,
        next_action_date=data.next_action_date,
        referral_contact=data.referral_contact,
    )
    db.add(app)

    # Increment application count on job
    job.application_count = (job.application_count or 0) + 1
    db.add(job)

    await db.flush()
    await db.refresh(app)

    return ApplicationResponse(
        id=app.id,
        job_id=app.job_id,
        status=app.status,
        applied_date=app.applied_date,
        notes=app.notes,
        cover_letter=app.cover_letter,
        next_action=app.next_action,
        next_action_date=app.next_action_date,
        interview_rounds=app.interview_rounds,
        offer_amount=app.offer_amount,
        rejection_reason=app.rejection_reason,
        referral_contact=app.referral_contact,
        created_at=app.created_at,
        updated_at=app.updated_at,
        job_title=job.title,
        job_company=job.company,
        job_location=job.location,
        job_source_url=job.source_url,
        job_match_score=job.match_score,
    )


@router.get("/{application_id}", response_model=ApplicationResponse)
async def get_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Application)
        .options(selectinload(Application.job))
        .where(Application.id == application_id, Application.user_id == current_user.id)
    )
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    return ApplicationResponse(
        id=app.id,
        job_id=app.job_id,
        status=app.status,
        applied_date=app.applied_date,
        notes=app.notes,
        cover_letter=app.cover_letter,
        next_action=app.next_action,
        next_action_date=app.next_action_date,
        interview_rounds=app.interview_rounds,
        offer_amount=app.offer_amount,
        rejection_reason=app.rejection_reason,
        referral_contact=app.referral_contact,
        created_at=app.created_at,
        updated_at=app.updated_at,
        job_title=app.job.title if app.job else None,
        job_company=app.job.company if app.job else None,
        job_location=app.job.location if app.job else None,
        job_source_url=app.job.source_url if app.job else None,
        job_match_score=app.job.match_score if app.job else None,
    )


@router.patch("/{application_id}", response_model=ApplicationResponse)
async def update_application(
    application_id: int,
    data: ApplicationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Application)
        .options(selectinload(Application.job))
        .where(Application.id == application_id, Application.user_id == current_user.id)
    )
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    update_data = data.model_dump(exclude_none=True)
    for field, value in update_data.items():
        setattr(app, field, value)

    db.add(app)
    await db.flush()

    return ApplicationResponse(
        id=app.id,
        job_id=app.job_id,
        status=app.status,
        applied_date=app.applied_date,
        notes=app.notes,
        cover_letter=app.cover_letter,
        next_action=app.next_action,
        next_action_date=app.next_action_date,
        interview_rounds=app.interview_rounds,
        offer_amount=app.offer_amount,
        rejection_reason=app.rejection_reason,
        referral_contact=app.referral_contact,
        created_at=app.created_at,
        updated_at=app.updated_at,
        job_title=app.job.title if app.job else None,
        job_company=app.job.company if app.job else None,
        job_location=app.job.location if app.job else None,
        job_source_url=app.job.source_url if app.job else None,
        job_match_score=app.job.match_score if app.job else None,
    )


@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Application).where(
            Application.id == application_id,
            Application.user_id == current_user.id,
        )
    )
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    await db.delete(app)


@router.post("/generate-cover-letter")
async def generate_cover_letter(
    request: CoverLetterRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate an AI-powered cover letter for a job."""
    job_result = await db.execute(select(Job).where(Job.id == request.job_id))
    job = job_result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    ai_service = AIService()
    cover_letter = await ai_service.generate_cover_letter_draft(
        job=job,
        custom_notes=request.custom_notes,
    )
    return {"cover_letter": cover_letter, "job_id": request.job_id}


@router.get("/pipeline/summary")
async def get_pipeline_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get application pipeline summary counts by status."""
    result = await db.execute(
        select(Application.status, func.count(Application.id).label("count"))
        .where(Application.user_id == current_user.id)
        .group_by(Application.status)
    )
    rows = result.all()

    summary = {s.value: 0 for s in ApplicationStatus}
    for row in rows:
        summary[row.status.value] = row.count

    return {"pipeline": summary, "total": sum(summary.values())}
