from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from pydantic import BaseModel
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.search_history import SearchHistory
from app.models.job import Job
from app.services.job_service import JobService
from app.services.ai_service import AIService
from app.core.logging_config import logger

router = APIRouter(prefix="/search", tags=["search"])


class SemanticSearchRequest(BaseModel):
    query: str
    filters: Optional[Dict[str, Any]] = None
    limit: int = 20
    page: int = 1
    use_ai: bool = True


class SearchResponse(BaseModel):
    items: List[Dict[str, Any]]
    total: int
    query: str
    search_id: Optional[int] = None


class SaveSearchRequest(BaseModel):
    name: str
    query: str
    filters: Optional[Dict[str, Any]] = None


@router.post("", response_model=SearchResponse)
async def semantic_search(
    request: SemanticSearchRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Perform semantic search using AI embeddings."""
    job_service = JobService(db)
    ai_service = AIService()

    query_embedding = None
    if request.use_ai:
        try:
            query_embedding = await ai_service.generate_embedding(request.query)
        except Exception as e:
            logger.warning(f"Embedding generation failed, falling back to text search: {e}")

    if query_embedding is not None:
        jobs, total = await job_service.vector_search(
            query_embedding=query_embedding,
            filters=request.filters or {},
            page=request.page,
            limit=request.limit,
            user_id=current_user.id,
        )
    else:
        jobs, total = await job_service.get_jobs_with_filters(
            filters={"search": request.query, **(request.filters or {})},
            page=request.page,
            limit=request.limit,
            sort_by="match_score",
            sort_order="desc",
            user_id=current_user.id,
        )

    # Save to search history
    history = SearchHistory(
        user_id=current_user.id,
        query=request.query,
        search_type="semantic" if query_embedding else "text",
        filters=request.filters,
        result_count=total,
        is_saved=False,
    )
    db.add(history)
    await db.flush()
    search_id = history.id

    result_items = []
    for job in jobs:
        item = {
            "id": job.id if hasattr(job, "id") else job.get("id"),
            "title": job.title if hasattr(job, "title") else job.get("title"),
            "company": job.company if hasattr(job, "company") else job.get("company"),
            "location": job.location if hasattr(job, "location") else job.get("location"),
            "match_score": job.match_score if hasattr(job, "match_score") else job.get("match_score"),
            "ai_summary": job.ai_summary if hasattr(job, "ai_summary") else job.get("ai_summary"),
            "source_platform": job.source_platform if hasattr(job, "source_platform") else job.get("source_platform"),
            "posted_date": str(job.posted_date) if hasattr(job, "posted_date") else str(job.get("posted_date", "")),
            "remote_type": job.remote_type if hasattr(job, "remote_type") else job.get("remote_type"),
        }
        result_items.append(item)

    return SearchResponse(
        items=result_items,
        total=total,
        query=request.query,
        search_id=search_id,
    )


@router.get("/suggestions")
async def get_search_suggestions(
    q: str = Query(..., min_length=2),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get search suggestions based on history and common queries."""
    # Recent searches from user history
    result = await db.execute(
        select(SearchHistory)
        .where(
            SearchHistory.user_id == current_user.id,
            SearchHistory.query.ilike(f"%{q}%"),
        )
        .order_by(SearchHistory.created_at.desc())
        .limit(5)
    )
    histories = result.scalars().all()

    # Static suggestions relevant to the candidate profile
    profile_suggestions = [
        "Digital Transformation Director",
        "PMO Lead Government",
        "E-Governance Consultant",
        "Program Manager World Bank",
        "Public Health IT Consultant",
        "Health Systems Strengthening",
        "AI Governance Lead",
        "Senior Consulting UNDP",
        "Smart Cities Program Manager",
        "Government Digital Transformation",
        "DHIS2 Health Information",
        "Social Sector Technology Lead",
        "Development Sector Consulting",
        "IT Project Director India",
    ]

    matching = [s for s in profile_suggestions if q.lower() in s.lower()][:5]
    history_queries = [h.query for h in histories]

    combined = list(dict.fromkeys(history_queries + matching))[:10]
    return {"suggestions": combined}


@router.post("/save")
async def save_search(
    request: SaveSearchRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Save a search for later use."""
    search = SearchHistory(
        user_id=current_user.id,
        query=request.query,
        filters=request.filters,
        is_saved=True,
        saved_name=request.name,
    )
    db.add(search)
    await db.flush()
    return {"id": search.id, "name": request.name, "message": "Search saved successfully"}


@router.get("/saved")
async def get_saved_searches(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all saved searches for the current user."""
    result = await db.execute(
        select(SearchHistory)
        .where(
            SearchHistory.user_id == current_user.id,
            SearchHistory.is_saved == True,
        )
        .order_by(SearchHistory.created_at.desc())
    )
    searches = result.scalars().all()
    return [
        {
            "id": s.id,
            "name": s.saved_name,
            "query": s.query,
            "filters": s.filters,
            "created_at": s.created_at,
        }
        for s in searches
    ]


@router.delete("/saved/{search_id}")
async def delete_saved_search(
    search_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a saved search."""
    result = await db.execute(
        select(SearchHistory).where(
            SearchHistory.id == search_id,
            SearchHistory.user_id == current_user.id,
            SearchHistory.is_saved == True,
        )
    )
    search = result.scalar_one_or_none()
    if not search:
        raise HTTPException(status_code=404, detail="Saved search not found")

    await db.delete(search)
    return {"message": "Saved search deleted"}
