import re
import asyncio
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any
from urllib.parse import urljoin

from app.scrapers.base_scraper import BaseScraper
from app.services.job_service import JobCreate
from app.core.logging_config import logger


class DevNetScraper(BaseScraper):
    """
    DevNetJobs.org scraper for international development, consulting, and UN jobs.
    Targets senior consulting roles in international development sector.
    """

    SOURCE_NAME = "devnetjobs"
    BASE_URL = "https://www.devnetjobs.org"
    SEARCH_URL = "https://www.devnetjobs.org/jobs/search.html"
    RESPECT_ROBOTS = True
    DEFAULT_DELAY = 3.0

    SEARCH_KEYWORDS = [
        "Digital Transformation",
        "Program Director",
        "E-Governance",
        "Health Systems",
        "Project Management",
        "Public Health Consultant",
        "IT Consulting",
        "Government Advisory",
    ]

    async def scrape(self) -> List[JobCreate]:
        all_jobs: List[JobCreate] = []
        seen_keys: set = set()

        # DevNet has category-based browsing
        categories = [
            "information-technology",
            "program-management",
            "public-health",
            "consulting",
            "monitoring-evaluation",
        ]

        for category in categories[:4]:
            try:
                jobs = await self._scrape_category(category)
                for job in jobs:
                    key = f"{job.title}|{job.company}"
                    if key not in seen_keys:
                        seen_keys.add(key)
                        all_jobs.append(job)
                await asyncio.sleep(2.5)
            except Exception as e:
                logger.warning(f"DevNet category '{category}' failed: {e}")

        return all_jobs

    async def _scrape_category(self, category: str) -> List[JobCreate]:
        """Scrape a specific DevNet category page."""
        url = f"{self.BASE_URL}/jobs/{category}.html"

        try:
            html = await self.fetch(url)
            if not html:
                return []
            return self._parse_job_list(html)
        except Exception as e:
            logger.warning(f"DevNet scrape error for '{category}': {e}")
            return []

    def _parse_job_list(self, html: str) -> List[JobCreate]:
        """Parse DevNetJobs job listing page."""
        soup = self.parse_html(html)
        jobs = []

        # DevNet job rows are typically in table or div-based listings
        job_rows = (
            soup.find_all("tr", class_=re.compile(r"job|row"))
            or soup.find_all("div", class_=re.compile(r"job-post|listing-item"))
            or soup.find_all("li", class_=re.compile(r"job"))
        )

        for row in job_rows[:20]:
            try:
                job = self._parse_row(row)
                if job:
                    jobs.append(job)
            except Exception as e:
                logger.debug(f"DevNet row parse error: {e}")

        # Also try to find structured job links
        if not jobs:
            links = soup.find_all("a", href=re.compile(r"/jobs/"))
            for link in links[:20]:
                title = link.get_text(strip=True)
                href = link.get("href", "")
                if title and len(title) > 10 and href:
                    source_url = urljoin(self.BASE_URL, href)
                    job = self.normalize_job({
                        "title": title,
                        "company": "International Development Organization",
                        "source_url": source_url,
                        "industry": "International Development",
                    })
                    if job:
                        jobs.append(job)

        return jobs

    def _parse_row(self, row) -> Optional[JobCreate]:
        """Parse a single job row/card element."""
        # Title link
        title_el = row.find("a", href=re.compile(r"/jobs?/|/view"))
        title = title_el.get_text(strip=True) if title_el else None
        source_url = None
        if title_el:
            href = title_el.get("href", "")
            source_url = urljoin(self.BASE_URL, href) if href else None

        if not title:
            all_text = row.get_text(" ", strip=True)
            if len(all_text) < 20:
                return None

        # Company / Organization
        org_el = row.find(class_=re.compile(r"org|company|employer")) or row.find("td", attrs={"data-label": re.compile(r"org|employer", re.I)})
        company = org_el.get_text(strip=True) if org_el else "International Organization"

        # Location
        loc_el = row.find(class_=re.compile(r"location|country")) or row.find("td", attrs={"data-label": re.compile(r"location|country", re.I)})
        location = loc_el.get_text(strip=True) if loc_el else None

        # Closing date
        date_el = row.find(class_=re.compile(r"date|deadline|closing")) or row.find("td", attrs={"data-label": re.compile(r"date|deadline", re.I)})
        posted_date = None
        if date_el:
            date_text = date_el.get_text(strip=True)
            posted_date = self._parse_date(date_text)

        if not title:
            return None

        return self.normalize_job({
            "title": title,
            "company": company,
            "location": location,
            "source_url": source_url,
            "posted_date": posted_date,
            "industry": "International Development",
            "job_type": "contract",
        })

    def _parse_date(self, text: str) -> Optional[datetime]:
        """Parse various date formats."""
        formats = ["%B %d, %Y", "%d %B %Y", "%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y"]
        for fmt in formats:
            try:
                return datetime.strptime(text.strip(), fmt).replace(tzinfo=timezone.utc)
            except ValueError:
                continue
        return None
