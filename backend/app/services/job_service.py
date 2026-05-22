import hashlib
import json
from datetime import datetime, timezone
from typing import Optional, List, Tuple, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func, and_, or_, text, desc, asc
from sqlalchemy.dialects.postgresql import insert as pg_insert
from pydantic import BaseModel
from app.models.job import Job, HiddenJob
from app.core.logging_config import logger


class JobCreate(BaseModel):
    title: str
    company: str
    description: Optional[str] = None
    requirements: Optional[str] = None
    location: Optional[str] = None
    remote_type: Optional[str] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_currency: Optional[str] = "INR"
    salary_period: Optional[str] = "annual"
    source_platform: Optional[str] = None
    source_url: Optional[str] = None
    external_job_id: Optional[str] = None
    recruiter_name: Optional[str] = None
    recruiter_linkedin: Optional[str] = None
    recruiter_email: Optional[str] = None
    posted_date: Optional[datetime] = None
    job_type: Optional[str] = None
    seniority_level: Optional[str] = None
    industry: Optional[str] = None
    department: Optional[str] = None
    tags: Optional[List[str]] = None
    raw_data: Optional[Dict[str, Any]] = None


class JobService:
    def __init__(self, db: AsyncSession):
        self.db = db

    @staticmethod
    def compute_content_hash(title: str, company: str, posted_date: Optional[datetime] = None) -> str:
        """Compute a deduplication hash for a job."""
        raw = f"{title.lower().strip()}|{company.lower().strip()}"
        if posted_date:
            raw += f"|{posted_date.date().isoformat()}"
        return hashlib.sha256(raw.encode()).hexdigest()[:32]

    async def get_jobs_with_filters(
        self,
        filters: Dict[str, Any],
        page: int = 1,
        limit: int = 20,
        sort_by: str = "match_score",
        sort_order: str = "desc",
        user_id: Optional[int] = None,
    ) -> Tuple[List[Job], int]:
        """Fetch jobs with full filtering, pagination, and hidden-job exclusion."""
        offset = (page - 1) * limit
        query = select(Job).where(Job.is_active == True)

        # Exclude hidden jobs for authenticated users
        if user_id:
            hidden_subquery = select(HiddenJob.job_id).where(HiddenJob.user_id == user_id)
            query = query.where(Job.id.not_in(hidden_subquery))

        # Apply filters
        if filters.get("source"):
            query = query.where(Job.source_platform == filters["source"])
        if filters.get("location"):
            query = query.where(Job.location.ilike(f"%{filters['location']}%"))
        if filters.get("remote_type"):
            query = query.where(Job.remote_type == filters["remote_type"])
        if filters.get("seniority"):
            query = query.where(Job.seniority_level.ilike(f"%{filters['seniority']}%"))
        if filters.get("job_type"):
            query = query.where(Job.job_type == filters["job_type"])
        if filters.get("industry"):
            query = query.where(Job.industry.ilike(f"%{filters['industry']}%"))
        if filters.get("posted_after"):
            query = query.where(Job.posted_date >= filters["posted_after"])
        if filters.get("min_score") is not None:
            query = query.where(Job.match_score >= filters["min_score"])
        if filters.get("max_score") is not None:
            query = query.where(Job.match_score <= filters["max_score"])
        if filters.get("is_active") is not None:
            query = query.where(Job.is_active == filters["is_active"])
        if filters.get("search"):
            search_term = f"%{filters['search']}%"
            query = query.where(
                or_(
                    Job.title.ilike(search_term),
                    Job.company.ilike(search_term),
                    Job.description.ilike(search_term),
                    Job.location.ilike(search_term),
                )
            )

        # Count total
        count_query = select(func.count()).select_from(query.subquery())
        total = await self.db.scalar(count_query) or 0

        # Sorting
        valid_sort_fields = {
            "match_score": Job.match_score,
            "posted_date": Job.posted_date,
            "scraped_at": Job.scraped_at,
            "title": Job.title,
            "company": Job.company,
        }
        sort_col = valid_sort_fields.get(sort_by, Job.match_score)
        if sort_order == "asc":
            query = query.order_by(asc(sort_col).nullslast())
        else:
            query = query.order_by(desc(sort_col).nullslast())

        query = query.offset(offset).limit(limit)
        result = await self.db.execute(query)
        jobs = result.scalars().all()

        return jobs, total

    async def get_job_by_id(self, job_id: int) -> Optional[Job]:
        result = await self.db.execute(select(Job).where(Job.id == job_id))
        return result.scalar_one_or_none()

    async def upsert_job(self, job_data: JobCreate) -> Tuple[Job, bool]:
        """Insert or update a job. Returns (job, created) tuple."""
        content_hash = self.compute_content_hash(
            job_data.title, job_data.company, job_data.posted_date
        )

        # Check by source_url first (most reliable)
        if job_data.source_url:
            result = await self.db.execute(
                select(Job).where(Job.source_url == job_data.source_url)
            )
            existing = result.scalar_one_or_none()
            if existing:
                for field, value in job_data.model_dump(exclude_none=True).items():
                    if field not in ("id",):
                        setattr(existing, field, value)
                existing.content_hash = content_hash
                self.db.add(existing)
                return existing, False

        # Check by content hash (deduplication)
        result = await self.db.execute(
            select(Job).where(Job.content_hash == content_hash)
        )
        existing = result.scalar_one_or_none()
        if existing:
            # Update scrape timestamp and source URL if newly found on another platform
            existing.scraped_at = datetime.now(timezone.utc)
            self.db.add(existing)
            return existing, False

        # Create new
        job = Job(
            **job_data.model_dump(exclude_none=True),
            content_hash=content_hash,
        )
        self.db.add(job)
        await self.db.flush()
        await self.db.refresh(job)
        return job, True

    async def bulk_upsert(self, jobs_data: List[JobCreate]) -> Dict[str, int]:
        """Bulk insert/update jobs, returns stats."""
        created = 0
        updated = 0
        errors = 0

        for job_data in jobs_data:
            try:
                _, is_new = await self.upsert_job(job_data)
                if is_new:
                    created += 1
                else:
                    updated += 1
            except Exception as e:
                logger.error(f"Error upserting job '{job_data.title}': {e}")
                errors += 1

        return {"created": created, "updated": updated, "errors": errors}

    async def mark_job_hidden(self, user_id: int, job_id: int):
        """Hide a job for a specific user."""
        existing = await self.db.execute(
            select(HiddenJob).where(
                HiddenJob.user_id == user_id,
                HiddenJob.job_id == job_id,
            )
        )
        if not existing.scalar_one_or_none():
            hidden = HiddenJob(user_id=user_id, job_id=job_id)
            self.db.add(hidden)
            await self.db.flush()

    async def unmark_job_hidden(self, user_id: int, job_id: int):
        """Unhide a job for a specific user."""
        await self.db.execute(
            delete(HiddenJob).where(
                HiddenJob.user_id == user_id,
                HiddenJob.job_id == job_id,
            )
        )

    async def get_trending_jobs(self, limit: int = 10) -> List[Job]:
        """Get trending jobs: recently scraped, high match score, active."""
        result = await self.db.execute(
            select(Job)
            .where(Job.is_active == True, Job.match_score.isnot(None))
            .order_by(desc(Job.match_score), desc(Job.scraped_at))
            .limit(limit)
        )
        return result.scalars().all()

    async def get_similar_jobs(self, job_id: int, limit: int = 5) -> List[Job]:
        """Find similar jobs using vector similarity (pgvector cosine distance)."""
        # Get reference job
        ref_job = await self.get_job_by_id(job_id)
        if not ref_job or ref_job.embedding is None:
            # Fallback: same company or similar title
            ref_result = await self.db.execute(
                select(Job)
                .where(
                    Job.id != job_id,
                    Job.is_active == True,
                    or_(
                        Job.company == ref_job.company if ref_job else False,
                        Job.industry == ref_job.industry if ref_job and ref_job.industry else False,
                    ),
                )
                .limit(limit)
            )
            return ref_result.scalars().all()

        # Vector similarity using pgvector
        embedding_str = "[" + ",".join(str(v) for v in ref_job.embedding) + "]"
        result = await self.db.execute(
            text(
                f"""
                SELECT * FROM jobs
                WHERE id != :job_id
                AND is_active = true
                AND embedding IS NOT NULL
                ORDER BY embedding <=> CAST(:embedding AS vector)
                LIMIT :limit
                """
            ).bindparams(job_id=job_id, embedding=embedding_str, limit=limit)
        )
        rows = result.mappings().all()
        similar_jobs = []
        for row in rows:
            j = Job()
            for k, v in row.items():
                if hasattr(j, k):
                    setattr(j, k, v)
            similar_jobs.append(j)
        return similar_jobs

    async def vector_search(
        self,
        query_embedding: List[float],
        filters: Dict[str, Any],
        page: int = 1,
        limit: int = 20,
        user_id: Optional[int] = None,
    ) -> Tuple[List[Job], int]:
        """Semantic search using pgvector cosine similarity."""
        offset = (page - 1) * limit
        embedding_str = "[" + ",".join(str(v) for v in query_embedding) + "]"

        # Build WHERE clauses
        where_clauses = ["is_active = true", "embedding IS NOT NULL"]
        params: Dict[str, Any] = {"embedding": embedding_str, "limit": limit, "offset": offset}

        if user_id:
            where_clauses.append(
                "id NOT IN (SELECT job_id FROM hidden_jobs WHERE user_id = :user_id)"
            )
            params["user_id"] = user_id

        if filters.get("min_score"):
            where_clauses.append("match_score >= :min_score")
            params["min_score"] = filters["min_score"]

        if filters.get("location"):
            where_clauses.append("location ILIKE :location")
            params["location"] = f"%{filters['location']}%"

        if filters.get("remote_type"):
            where_clauses.append("remote_type = :remote_type")
            params["remote_type"] = filters["remote_type"]

        where_str = " AND ".join(where_clauses)

        count_sql = text(
            f"SELECT COUNT(*) FROM jobs WHERE {where_str}"
        ).bindparams(**{k: v for k, v in params.items() if k not in ("limit", "offset", "embedding")})

        search_sql = text(
            f"""
            SELECT *, 1 - (embedding <=> CAST(:embedding AS vector)) AS similarity_score
            FROM jobs
            WHERE {where_str}
            ORDER BY embedding <=> CAST(:embedding AS vector)
            LIMIT :limit OFFSET :offset
            """
        ).bindparams(**params)

        try:
            total = await self.db.scalar(count_sql) or 0
            result = await self.db.execute(search_sql)
            rows = result.mappings().all()

            jobs = []
            for row in rows:
                j = Job()
                for k, v in dict(row).items():
                    if hasattr(j, k) and k != "similarity_score":
                        setattr(j, k, v)
                jobs.append(j)
            return jobs, total
        except Exception as e:
            logger.warning(f"Vector search failed, falling back to text search: {e}")
            return await self.get_jobs_with_filters(
                filters=filters, page=page, limit=limit, user_id=user_id
            )

    async def increment_view_count(self, job_id: int):
        await self.db.execute(
            update(Job).where(Job.id == job_id).values(view_count=Job.view_count + 1)
        )

    async def deduplicate_jobs(self) -> Dict[str, int]:
        """Find and merge duplicate jobs based on title+company+date similarity."""
        duplicates_removed = 0
        result = await self.db.execute(
            select(Job.content_hash, func.count(Job.id).label("cnt"), func.min(Job.id).label("keep_id"))
            .where(Job.content_hash.isnot(None))
            .group_by(Job.content_hash)
            .having(func.count(Job.id) > 1)
        )
        rows = result.all()

        for row in rows:
            # Keep the oldest job (min id), delete the rest
            await self.db.execute(
                update(Job)
                .where(Job.content_hash == row.content_hash, Job.id != row.keep_id)
                .values(is_active=False)
            )
            duplicates_removed += row.cnt - 1

        logger.info(f"Deduplication complete: {duplicates_removed} duplicates deactivated")
        return {"duplicates_removed": duplicates_removed}

    async def mark_expired_jobs_inactive(self, days_old: int = 30):
        """Deactivate jobs older than N days."""
        from datetime import timedelta
        cutoff = datetime.now(timezone.utc) - timedelta(days=days_old)
        result = await self.db.execute(
            update(Job)
            .where(Job.scraped_at < cutoff, Job.is_active == True)
            .values(is_active=False)
            .returning(Job.id)
        )
        deactivated = len(result.fetchall())
        logger.info(f"Marked {deactivated} old jobs as inactive")
        return deactivated
