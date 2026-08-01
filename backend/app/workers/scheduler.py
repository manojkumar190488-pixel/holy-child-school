"""
APScheduler setup for GovIntel AI.

Schedule:
- 6:00 AM, 12:00 PM, 6:00 PM IST daily: discovery agent runs all scrapers,
  deduplicates, scores every opportunity, and fires threshold-based alerts
- Daily 8:00 AM IST: compiles and sends the daily digest (email/Telegram/WhatsApp)
- Every 6 hours: re-check and deactivate expired/filled jobs
- Weekly Sunday 9:00 AM IST: skills gap analysis report
"""

from datetime import datetime, timezone
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
from pytz import timezone as pytz_timezone

from app.core.config import settings
from app.core.logging_config import logger

IST = pytz_timezone("Asia/Kolkata")
scheduler: AsyncIOScheduler = None


async def job_discovery_agent():
    """
    GovIntel discovery agent — runs 3x daily (6 AM / 12 PM / 6 PM IST).
    Scrapes all sources, deduplicates, scores every opportunity against the
    weighted matching model, and fires real-time alerts for anything that
    clears the alert thresholds (match score > 80, value > 25L, or a
    leadership-level opportunity).
    """
    logger.info("Starting GovIntel discovery agent run")
    from app.core.database import AsyncSessionLocal
    from app.scrapers.scraper_registry import run_all_scrapers
    from app.services.notification_service import NotificationService

    async with AsyncSessionLocal() as db:
        try:
            scrape_stats = await run_all_scrapers(db=db, score_jobs=True)
            logger.info(f"Discovery agent scrape complete: {scrape_stats}")

            notif_service = NotificationService(db)
            alert_stats = await notif_service.send_realtime_alerts()
            logger.info(f"Real-time alerts dispatched: {alert_stats}")

            await db.commit()
        except Exception as e:
            logger.error(f"Discovery agent run error: {e}", exc_info=True)
            await db.rollback()


async def job_daily_digest():
    """Daily 8:00 AM IST: compile and send the full daily digest email/Telegram."""
    logger.info("Compiling daily digest")
    from app.core.database import AsyncSessionLocal
    from app.services.notification_service import NotificationService

    async with AsyncSessionLocal() as db:
        try:
            notif_service = NotificationService(db)
            digest_stats = await notif_service.compile_daily_digest()
            logger.info(f"Daily digest sent: {digest_stats}")
            await db.commit()
        except Exception as e:
            logger.error(f"Daily digest error: {e}", exc_info=True)
            await db.rollback()


async def job_refresh_expired():
    """Every 6 hours: deactivate old jobs, refresh stale listings."""
    logger.info("Running expired jobs cleanup")
    from app.core.database import AsyncSessionLocal
    from app.services.job_service import JobService

    async with AsyncSessionLocal() as db:
        try:
            job_service = JobService(db)
            # Deactivate jobs older than 30 days
            deactivated = await job_service.mark_expired_jobs_inactive(days_old=30)
            # Deduplicate
            dedup = await job_service.deduplicate_jobs()
            await db.commit()
            logger.info(
                f"Cleanup: deactivated={deactivated}, "
                f"duplicates_removed={dedup.get('duplicates_removed', 0)}"
            )
        except Exception as e:
            logger.error(f"Expired jobs cleanup error: {e}", exc_info=True)
            await db.rollback()


