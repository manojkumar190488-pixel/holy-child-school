from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.recruiter import Recruiter
from app.services.ai_service import AIService
from app.core.logging_config import logger

router = APIRouter(prefix="/recruiters", tags=["recruiters"])


class RecruiterCreate(BaseModel):
    name: str
    linkedin_url: Optional[str] = None
    email: Optional[str] = None
    company: Optional[str] = None
    phone: Optional[str] = None
    title: Optional[str] = None
    notes: Optional[str] = None
    source_job_id: Optional[int] = None


class RecruiterUpdate(BaseModel):
    name: Optional[str] = None
    linkedin_url: Optional[str] = None
    email: Optional[str] = None
    company: Optional[str] = None
    phone: Optional[str] = None
    title: Optional[str] = None
    notes: Optional[str] = None
    rating: Optional[float] = None


class RecruiterResponse(BaseModel):
    id: int
    name: str
    linkedin_url: Optional[str] = None
    email: Optional[str] = None
    company: Optional[str] = None
    phone: Optional[str] = None
    title: Optional[str] = None
    interaction_count: int
    last_interaction: Optional[datetime] = None
    notes: Optional[str] = None
    rating: Optional[float] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class OutreachRequest(BaseModel):
    recruiter_id: int
    job_id: int
    tone: Optional[str] = "professional"  # professional, friendly, concise


@router.get("", response_model=List[RecruiterResponse])
async def list_recruiters(
    search: Optional[str] = Query(None),
    company: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all tracked recruiters."""
    offset = (page - 1) * limit
    query = select(Recruiter).where(Recruiter.is_active == True)

    if search:
        query = query.where(
            Recruiter.name.ilike(f"%{search}%") | Recruiter.email.ilike(f"%{search}%")
        )
    if company:
        query = query.where(Recruiter.company.ilike(f"%{company}%"))

    query = query.order_by(Recruiter.interaction_count.desc()).offset(offset).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=RecruiterResponse, status_code=status.HTTP_201_CREATED)
async def create_recruiter(
    data: RecruiterCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Check for duplicate LinkedIn URL
    if data.linkedin_url:
        existing = await db.execute(
            select(Recruiter).where(Recruiter.linkedin_url == data.linkedin_url)
        )
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=409, detail="Recruiter with this LinkedIn URL already exists")

    recruiter = Recruiter(
        name=data.name,
        linkedin_url=data.linkedin_url,
        email=data.email,
        company=data.company,
        phone=data.phone,
        title=data.title,
        notes=data.notes,
        source_job_id=data.source_job_id,
        first_interaction=datetime.now(timezone.utc),
    )
    db.add(recruiter)
    await db.flush()
    await db.refresh(recruiter)
    return recruiter


@router.get("/{recruiter_id}", response_model=RecruiterResponse)
async def get_recruiter(
    recruiter_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Recruiter).where(Recruiter.id == recruiter_id))
    recruiter = result.scalar_one_or_none()
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter not found")
    return recruiter


@router.patch("/{recruiter_id}", response_model=RecruiterResponse)
async def update_recruiter(
    recruiter_id: int,
    data: RecruiterUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Recruiter).where(Recruiter.id == recruiter_id))
    recruiter = result.scalar_one_or_none()
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter not found")

    update_data = data.model_dump(exclude_none=True)
    for field, value in update_data.items():
        setattr(recruiter, field, value)

    db.add(recruiter)
    return recruiter


@router.delete("/{recruiter_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_recruiter(
    recruiter_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Recruiter).where(Recruiter.id == recruiter_id))
    recruiter = result.scalar_one_or_none()
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter not found")
    recruiter.is_active = False
    db.add(recruiter)


@router.post("/{recruiter_id}/log-interaction")
async def log_interaction(
    recruiter_id: int,
    notes: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Log an interaction with a recruiter (call, email, LinkedIn message)."""
    result = await db.execute(select(Recruiter).where(Recruiter.id == recruiter_id))
    recruiter = result.scalar_one_or_none()
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter not found")

    recruiter.interaction_count = (recruiter.interaction_count or 0) + 1
    recruiter.last_interaction = datetime.now(timezone.utc)
    if notes:
        existing_notes = recruiter.notes or ""
        timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")
        recruiter.notes = f"{existing_notes}\n[{timestamp}] {notes}".strip()

    db.add(recruiter)
    return {"message": "Interaction logged", "interaction_count": recruiter.interaction_count}


@router.post("/generate-outreach")
async def generate_outreach_message(
    request: OutreachRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate an AI-powered recruiter outreach message."""
    from app.models.job import Job

    recruiter_result = await db.execute(select(Recruiter).where(Recruiter.id == request.recruiter_id))
    recruiter = recruiter_result.scalar_one_or_none()
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter not found")

    job_result = await db.execute(select(Job).where(Job.id == request.job_id))
    job = job_result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    ai_service = AIService()
    message = await ai_service.generate_recruiter_outreach(
        job=job,
        recruiter_name=recruiter.name,
        tone=request.tone,
    )
    return {"message": message, "recruiter_name": recruiter.name, "job_title": job.title}
