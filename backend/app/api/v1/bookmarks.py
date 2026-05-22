from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from pydantic import BaseModel
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.bookmark import Bookmark
from app.models.job import Job
from app.core.logging_config import logger

router = APIRouter(prefix="/bookmarks", tags=["bookmarks"])


class BookmarkCreate(BaseModel):
    job_id: int
    notes: Optional[str] = None


class BookmarkUpdate(BaseModel):
    notes: Optional[str] = None


class BookmarkResponse(BaseModel):
    id: int
    job_id: int
    notes: Optional[str] = None
    created_at: datetime
    job_title: Optional[str] = None
    job_company: Optional[str] = None
    job_location: Optional[str] = None
    job_match_score: Optional[float] = None
    job_source_url: Optional[str] = None

    class Config:
        from_attributes = True


@router.get("", response_model=List[BookmarkResponse])
async def list_bookmarks(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all bookmarks for the current user."""
    offset = (page - 1) * limit
    result = await db.execute(
        select(Bookmark)
        .options(selectinload(Bookmark.job))
        .where(Bookmark.user_id == current_user.id)
        .order_by(Bookmark.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    bookmarks = result.scalars().all()

    response = []
    for bm in bookmarks:
        response.append(
            BookmarkResponse(
                id=bm.id,
                job_id=bm.job_id,
                notes=bm.notes,
                created_at=bm.created_at,
                job_title=bm.job.title if bm.job else None,
                job_company=bm.job.company if bm.job else None,
                job_location=bm.job.location if bm.job else None,
                job_match_score=bm.job.match_score if bm.job else None,
                job_source_url=bm.job.source_url if bm.job else None,
            )
        )
    return response


@router.post("", response_model=BookmarkResponse, status_code=status.HTTP_201_CREATED)
async def create_bookmark(
    data: BookmarkCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Bookmark a job."""
    # Verify job exists
    job_result = await db.execute(select(Job).where(Job.id == data.job_id))
    job = job_result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Check if already bookmarked
    existing = await db.execute(
        select(Bookmark).where(
            Bookmark.user_id == current_user.id,
            Bookmark.job_id == data.job_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Job already bookmarked")

    bookmark = Bookmark(
        user_id=current_user.id,
        job_id=data.job_id,
        notes=data.notes,
    )
    db.add(bookmark)
    await db.flush()
    await db.refresh(bookmark)

    return BookmarkResponse(
        id=bookmark.id,
        job_id=bookmark.job_id,
        notes=bookmark.notes,
        created_at=bookmark.created_at,
        job_title=job.title,
        job_company=job.company,
        job_location=job.location,
        job_match_score=job.match_score,
        job_source_url=job.source_url,
    )


@router.get("/{bookmark_id}", response_model=BookmarkResponse)
async def get_bookmark(
    bookmark_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Bookmark)
        .options(selectinload(Bookmark.job))
        .where(Bookmark.id == bookmark_id, Bookmark.user_id == current_user.id)
    )
    bm = result.scalar_one_or_none()
    if not bm:
        raise HTTPException(status_code=404, detail="Bookmark not found")

    return BookmarkResponse(
        id=bm.id,
        job_id=bm.job_id,
        notes=bm.notes,
        created_at=bm.created_at,
        job_title=bm.job.title if bm.job else None,
        job_company=bm.job.company if bm.job else None,
        job_location=bm.job.location if bm.job else None,
        job_match_score=bm.job.match_score if bm.job else None,
        job_source_url=bm.job.source_url if bm.job else None,
    )


@router.patch("/{bookmark_id}", response_model=BookmarkResponse)
async def update_bookmark(
    bookmark_id: int,
    data: BookmarkUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Bookmark)
        .options(selectinload(Bookmark.job))
        .where(Bookmark.id == bookmark_id, Bookmark.user_id == current_user.id)
    )
    bm = result.scalar_one_or_none()
    if not bm:
        raise HTTPException(status_code=404, detail="Bookmark not found")

    if data.notes is not None:
        bm.notes = data.notes

    db.add(bm)
    return BookmarkResponse(
        id=bm.id,
        job_id=bm.job_id,
        notes=bm.notes,
        created_at=bm.created_at,
        job_title=bm.job.title if bm.job else None,
        job_company=bm.job.company if bm.job else None,
        job_location=bm.job.location if bm.job else None,
        job_match_score=bm.job.match_score if bm.job else None,
        job_source_url=bm.job.source_url if bm.job else None,
    )


@router.delete("/{bookmark_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bookmark(
    bookmark_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Bookmark).where(
            Bookmark.id == bookmark_id,
            Bookmark.user_id == current_user.id,
        )
    )
    bm = result.scalar_one_or_none()
    if not bm:
        raise HTTPException(status_code=404, detail="Bookmark not found")

    await db.delete(bm)
