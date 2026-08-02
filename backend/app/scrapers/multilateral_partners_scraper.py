"""
Best-effort connectors for additional multilateral / bilateral development
agencies referenced in the GovIntel sourcing spec: AIIB, UNICEF, WHO, GIZ, FCDO.

These portals vary widely in structure and several require session cookies or
JS rendering for full listings. Each connector attempts a lightweight public
HTML fetch + generic link parsing, and degrades gracefully to an empty result
(logged, not raised) if the site's markup doesn't match — the discovery agent
run is expected to keep working even when one source yields nothing.
"""
import re
from typing import List
from urllib.parse import urljoin

from app.scrapers.base_scraper import BaseScraper
from app.services.job_service import JobCreate
from app.core.logging_config import logger


class _GenericCareersScraper(BaseScraper):
    """Shared generic-listing parser for simple public careers pages."""

    CAREERS_URL: str = ""
    COMPANY_NAME: str = ""
    INDUSTRY: str = "International Development"

    async def scrape(self) -> List[JobCreate]:
        if not self.CAREERS_URL:
            return []
        try:
            html = await self.fetch(self.CAREERS_URL)
        except Exception as e:
            logger.warning(f"{self.SOURCE_NAME} careers fetch failed: {e}")
            return []
        if not html:
            return []
        return self._parse_generic(html)

    def _parse_generic(self, html: str) -> List[JobCreate]:
        soup = self.parse_html(html)
        jobs = []
        rows = soup.find_all(["tr", "div", "li", "article"], class_=re.compile(r"job|vacancy|views-row|position"))

        seen = set()
        for row in rows[:20]:
            try:
                link = row.find("a")
                if not link:
                    continue
                title = link.get_text(strip=True)
                if not title or len(title) < 5:
                    continue
                href = link.get("href", "")
                source_url = urljoin(self.BASE_URL, href) if href else None
                if not source_url or source_url in seen:
                    continue
                seen.add(source_url)

                loc_el = row.find(class_=re.compile(r"location|country|duty"))
                location = loc_el.get_text(strip=True) if loc_el else None

                job = self.normalize_job({
                    "title": title,
                    "company": self.COMPANY_NAME,
                    "location": location,
                    "source_url": source_url,
                    "industry": self.INDUSTRY,
                    "job_type": "full-time",
                })
                if job:
                    jobs.append(job)
            except Exception as e:
                logger.debug(f"{self.SOURCE_NAME} row parse error: {e}")

        return jobs


class AIIBScraper(_GenericCareersScraper):
    SOURCE_NAME = "aiib"
    BASE_URL = "https://www.aiib.org"
    CAREERS_URL = "https://www.aiib.org/en/opportunities/career/current-openings/index.html"
    COMPANY_NAME = "Asian Infrastructure Investment Bank (AIIB)"
    RESPECT_ROBOTS = True
    DEFAULT_DELAY = 3.5


class UNICEFScraper(_GenericCareersScraper):
    SOURCE_NAME = "unicef"
    BASE_URL = "https://jobs.unicef.org"
    CAREERS_URL = "https://jobs.unicef.org/en-us/listing/"
    COMPANY_NAME = "UNICEF"
    RESPECT_ROBOTS = True
    DEFAULT_DELAY = 3.5


class WHOScraper(_GenericCareersScraper):
    SOURCE_NAME = "who"
    BASE_URL = "https://careers.who.int"
    CAREERS_URL = "https://careers.who.int/careersection/ex/joblist.ftl"
    COMPANY_NAME = "World Health Organization (WHO)"
    RESPECT_ROBOTS = True
    DEFAULT_DELAY = 3.5


class GIZScraper(_GenericCareersScraper):
    SOURCE_NAME = "giz"
    BASE_URL = "https://jobs.giz.de"
    CAREERS_URL = "https://jobs.giz.de/index.php?ac=search_result&jobdb_id=1"
    COMPANY_NAME = "GIZ (Deutsche Gesellschaft für Internationale Zusammenarbeit)"
    RESPECT_ROBOTS = True
    DEFAULT_DELAY = 3.5


class FCDOScraper(_GenericCareersScraper):
    SOURCE_NAME = "fcdo"
    BASE_URL = "https://devtracker.fcdo.gov.uk"
    CAREERS_URL = "https://www.civilservicejobs.service.gov.uk/csr/index.cgi?SID=departments=FCDO"
    COMPANY_NAME = "Foreign, Commonwealth & Development Office (FCDO)"
    RESPECT_ROBOTS = True
    DEFAULT_DELAY = 3.5
