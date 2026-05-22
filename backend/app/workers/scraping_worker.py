"""
Celery worker for async scraping tasks.
Workers run independently of the FastAPI server for heavy scraping.
"""

import asyncio
from typing import Dict, Any, Optional, List

from celery import Celery
from celery.utils.log import get_task_logger

from app.core.config import settings

# Initialize Celery app
celery_app = Celery(
    "job_intelligence",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    task_soft_time_limit=300,  # 5 minutes soft limit
    task_time_limit=600,  # 10 minutes hard limit
    result_expires=86400,  # Results expire after 24 hours
    beat_schedule={
        "daily-scrape": {
            "task": "app.workers.scraping_worker.run_all_scrapers_task",
            "schedule": 86400.0,  # Every 24 hours
        },
        "refresh-expired-jobs": {
            "task": "app.workers.scraping_worker.refresh_expired_jobs_task",
            "schedule": 21600.0,  # Every 6 hours
        },
    },
)

task_logger = get_task_logger(__name__)


def run_async(coro):
    """Helper to run async code in Celery sync worker."""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as pool:
                future = pool.submit(asyncio.run, coro)
                return future.result()
        else:
            return loop.run_until_complete(coro)
    except RuntimeError:
        return asyncio.run(coro)


@celery_app.task(
    bind=True,
    name="app.workers.scraping_worker.run_all_scrapers_task",
    max_retries=2,
    default_retry_delay=300,
)
def run_all_scrapers_task(self) -> Dict[str, Any]:
    """Celery task: run all job scrapers."""
    task_logger.info(f"Starting run_all_scrapers_task [{self.request.id}]")

    async def _run():
        from app.core.database import AsyncSessionLocal
        from app.scrapers.scraper_registry import run_all_scrapers

        async with AsyncSessionLocal() as db:
            try:
                stats = await run_all_scrapers(db=db, score_jobs=True)
                await db.commit()
                return stats
            except Exception as e:
                await db.rollback()
                raise

    try:
        result = run_async(_run())
        task_logger.info(f"Scrapers completed: {result}")
        return result
    except Exception as exc:
        task_logger.error(f"Scraper task failed: {exc}", exc_info=True)
        raise self.retry(exc=exc)


@celery_app.task(
    bind=True,
    name="app.workers.scraping_worker.run_single_scraper_task",
    max_retries=2,
    default_retry_delay=60,
)
def run_single_scraper_task(self, scraper_name: str) -> Dict[str, Any]:
    """Celery task: run a specific scraper by name."""
    task_logger.info(f"Running scraper: {scraper_name}")

    async def _run():
        from app.core.database import AsyncSessionLocal
        from app.scrapers.scraper_registry import run_single_scraper

        async with AsyncSessionLocal() as db:
            try:
                result = await run_single_scraper(scraper_name, db, score_jobs=True)
                await db.commit()
                return result
            except Exception as e:
                await db.rollback()
                raise

    try:
        return run_async(_run())
    except Exception as exc:
        raise self.retry(exc=exc)


@celery_app.task(
    name="app.workers.scraping_worker.score_jobs_task",
    max_retries=2,
)
def score_jobs_task(job_ids: Optional[List[int]] = None) -> Dict[str, Any]:
    """Celery task: AI-score a batch of jobs."""
    task_logger.info(f"Scoring jobs: {len(job_ids) if job_ids else 'all unscored'}")

    async def _run():
        from app.core.database import AsyncSessionLocal
        from app.models.job import Job
        from app.ai.matching_engine import MatchingEngine
        from sqlalchemy import select

        async with AsyncSessionLocal() as db:
            try:
                if job_ids:
                    result = await db.execute(select(Job).where(Job.id.in_(job_ids)))
                else:
                    result = await db.execute(
                        select(Job)
                        .where(Job.is_active == True, Job.match_score == None)
                        .limit(100)
                    )
                jobs = result.scalars().all()

                engine = MatchingEngine()
                scored = await engine.batch_rank_jobs(jobs, db=db)
                await db.commit()
                return {"scored": len(scored)}
            except Exception as e:
                await db.rollback()
                raise

    return run_async(_run())


@celery_app.task(
    name="app.workers.scraping_worker.refresh_expired_jobs_task",
)
def refresh_expired_jobs_task() -> Dict[str, Any]:
    """Celery task: clean up expired and duplicate jobs."""

    async def _run():
        from app.core.database import AsyncSessionLocal
        from app.services.job_service import JobService

        async with AsyncSessionLocal() as db:
            try:
                job_service = JobService(db)
                deactivated = await job_service.mark_expired_jobs_inactive(days_old=30)
                dedup = await job_service.deduplicate_jobs()
                await db.commit()
                return {
                    "deactivated": deactivated,
                    "duplicates_removed": dedup.get("duplicates_removed", 0),
                }
            except Exception as e:
                await db.rollback()
                raise

    return run_async(_run())


@celery_app.task(
    name="app.workers.scraping_worker.send_digest_task",
)
def send_digest_task(user_id: Optional[int] = None) -> Dict[str, Any]:
    """Celery task: send email/telegram digest."""

    async def _run():
        from app.core.database import AsyncSessionLocal
        from app.services.notification_service import NotificationService
        from app.services.user_service import UserService
        from app.services.job_service import JobService
        from datetime import timedelta, timezone
        from datetime import datetime

        async with AsyncSessionLocal() as db:
            try:
                notif_service = NotificationService(db)
                if user_id is None:
                    result = await notif_service.compile_daily_digest()
                else:
                    user_service = UserService(db)
                    user = await user_service.get_by_id(user_id)
                    if not user:
                        return {"error": "User not found"}

                    since = datetime.now(timezone.utc) - timedelta(hours=24)
                    job_service = JobService(db)
                    jobs, _ = await job_service.get_jobs_with_filters(
                        filters={"min_score": 60, "posted_after": since, "is_active": True},
                        page=1,
                        limit=15,
                        sort_by="match_score",
                        sort_order="desc",
                        user_id=user_id,
                    )
                    await notif_service.send_email_digest(user=user, jobs=jobs)
                    result = {"sent_to": user.email, "jobs": len(jobs)}

                await db.commit()
                return result
            except Exception as e:
                await db.rollback()
                raise

    return run_async(_run())
