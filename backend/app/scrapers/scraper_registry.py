import asyncio
from typing import Dict, List, Type, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.scrapers.base_scraper import BaseScraper
from app.scrapers.linkedin_scraper import LinkedInScraper
from app.scrapers.indeed_scraper import IndeedScraper
from app.scrapers.naukri_scraper import NaukriScraper
from app.scrapers.devnet_scraper import DevNetScraper
from app.scrapers.reliefweb_scraper import ReliefWebScraper
from app.scrapers.undp_scraper import UNDPScraper
from app.scrapers.worldbank_scraper import WorldBankScraper
from app.scrapers.iimjobs_scraper import IIMJobsScraper
from app.scrapers.adb_scraper import ADBScraper
from app.scrapers.multilateral_partners_scraper import (
    AIIBScraper, UNICEFScraper, WHOScraper, GIZScraper, FCDOScraper,
)
from app.scrapers.consulting_marketplace_scraper import (
    CatalantScraper, ComatchScraper, TalmixScraper, Expert360Scraper,
    MaltScraper, BusinessTalentGroupScraper,
)
from app.scrapers.expert_network_scraper import (
    GLGScraper, GuidepointScraper, AlphaSightsScraper, ThirdBridgeScraper, ColemanResearchScraper,
)
from app.scrapers.govt_procurement_scraper import CPPPScraper, GeMScraper
from app.services.job_service import JobService, JobCreate
from app.core.logging_config import logger


SCRAPER_REGISTRY: Dict[str, Type[BaseScraper]] = {
    # Full-time job boards
    "linkedin": LinkedInScraper,
    "indeed": IndeedScraper,
    "naukri": NaukriScraper,
    "devnetjobs": DevNetScraper,
    "iimjobs": IIMJobsScraper,
    # Development agencies / multilaterals
    "reliefweb": ReliefWebScraper,
    "undp": UNDPScraper,
    "worldbank": WorldBankScraper,
    "adb": ADBScraper,
    "aiib": AIIBScraper,
    "unicef": UNICEFScraper,
    "who": WHOScraper,
    "giz": GIZScraper,
    "fcdo": FCDOScraper,
    # Government procurement
    "cppp": CPPPScraper,
    "gem": GeMScraper,
    # Consulting marketplaces (partner-API gated)
    "catalant": CatalantScraper,
    "comatch": ComatchScraper,
    "talmix": TalmixScraper,
    "expert360": Expert360Scraper,
    "malt": MaltScraper,
    "btg": BusinessTalentGroupScraper,
    # Expert networks (partner-API gated)
    "glg": GLGScraper,
    "guidepoint": GuidepointScraper,
    "alphasights": AlphaSightsScraper,
    "thirdbridge": ThirdBridgeScraper,
    "coleman": ColemanResearchScraper,
}


async def run_single_scraper(
    scraper_name: str,
    db: AsyncSession,
    score_jobs: bool = True,
) -> Dict[str, Any]:
    """Run a specific scraper by name and persist results."""
    if scraper_name not in SCRAPER_REGISTRY:
        raise ValueError(f"Unknown scraper: {scraper_name}. Available: {list(SCRAPER_REGISTRY.keys())}")

    scraper_class = SCRAPER_REGISTRY[scraper_name]
    scraper = scraper_class()

    jobs_raw = await scraper.run()
    if not jobs_raw:
        return {"scraper": scraper_name, "scraped": 0, "created": 0, "updated": 0, "errors": 0}

    job_service = JobService(db)
    stats = await job_service.bulk_upsert(jobs_raw)

    # AI scoring for newly created jobs
    if score_jobs and stats["created"] > 0:
        await _score_new_jobs(db, limit=stats["created"])

    logger.info(f"Scraper {scraper_name}: scraped={len(jobs_raw)}, {stats}")
    return {
        "scraper": scraper_name,
        "scraped": len(jobs_raw),
        **stats,
    }


async def run_all_scrapers(
    db: AsyncSession,
    score_jobs: bool = True,
    concurrency: int = 2,
) -> Dict[str, Any]:
    """
    Run all registered scrapers.
    Runs in batches to avoid overwhelming target servers.
    """
    from app.core.config import settings

    if not settings.SCRAPING_ENABLED:
        logger.info("Scraping disabled by config")
        return {"enabled": False}

    scraper_names = list(SCRAPER_REGISTRY.keys())
    all_results = []
    total_scraped = 0
    total_created = 0
    total_updated = 0
    total_errors = 0

    # Run scrapers in batches
    semaphore = asyncio.Semaphore(concurrency)

    async def run_with_semaphore(name: str):
        async with semaphore:
            try:
                result = await run_single_scraper(name, db, score_jobs=False)
                return result
            except Exception as e:
                logger.error(f"Scraper {name} threw exception: {e}", exc_info=True)
                return {"scraper": name, "scraped": 0, "created": 0, "updated": 0, "errors": 1, "error": str(e)}

    tasks = [run_with_semaphore(name) for name in scraper_names]
    results = await asyncio.gather(*tasks, return_exceptions=False)

    for r in results:
        all_results.append(r)
        total_scraped += r.get("scraped", 0)
        total_created += r.get("created", 0)
        total_updated += r.get("updated", 0)
        total_errors += r.get("errors", 0)

    # Deduplicate after all scrapers finish
    job_service = JobService(db)
    dedup_stats = await job_service.deduplicate_jobs()
    await db.commit()

    # Score all new jobs with AI
    if score_jobs and total_created > 0:
        scored = await _score_new_jobs(db, limit=min(total_created, 50))
        await db.commit()
        logger.info(f"Scored {scored} new jobs with AI")

    summary = {
        "scrapers_run": len(scraper_names),
        "total_scraped": total_scraped,
        "total_created": total_created,
        "total_updated": total_updated,
        "total_errors": total_errors,
        "duplicates_removed": dedup_stats.get("duplicates_removed", 0),
        "per_scraper": all_results,
    }

    logger.info(f"All scrapers complete: {summary}")
    return summary


async def _score_new_jobs(db: AsyncSession, limit: int = 50) -> int:
    """Score unscored jobs with AI matching engine."""
    from sqlalchemy import select
    from app.models.job import Job
    from app.ai.matching_engine import MatchingEngine

    result = await db.execute(
        select(Job)
        .where(Job.is_active == True, Job.match_score == None)
        .order_by(Job.scraped_at.desc())
        .limit(limit)
    )
    jobs = result.scalars().all()

    if not jobs:
        return 0

    engine = MatchingEngine()
    scored = await engine.batch_rank_jobs(jobs, db=db)
    await db.commit()
    return len(scored)
