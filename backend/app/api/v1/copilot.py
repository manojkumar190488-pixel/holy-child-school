"""
AI Career Copilot — natural-language query endpoint.

Accepts free-form questions like:
  "Find VP-level government consulting jobs in Delhi NCR."
  "Find remote advisory opportunities globally."
  "Find World Bank consulting assignments."
  "Find PMU opportunities."
  "Find leadership roles matching my profile."
  "Find consulting assignments worth more than ₹5 lakh."
  "Find Middle East digital transformation opportunities."

Parses the query into structured filters (opportunity type, location,
seniority, employer/keyword, minimum value) and delegates to
JobService.get_jobs_with_filters — the same qualification/scoring pipeline
used by the rest of the platform.
"""
import re
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.job_service import JobService
from app.core.logging_config import logger

router = APIRouter(prefix="/copilot", tags=["copilot"])


class CopilotQueryRequest(BaseModel):
    query: str
    limit: int = 20


class CopilotQueryResponse(BaseModel):
    query: str
    interpreted_filters: Dict[str, Any]
    total: int
    results: List[Dict[str, Any]]


_REMOTE_HINTS = ["remote", "globally", "anywhere", "work from home"]
_FREELANCE_HINTS = ["freelance", "consulting assignment", "assignment", "project-based", "fractional"]
_LEADERSHIP_HINTS = ["vp", "vice president", "director", "partner", "practice head", "leadership", "associate partner"]
_MULTILATERAL_HINTS = ["world bank", "adb", "jica", "aiib", "undp", "unicef", "who", "multilateral"]
_GEO_HINTS = {
    "delhi ncr": ["delhi", "gurgaon", "gurugram", "noida", "ghaziabad", "faridabad"],
    "delhi": ["delhi"],
    "ncr": ["delhi", "gurgaon", "gurugram", "noida"],
    "middle east": ["uae", "dubai", "saudi", "qatar", "middle east"],
    "us": ["united states", "usa"],
    "uk": ["united kingdom", "uk"],
    "singapore": ["singapore"],
    "australia": ["australia"],
}


def parse_copilot_query(query: str) -> Dict[str, Any]:
    """Best-effort NL -> structured filter parser for the AI Career Copilot."""
    text = query.lower()
    filters: Dict[str, Any] = {}

    if any(h in text for h in _FREELANCE_HINTS) or "pmu" in text:
        filters["opportunity_type"] = "freelance" if any(h in text for h in _FREELANCE_HINTS) else None
    if any(h in text for h in _REMOTE_HINTS):
        filters["opportunity_type"] = "remote"

    for geo_label, terms in _GEO_HINTS.items():
        if geo_label in text:
            filters["location"] = terms[0]
            break

    if any(h in text for h in _LEADERSHIP_HINTS):
        filters["seniority"] = "director"  # broad leadership-level filter on seniority_level column

    value_match = re.search(r"(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(lakh|lac|l\b|crore)", text)
    if value_match:
        amount = float(value_match.group(1))
        unit = value_match.group(2)
        multiplier = 10_000_000 if unit == "crore" else 100_000
        filters["min_value"] = amount * multiplier

    search_terms = []
    if "world bank" in text:
        search_terms.append("world bank")
    if "pmu" in text:
        search_terms.append("PMU")
    if "digital transformation" in text:
        search_terms.append("digital transformation")
    if "government consulting" in text:
        search_terms.append("government consulting")
    if "advisory" in text:
        search_terms.append("advisory")
    if any(h in text for h in _MULTILATERAL_HINTS) and "world bank" not in search_terms:
        for hint in _MULTILATERAL_HINTS:
            if hint in text:
                search_terms.append(hint)
                break

    if search_terms:
        filters["search"] = search_terms[0]

    return filters


@router.post("/query", response_model=CopilotQueryResponse)
async def copilot_query(
    request: CopilotQueryRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Run a natural-language opportunity query through the AI Career Copilot."""
    job_service = JobService(db)
    filters = parse_copilot_query(request.query)
    filters["strict_qualify"] = True

    jobs, total = await job_service.get_jobs_with_filters(
        filters=filters,
        page=1,
        limit=request.limit,
        sort_by="match_score",
        sort_order="desc",
        user_id=current_user.id,
    )

    results = [
        {
            "id": job.id,
            "title": job.title,
            "company": job.company,
            "location": job.location,
            "remote_type": job.remote_type,
            "match_score": job.match_score,
            "why_relevant": job.why_relevant,
            "score_breakdown": job.score_breakdown,
            "source_url": job.source_url,
        }
        for job in jobs
    ]

    logger.info(f"Copilot query '{request.query}' -> filters={filters}, results={len(results)}")

    return CopilotQueryResponse(
        query=request.query,
        interpreted_filters=filters,
        total=total,
        results=results,
    )


@router.get("/suggested-queries")
async def suggested_queries():
    """Static list of example queries surfaced in the copilot UI."""
    return {
        "suggestions": [
            "Find VP-level government consulting jobs in Delhi NCR.",
            "Find remote advisory opportunities globally.",
            "Find World Bank consulting assignments.",
            "Find PMU opportunities.",
            "Find leadership roles matching my profile.",
            "Find consulting assignments worth more than ₹5 lakh.",
            "Find Middle East digital transformation opportunities.",
        ]
    }
