from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, distinct
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.job import Job
from app.models.application import Application, ApplicationStatus
from app.models.bookmark import Bookmark
from app.services.ai_service import AIService
from app.services.job_service import JobService
from app.core.logging_config import logger

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/overview")
async def get_analytics_overview(
    days_back: int = Query(30, ge=7, le=365),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get high-level analytics overview."""
    since = datetime.now(timezone.utc) - timedelta(days=days_back)

    # Total jobs in system
    total_jobs = await db.scalar(select(func.count(Job.id)).where(Job.is_active == True))

    # Jobs above 70% match
    high_match_jobs = await db.scalar(
        select(func.count(Job.id)).where(Job.is_active == True, Job.match_score >= 70)
    )

    # New jobs (last N days)
    new_jobs = await db.scalar(
        select(func.count(Job.id)).where(Job.is_active == True, Job.scraped_at >= since)
    )

    # Average match score
    avg_score = await db.scalar(
        select(func.avg(Job.match_score)).where(Job.is_active == True, Job.match_score.isnot(None))
    )

    # Application stats
    total_applications = await db.scalar(
        select(func.count(Application.id)).where(Application.user_id == current_user.id)
    )
    active_applications = await db.scalar(
        select(func.count(Application.id)).where(
            Application.user_id == current_user.id,
            Application.status.in_(
                [ApplicationStatus.APPLIED, ApplicationStatus.INTERVIEWING, ApplicationStatus.OFFERED]
            ),
        )
    )

    # Bookmark count
    bookmark_count = await db.scalar(
        select(func.count(Bookmark.id)).where(Bookmark.user_id == current_user.id)
    )

    # Score distribution
    score_bands = {
        "90-100": 0, "80-89": 0, "70-79": 0, "60-69": 0, "below-60": 0
    }
    band_result = await db.execute(
        select(Job.match_score).where(Job.is_active == True, Job.match_score.isnot(None))
    )
    scores = band_result.scalars().all()
    for s in scores:
        if s >= 90:
            score_bands["90-100"] += 1
        elif s >= 80:
            score_bands["80-89"] += 1
        elif s >= 70:
            score_bands["70-79"] += 1
        elif s >= 60:
            score_bands["60-69"] += 1
        else:
            score_bands["below-60"] += 1

    # Trend: jobs scraped per day for the last 7 days
    trend_data = []
    for i in range(7, 0, -1):
        day_start = datetime.now(timezone.utc) - timedelta(days=i)
        day_end = datetime.now(timezone.utc) - timedelta(days=i - 1)
        count = await db.scalar(
            select(func.count(Job.id)).where(
                Job.scraped_at >= day_start,
                Job.scraped_at < day_end,
            )
        )
        trend_data.append(
            {"date": day_start.strftime("%Y-%m-%d"), "jobs_scraped": count or 0}
        )

    return {
        "period_days": days_back,
        "jobs": {
            "total_active": total_jobs or 0,
            "high_match_above_70": high_match_jobs or 0,
            "new_last_n_days": new_jobs or 0,
            "avg_match_score": round(float(avg_score or 0), 1),
            "score_distribution": score_bands,
        },
        "applications": {
            "total": total_applications or 0,
            "active": active_applications or 0,
        },
        "bookmarks": bookmark_count or 0,
        "scraping_trend": trend_data,
    }


@router.get("/sources")
async def get_source_analytics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Breakdown of jobs by source platform."""
    result = await db.execute(
        select(
            Job.source_platform,
            func.count(Job.id).label("count"),
            func.avg(Job.match_score).label("avg_score"),
            func.max(Job.match_score).label("max_score"),
        )
        .where(Job.is_active == True)
        .group_by(Job.source_platform)
        .order_by(func.count(Job.id).desc())
    )
    rows = result.all()

    return {
        "sources": [
            {
                "platform": row.source_platform or "unknown",
                "job_count": row.count,
                "avg_match_score": round(float(row.avg_score or 0), 1),
                "max_match_score": round(float(row.max_score or 0), 1),
            }
            for row in rows
        ]
    }


@router.get("/skills-gap")
async def get_skills_gap_analysis(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Analyze missing skills from top-scoring jobs to identify gaps."""
    # Fetch top 50 high-scoring jobs with missing_skills populated
    result = await db.execute(
        select(Job)
        .where(
            Job.is_active == True,
            Job.match_score >= 60,
            Job.missing_skills.isnot(None),
        )
        .order_by(Job.match_score.desc())
        .limit(50)
    )
    jobs = result.scalars().all()

    # Aggregate missing skills
    skill_frequency: Dict[str, int] = {}
    for job in jobs:
        if job.missing_skills:
            for skill in job.missing_skills:
                skill_lower = skill.lower().strip()
                skill_frequency[skill_lower] = skill_frequency.get(skill_lower, 0) + 1

    # Sort by frequency
    sorted_gaps = sorted(skill_frequency.items(), key=lambda x: x[1], reverse=True)

    # Categorize
    technical_gaps = []
    soft_skill_gaps = []
    domain_gaps = []

    technical_keywords = ["python", "sql", "power bi", "tableau", "cloud", "aws", "azure", "gcp",
                          "api", "devops", "agile", "scrum", "jira", "data", "analytics"]
    domain_keywords = ["health", "government", "education", "finance", "agriculture", "climate",
                       "procurement", "audit", "compliance", "policy", "legal"]

    for skill, count in sorted_gaps[:30]:
        if any(kw in skill for kw in technical_keywords):
            technical_gaps.append({"skill": skill, "frequency": count})
        elif any(kw in skill for kw in domain_keywords):
            domain_gaps.append({"skill": skill, "frequency": count})
        else:
            soft_skill_gaps.append({"skill": skill, "frequency": count})

    return {
        "analysis_based_on_jobs": len(jobs),
        "top_missing_skills": [{"skill": s, "frequency": c} for s, c in sorted_gaps[:20]],
        "by_category": {
            "technical": technical_gaps[:10],
            "domain_knowledge": domain_gaps[:10],
            "soft_skills": soft_skill_gaps[:10],
        },
        "recommendation": (
            "Focus on certifications or projects in the top missing skills to increase "
            "match scores on high-value opportunities."
        ),
    }


@router.get("/opportunity-heatmap")
async def get_opportunity_heatmap(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Geographic and sector heatmap of job opportunities."""
    # By location
    location_result = await db.execute(
        select(Job.location, func.count(Job.id).label("count"), func.avg(Job.match_score).label("avg_score"))
        .where(Job.is_active == True, Job.location.isnot(None))
        .group_by(Job.location)
        .order_by(func.count(Job.id).desc())
        .limit(20)
    )
    location_rows = location_result.all()

    # By industry/sector
    industry_result = await db.execute(
        select(Job.industry, func.count(Job.id).label("count"), func.avg(Job.match_score).label("avg_score"))
        .where(Job.is_active == True, Job.industry.isnot(None))
        .group_by(Job.industry)
        .order_by(func.count(Job.id).desc())
        .limit(20)
    )
    industry_rows = industry_result.all()

    # By remote type
    remote_result = await db.execute(
        select(Job.remote_type, func.count(Job.id).label("count"))
        .where(Job.is_active == True)
        .group_by(Job.remote_type)
    )
    remote_rows = remote_result.all()

    # By seniority
    seniority_result = await db.execute(
        select(Job.seniority_level, func.count(Job.id).label("count"), func.avg(Job.match_score).label("avg_score"))
        .where(Job.is_active == True, Job.seniority_level.isnot(None))
        .group_by(Job.seniority_level)
        .order_by(func.count(Job.id).desc())
    )
    seniority_rows = seniority_result.all()

    return {
        "by_location": [
            {
                "location": r.location,
                "count": r.count,
                "avg_match_score": round(float(r.avg_score or 0), 1),
            }
            for r in location_rows
        ],
        "by_industry": [
            {
                "industry": r.industry,
                "count": r.count,
                "avg_match_score": round(float(r.avg_score or 0), 1),
            }
            for r in industry_rows
        ],
        "by_remote_type": [
            {"remote_type": r.remote_type or "unknown", "count": r.count}
            for r in remote_rows
        ],
        "by_seniority": [
            {
                "seniority": r.seniority_level,
                "count": r.count,
                "avg_match_score": round(float(r.avg_score or 0), 1),
            }
            for r in seniority_rows
        ],
    }
