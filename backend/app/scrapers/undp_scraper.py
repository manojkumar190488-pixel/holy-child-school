import re
import asyncio
import json
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from urllib.parse import urljoin

from app.scrapers.base_scraper import BaseScraper
from app.services.job_service import JobCreate
from app.core.logging_config import logger


class UNDPScraper(BaseScraper):
    """
    UNDP Careers scraper targeting Program Manager, Digital Transformation,
    E-Governance, and related roles.
    Uses UNDP's public careers API and careers page.
    """

    SOURCE_NAME = "undp"
    BASE_URL = "https://jobs.undp.org"
    CAREERS_API = "https://jobs.undp.org/cj_view_jobs.cfm"
    RESPECT_ROBOTS = True
    DEFAULT_DELAY = 3.0

    SEARCH_KEYWORDS = [
        "Digital Transformation",
        "Program Manager",
        "E-Governance",
        "Information Technology",
        "Health Specialist",
        "Project Manager",
        "Monitoring and Evaluation",
        "Strategic Advisor",
    ]

    async def scrape(self) -> List[JobCreate]:
        """Scrape UNDP jobs portal."""
        all_jobs: List[JobCreate] = []
        seen_ids: set = set()

        # UNDP has a public jobs listing
        for keyword in self.SEARCH_KEYWORDS[:5]:
            try:
                jobs = await self._search_jobs(keyword)
                for job in jobs:
                    uid = job.external_job_id or f"{job.title}|{job.company}"
                    if uid not in seen_ids:
                        seen_ids.add(uid)
                        all_jobs.append(job)
                await asyncio.sleep(3)
            except Exception as e:
                logger.warning(f"UNDP keyword '{keyword}' failed: {e}")

        # Also scrape the general listing
        try:
            general_jobs = await self._scrape_listing_page()
            for job in general_jobs:
                uid = job.external_job_id or f"{job.title}|{job.company}"
                if uid not in seen_ids:
                    seen_ids.add(uid)
                    all_jobs.append(job)
        except Exception as e:
            logger.warning(f"UNDP general listing failed: {e}")

        return all_jobs

    async def _search_jobs(self, keyword: str) -> List[JobCreate]:
        """Search UNDP jobs by keyword."""
        params = {
            "job_title": keyword,
            "agency": "UNDP",
            "country_code": "",
            "practice_area_id": "",
        }

        try:
            html = await self.fetch(self.CAREERS_API, params=params)
            if not html:
                return []
            return self._parse_jobs_html(html, keyword)
        except Exception as e:
            logger.warning(f"UNDP search error for '{keyword}': {e}")
            return []

    async def _scrape_listing_page(self) -> List[JobCreate]:
        """Scrape the general UNDP jobs listing."""
        url = f"{self.BASE_URL}/cj_view_jobs.cfm"
        params = {"cj_agency": "UNDP", "cj_grade": "P-4,P-5,D-1,D-2,SB-5"}

        try:
            html = await self.fetch(url, params=params)
            if not html:
                return []
            return self._parse_jobs_html(html, "general")
        except Exception as e:
            logger.warning(f"UNDP listing page error: {e}")
            return []

    def _parse_jobs_html(self, html: str, context: str = "") -> List[JobCreate]:
        """Parse UNDP jobs HTML page."""
        soup = self.parse_html(html)
        jobs = []

        # UNDP jobs are typically in table rows
        rows = soup.find_all("tr", class_=re.compile(r"job|listing|row"))
        if not rows:
            rows = soup.find_all("tr")

        for row in rows:
            cells = row.find_all("td")
            if len(cells) < 2:
                continue

            try:
                job = self._parse_table_row(row, cells)
                if job:
                    jobs.append(job)
            except Exception as e:
                logger.debug(f"UNDP row parse error: {e}")

        # Also try div-based layout
        if not jobs:
            job_items = soup.find_all("div", class_=re.compile(r"job-item|vacancy|opening"))
            for item in job_items[:20]:
                try:
                    job = self._parse_job_item(item)
                    if job:
                        jobs.append(job)
                except Exception as e:
                    logger.debug(f"UNDP item parse error: {e}")

        return jobs

    def _parse_table_row(self, row, cells) -> Optional[JobCreate]:
        """Parse a table row from UNDP listing."""
        # Find title link
        title_link = row.find("a", href=re.compile(r"cj_view_job|job_id|jobid"))
        if not title_link:
            title_link = row.find("a")

        title = title_link.get_text(strip=True) if title_link else cells[0].get_text(strip=True)
        if not title or len(title) < 10:
            return None

        source_url = None
        external_id = None
        if title_link:
            href = title_link.get("href", "")
            source_url = urljoin(self.BASE_URL, href) if href else None
            id_match = re.search(r"job_id=(\d+)|jobid=(\d+)|id=(\d+)", href)
            if id_match:
                external_id = next(g for g in id_match.groups() if g)

        # Location (usually in 2nd or 3rd column)
        location = cells[1].get_text(strip=True) if len(cells) > 1 else None
        if location and any(skip in location.lower() for skip in ["post level", "grade", "type"]):
            location = cells[2].get_text(strip=True) if len(cells) > 2 else None

        # Closing date
        posted_date = None
        for cell in cells:
            text = cell.get_text(strip=True)
            if re.match(r"\d{1,2}\s+\w+\s+\d{4}|\d{4}-\d{2}-\d{2}", text):
                try:
                    for fmt in ["%d %B %Y", "%Y-%m-%d", "%B %d, %Y"]:
                        try:
                            posted_date = datetime.strptime(text, fmt).replace(tzinfo=timezone.utc)
                            break
                        except ValueError:
                            continue
                except Exception:
                    pass
                if posted_date:
                    break

        return self.normalize_job({
            "title": title,
            "company": "UNDP",
            "location": location,
            "source_url": source_url,
            "external_job_id": external_id,
            "posted_date": posted_date,
            "industry": "International Development",
            "job_type": "contract",
        })

    def _parse_job_item(self, item) -> Optional[JobCreate]:
        """Parse a div-based job item."""
        title_el = item.find(["h2", "h3", "h4", "a"])
        title = title_el.get_text(strip=True) if title_el else None
        if not title:
            return None

        source_url = None
        if hasattr(title_el, "href"):
            href = title_el.get("href", "")
            source_url = urljoin(self.BASE_URL, href) if href else None

        loc_el = item.find(class_=re.compile(r"location|country"))
        location = loc_el.get_text(strip=True) if loc_el else None

        return self.normalize_job({
            "title": title,
            "company": "UNDP",
            "location": location,
            "source_url": source_url,
            "industry": "International Development",
            "job_type": "contract",
        })