async def job_weekly_skills_report():
    """Weekly: generate and send skills gap analysis report."""
    logger.info("Running weekly skills gap analysis")
    from app.core.database import AsyncSessionLocal
    from app.services.ai_service import AIService
    from app.services.user_service import UserService
    from app.services.notification_service import NotificationService
    from sqlalchemy import select
    from app.models.job import Job

    async with AsyncSessionLocal() as db:
        try:
            # Fetch top scoring jobs from the past week
            from datetime import timedelta
            since = datetime.now(timezone.utc) - timedelta(days=7)

            result = await db.execute(
                select(Job)
                .where(
                    Job.is_active == True,
                    Job.match_score >= 60,
                    Job.scraped_at >= since,
                    Job.missing_skills.isnot(None),
                )
                .limit(100)
            )
            jobs = result.scalars().all()

            if not jobs:
                logger.info("Weekly skills report: no jobs with missing skills data")
                return

            ai_service = AIService()
            gap_analysis = await ai_service.analyze_skills_gap(jobs)

            # Send via notification to all active users
            user_service = UserService(db)
            users = await user_service.get_all_active_users()

            notif_service = NotificationService(db)
            for user in users:
                prefs = user.notification_preferences or {}
                if prefs.get("weekly_skills_report", True):
                    gap_text = gap_analysis.get("recommendations", "")
                    top_gaps = gap_analysis.get("top_gaps", [])[:5]
                    gaps_list = "\n".join(
                        f"- {g['skill']} ({g['frequency']}x)" for g in top_gaps
                    )
                    message = (
                        f"📊 *Weekly Skills Gap Report*\n\n"
                        f"Based on {len(jobs)} recent opportunities:\n"
                        f"{gaps_list}\n\n"
                        f"💡 {gap_text[:400]}"
                    )
                    if user.telegram_chat_id and prefs.get("telegram"):
                        await notif_service.send_telegram_message(
                            chat_id=user.telegram_chat_id,
                            message=message,
                        )

            logger.info(f"Weekly skills report sent to {len(users)} users")
            await db.commit()
        except Exception as e:
            logger.error(f"Weekly skills report error: {e}", exc_info=True)
            await db.rollback()


async def job_score_unscored():
    """Hourly: score any jobs that haven't been scored yet."""
    from app.core.database import AsyncSessionLocal
    from app.scrapers.scraper_registry import _score_new_jobs

    async with AsyncSessionLocal() as db:
        try:
            scored = await _score_new_jobs(db, limit=30)
            if scored > 0:
                await db.commit()
                logger.info(f"Scored {scored} previously unscored jobs")
        except Exception as e:
            logger.error(f"Score unscored jobs error: {e}", exc_info=True)
            await db.rollback()


def create_scheduler() -> AsyncIOScheduler:
    """Create and configure the APScheduler instance."""
    global scheduler

    scheduler = AsyncIOScheduler(
        timezone=IST,
        job_defaults={
            "coalesce": True,
            "max_instances": 1,
            "misfire_grace_time": 300,  # 5 minutes
        },
    )

    # Discovery agent at 6:00 AM, 12:00 PM, 6:00 PM IST
    for hour in settings.DISCOVERY_RUN_HOURS:
        scheduler.add_job(
            job_discovery_agent,
            trigger=CronTrigger(hour=hour, minute=0, timezone=IST),
            id=f"discovery_agent_{hour:02d}00",
            name=f"GovIntel Discovery Agent ({hour:02d}:00 IST)",
            replace_existing=True,
        )

    # Daily digest at 8:00 AM IST
    scheduler.add_job(
        job_daily_digest,
        trigger=CronTrigger(
            hour=settings.DAILY_DIGEST_HOUR,
            minute=settings.DAILY_DIGEST_MINUTE,
            timezone=IST,
        ),
        id="daily_digest",
        name="Daily Digest",
        replace_existing=True,
    )

    # Expired jobs cleanup every 6 hours
    scheduler.add_job(
        job_refresh_expired,
        trigger=IntervalTrigger(
            hours=settings.REFRESH_JOBS_INTERVAL_HOURS,
            timezone=IST,
        ),
        id="refresh_expired_jobs",
        name="Refresh Expired Jobs",
        replace_existing=True,
    )

    # Weekly skills gap report (Sunday 9:00 AM IST)
    scheduler.add_job(
        job_weekly_skills_report,
        trigger=CronTrigger(
            day_of_week="sun",
            hour=9,
            minute=0,
            timezone=IST,
        ),
        id="weekly_skills_report",
        name="Weekly Skills Gap Report",
        replace_existing=True,
    )

    # Hourly: score unscored jobs
    scheduler.add_job(
        job_score_unscored,
        trigger=IntervalTrigger(hours=1, timezone=IST),
        id="score_unscored_jobs",
        name="Score Unscored Jobs",
        replace_existing=True,
    )

    logger.info(
        f"Scheduler configured with {len(scheduler.get_jobs())} jobs. "
        f"Daily digest at {settings.DAILY_DIGEST_HOUR:02d}:{settings.DAILY_DIGEST_MINUTE:02d} IST"
    )
    return scheduler


def get_scheduler() -> AsyncIOScheduler:
    global scheduler
    if scheduler is None:
        scheduler = create_scheduler()
    return scheduler
