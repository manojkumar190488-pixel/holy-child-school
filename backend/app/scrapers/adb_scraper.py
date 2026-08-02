import re
import asyncio
from datetime import datetime
from typing import List, Dict, Any
from urllib.parse import urljoin

from app.scrapers.base_scraper import BaseScraper
from app.services.job_service import JobCreate
from app.core.logging_config import logger


class ADBScraper(BaseScraper):
    """
    Asian Development Bank (ADB) careers scraper.
    Targets consulting, PMU, procurement, and digital transformation roles
    across ADB-financed programmes — high relevance for multilateral match.
    """

    SOURCE_NAME = "adb"
    BASE_URL = "https://www.adb.org"
    CAREERS_URL = "https://www.adb.org/careers/find-jobs"
    RESPECT_ROBOTS = True
    DEFAULT_DELAY = 3.5

    SEARCH_KEYWORDS = [
        "Digital Transformation",
        "Public Sector Management",
        "Governance Specialist",
        "Procurement Specialist",
        "Program Management",
        "Power Sector",
        "Public Financial Management",
    ]

    async def scrape(self) -> List[JobCreate]:
        """Best-effort scrape of ADB's public careers listing."""
        all_jobs: List[JobCreate] = []
        seen_urls: set = set()

        try:
            html = await self.fetch(self.CAREERS_URL)
            if html:
                jobs = self._parse_listing(html)
                for job in jobs:
                    if job.source_url and job.source_url not in seen_urls:
                        seen_urls.add(job.source_url)
                        all_jobs.append(job)
        except Exception as e:
            logger.warning(f"ADB careers scrape failed: {e}")

        return all_jobs

    def _parse_listing(self, html: str) -> List[JobCreate]:
        soup = self.parse_html(html)
        jobs = []
        rows = soup.find_all(["tr", "div", "li"], class_=re.compile(r"job|vacancy|views-row"))

        for row in rows[:25]:
            try:
                link = row.find("a")
                if not link:
                    continue
                title = link.get_text(strip=True)
                if not title or len(title) < 5:
                    continue
                href = link.get("href", "")
                source_url = urljoin(self.BASE_URL, href) if href else None

                loc_el = row.find(class_=re.compile(r"location|country"))
                location = loc_el.get_text(strip=True) if loc_el else None

                job = self.normalize_job({
                    "title": title,
                    "company": "Asian Development Bank (ADB)",
                    "location": location,
                    "source_url": source_url,
                    "industry": "Multilateral Development Finance",
                    "job_type": "full-time",
                })
                if job:
                    jobs.append(job)
            except Exception as e:
                logger.debug(f"ADB row parse error: {e}")

        return jobs
