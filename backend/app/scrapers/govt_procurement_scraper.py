"""
Indian government procurement source connectors: CPPP (Central Public
Procurement Portal) and GeM (Government e-Marketplace).

CPPP publishes tender notices publicly, so this connector attempts a
best-effort fetch of its public tender search results (structure changes
frequently; failures degrade to an empty result rather than raising).

GeM restricts bid-level visibility to registered buyers/sellers, so it
follows the same config-gated pattern as the consulting marketplace and
expert network connectors — inactive until GEM_API_KEY (a registered seller
API credential) is supplied.
"""
import re
from typing import List
from urllib.parse import urljoin

from app.scrapers.base_scraper import BaseScraper
from app.scrapers.consulting_marketplace_scraper import _PartnerAPIConsultingScraper
from app.services.job_service import JobCreate
from app.core.logging_config import logger


class CPPPScraper(BaseScraper):
    """Best-effort public tender notice scraper for eprocure.gov.in (CPPP)."""

    SOURCE_NAME = "cppp"
    BASE_URL = "https://eprocure.gov.in"
    SEARCH_URL = "https://eprocure.gov.in/eprocure/app"
    RESPECT_ROBOTS = True
    DEFAULT_DELAY = 4.0

    SEARCH_KEYWORDS = [
        "digital transformation consultant",
        "PMU technical advisory",
        "e-governance consulting",
        "programme management unit",
    ]

    async def scrape(self) -> List[JobCreate]:
        all_jobs: List[JobCreate] = []
        try:
            html = await self.fetch(self.SEARCH_URL)
        except Exception as e:
            logger.warning(f"CPPP tender search failed: {e}")
            return []

        if not html:
            return []

        try:
            all_jobs = self._parse_tenders(html)
        except Exception as e:
            logger.debug(f"CPPP tender parse error: {e}")

        return all_jobs

    def _parse_tenders(self, html: str) -> List[JobCreate]:
        soup = self.parse_html(html)
        jobs = []
        rows = soup.find_all(["tr", "div"], class_=re.compile(r"tender|notice"))

        for row in rows[:20]:
            try:
                link = row.find("a")
                if not link:
                    continue
                title = link.get_text(strip=True)
                if not title or len(title) < 8:
                    continue
                href = link.get("href", "")
                source_url = urljoin(self.BASE_URL, href) if href else None

                job = self.normalize_job({
                    "title": title,
                    "company": "Government e-Procurement (CPPP)",
                    "location": "India",
                    "source_url": source_url,
                    "industry": "Government Procurement / Tenders",
                    "job_type": "consulting assignment",
                })
                if job:
                    jobs.append(job)
            except Exception as e:
                logger.debug(f"CPPP row parse error: {e}")

        return jobs


class GeMScraper(_PartnerAPIConsultingScraper):
    SOURCE_NAME = "gem"
    API_KEY_SETTING = "GEM_API_KEY"
    PLATFORM_LABEL = "Government e-Marketplace (GeM)"
