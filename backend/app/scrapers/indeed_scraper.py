import re
import asyncio
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any
from urllib.parse import quote_plus, urljoin

from app.scrapers.base_scraper import BaseScraper
from app.services.job_service import JobCreate
from app.core.logging_config import logger


class IndeedScraper(BaseScraper):
    """
    Indeed.in scraper for senior consulting and digital transformation roles.
    Uses httpx + BeautifulSoup on Indeed's public job search pages.
    """

    SOURCE_NAME = "indeed"
    BASE_URL = "https://in.indeed.com"
    SEARCH_URL = "https://in.indeed.com/jobs"
    RESPECT_ROBOTS = True
    DEFAULT_DELAY = 3.0

    SEARCH_KEYWORDS = [
        "Digital Transformation Senior",
        "Program Director Consulting",
        "E-Governance Consultant Senior",
        "PMO Lead",
        "Public Health IT Consultant",
        "Government Consulting Director",
        "AI Governance Lead",
        "Health Information Systems",
        "World Bank Consultant",
        "Development Sector Program Manager",
    ]

    async def scrape(self) -> List[JobCreate]:
        """Scrape Indeed for all configured keywords."""
        all_jobs: List[JobCreate] = []
        seen_keys: set = set()

        for keyword in self.SEARCH_KEYWORDS[:6]:
            try:
                jobs = await self._search_keyword(keyword)
                for job in jobs:
                    key = f"{job.title}|{job.company}"
                    if key not in seen_keys:
                        seen_keys.add(key)
                        all_jobs.append(job)
                await asyncio.sleep(2)
            except Exception as e:
                logger.warning(f"Indeed keyword '{keyword}' failed: {e}")

        return all_jobs

    async def _search_keyword(self, keyword: str, start: int = 0) -> List[JobCreate]:
        """Perform a single keyword search on Indeed."""
        params = {
            "q": keyword,
            "l": "India",
            "fromage": "14",  # Last 14 days
            "sort": "date",
            "start": str(start),
        }

        try:
            html = await self.fetch(self.SEARCH_URL, params=params)
            if not html:
                return []
            return self._parse_results_page(html)
        except Exception as e:
            logger.warning(f"Indeed search error for '{keyword}': {e}")
            return []

    def _parse_results_page(self, html: str) -> List[JobCreate]:
        """Parse Indeed search results HTML."""
        soup = self.parse_html(html)
        jobs = []

        # Indeed uses data-jk attribute for job IDs on card divs
        job_cards = soup.find_all("div", attrs={"data-jk": True})
        if not job_cards:
            job_cards = soup.find_all("td", class_=re.compile(r"resultContent"))
        if not job_cards:
            job_cards = soup.find_all("div", class_=re.compile(r"job_seen_beacon|tapItem|jobsearch"))

        for card in job_cards[:20]:
            try:
                job = self._parse_card(card)
                if job:
                    jobs.append(job)
            except Exception as e:
                logger.debug(f"Failed to parse Indeed card: {e}")

        return jobs

    def _parse_card(self, card) -> Optional[JobCreate]:
        """Parse an individual Indeed job card."""
        # Job ID
        external_id = card.get("data-jk")

        # Title
        title_el = (
            card.find("h2", class_=re.compile(r"jobTitle|title"))
            or card.find("a", attrs={"data-jk": True})
        )
        title = None
        if title_el:
            span = title_el.find("span")
            title = (span or title_el).get_text(strip=True)

        # Company
        company_el = card.find(class_=re.compile(r"companyName|company"))
        company = company_el.get_text(strip=True) if company_el else None

        # Location
        location_el = card.find(class_=re.compile(r"companyLocation|location"))
        location = location_el.get_text(strip=True) if location_el else None

        # Salary
        salary_el = card.find(class_=re.compile(r"salary|pay"))
        salary_text = salary_el.get_text(strip=True) if salary_el else ""

        # Posted date
        date_el = card.find("span", class_=re.compile(r"date|posted"))
        posted_date = None
        if date_el:
            posted_date = self._parse_indeed_date(date_el.get_text(strip=True))

        # Build URL
        source_url = None
        if external_id:
            source_url = f"{self.BASE_URL}/viewjob?jk={external_id}"

        # Remote detection
        remote_type = None
        all_text = card.get_text(" ", strip=True).lower()
        if "remote" in all_text:
            remote_type = "remote"
        elif "hybrid" in all_text:
            remote_type = "hybrid"

        if not title or not company:
            return None

        sal_min, sal_max, currency = self.normalize_salary(salary_text)

        return JobCreate(
            title=title,
            company=company,
            location=location,
            salary_min=sal_min,
            salary_max=sal_max,
            salary_currency=currency,
            remote_type=remote_type,
            source_platform=self.SOURCE_NAME,
            source_url=source_url,
            external_job_id=external_id,
            posted_date=posted_date,
            seniority_level=self.normalize_seniority(title),
            job_type="full-time",
            raw_data={"card_text": card.get_text(" ", strip=True)[:500]},
        )

    def _parse_indeed_date(self, text: str) -> Optional[datetime]:
        """Parse Indeed relative dates like 'Posted 3 days ago'."""
        now = datetime.now(timezone.utc)
        text = text.lower().strip()

        if "today" in text or "just" in text:
            return now
        if "yesterday" in text:
            return now - timedelta(days=1)

        m = re.search(r"(\d+)\s*day", text)
        if m:
            return now - timedelta(days=int(m.group(1)))

        m = re.search(r"(\d+)\s*hour", text)
        if m:
            return now - timedelta(hours=int(m.group(1)))

        m = re.search(r"(\d+)\s*week", text)
        if m:
            return now - timedelta(weeks=int(m.group(1)))

        m = re.search(r"(\d+)\+?\s*month", text)
        if m:
            return now - timedelta(days=int(m.group(1)) * 30)

        return None
