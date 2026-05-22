import re
import asyncio
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any
from urllib.parse import urljoin, quote_plus

from app.scrapers.base_scraper import BaseScraper
from app.services.job_service import JobCreate
from app.core.logging_config import logger


class IIMJobsScraper(BaseScraper):
    """
    iimjobs.com scraper for senior consulting and leadership roles in India.
    iimjobs specializes in management/senior-level hiring.
    """

    SOURCE_NAME = "iimjobs"
    BASE_URL = "https://www.iimjobs.com"
    SEARCH_URL = "https://www.iimjobs.com/j"
    RESPECT_ROBOTS = True
    DEFAULT_DELAY = 3.0

    SEARCH_KEYWORDS = [
        "Digital Transformation",
        "Management Consulting",
        "Program Director",
        "PMO Head",
        "Government Consulting",
        "E-Governance",
        "Public Sector Consulting",
        "Senior Consultant",
        "Strategy Consulting",
        "Healthcare Consulting",
    ]

    async def scrape(self) -> List[JobCreate]:
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
                await asyncio.sleep(2.5)
            except Exception as e:
                logger.warning(f"iimjobs keyword '{keyword}' failed: {e}")

        return all_jobs

    async def _search_keyword(self, keyword: str) -> List[JobCreate]:
        """Search iimjobs for a keyword."""
        # iimjobs uses query parameters for search
        params = {
            "q": keyword,
            "exp": "10-20",  # 10-20 years experience
            "sort": "1",  # Sort by date
        }

        try:
            html = await self.fetch(self.SEARCH_URL, params=params)
            if not html:
                return []
            return self._parse_search_results(html)
        except Exception as e:
            logger.warning(f"iimjobs search error for '{keyword}': {e}")
            return []

    def _parse_search_results(self, html: str) -> List[JobCreate]:
        """Parse iimjobs search results page."""
        soup = self.parse_html(html)
        jobs = []

        # iimjobs job cards
        job_cards = (
            soup.find_all("div", class_=re.compile(r"job-card|jobTuple|job-list-item"))
            or soup.find_all("li", class_=re.compile(r"job"))
            or soup.find_all("article", class_=re.compile(r"job"))
        )

        for card in job_cards[:20]:
            try:
                job = self._parse_card(card)
                if job:
                    jobs.append(job)
            except Exception as e:
                logger.debug(f"iimjobs card parse error: {e}")

        return jobs

    def _parse_card(self, card) -> Optional[JobCreate]:
        """Parse a single iimjobs job card."""
        # Title
        title_el = (
            card.find("h2", class_=re.compile(r"title|job-title"))
            or card.find("a", class_=re.compile(r"title|job"))
            or card.find(["h2", "h3"])
        )
        title = title_el.get_text(strip=True) if title_el else None

        # Source URL
        source_url = None
        link_el = card.find("a", href=re.compile(r"/jobs?/"))
        if link_el:
            href = link_el.get("href", "")
            source_url = urljoin(self.BASE_URL, href) if href else None

        # Company
        company_el = card.find(class_=re.compile(r"company|employer|org"))
        company = company_el.get_text(strip=True) if company_el else None
        if not company:
            # Try finding it near a company icon or label
            for tag in card.find_all(class_=re.compile(r"meta|detail")):
                text = tag.get_text(strip=True)
                if text and 3 < len(text) < 80:
                    company = text
                    break

        # Location
        loc_el = card.find(class_=re.compile(r"location|city"))
        location = loc_el.get_text(strip=True) if loc_el else None

        # Experience required
        exp_el = card.find(class_=re.compile(r"experience|exp"))
        experience_text = exp_el.get_text(strip=True) if exp_el else ""

        # Salary
        sal_el = card.find(class_=re.compile(r"salary|ctc|pay"))
        salary_text = sal_el.get_text(strip=True) if sal_el else ""

        # Posted date
        date_el = card.find(class_=re.compile(r"date|posted|time"))
        posted_date = None
        if date_el:
            date_text = date_el.get_text(strip=True)
            posted_date = self._parse_date(date_text)

        # Tags/skills
        tags = []
        skill_el = card.find(class_=re.compile(r"skills|tags"))
        if skill_el:
            tag_items = skill_el.find_all(["span", "li", "a"])
            tags = [t.get_text(strip=True) for t in tag_items if t.get_text(strip=True)][:10]

        if not title:
            return None

        company = company or "Undisclosed Company"
        sal_min, sal_max, currency = self.normalize_salary(salary_text)

        return JobCreate(
            title=title,
            company=company,
            location=location,
            salary_min=sal_min,
            salary_max=sal_max,
            salary_currency=currency,
            remote_type=self.normalize_remote_type(f"{location or ''} {title}"),
            source_platform=self.SOURCE_NAME,
            source_url=source_url,
            posted_date=posted_date,
            seniority_level=self.normalize_seniority(title, experience_text),
            job_type="full-time",
            industry="Consulting / Management",
            tags=tags,
            raw_data={"experience": experience_text},
        )

    def _parse_date(self, text: str) -> Optional[datetime]:
        """Parse iimjobs date strings."""
        now = datetime.now(timezone.utc)
        text = text.lower().strip()

        if "today" in text or "just" in text or "hour" in text:
            return now
        if "yesterday" in text:
            return now - timedelta(days=1)

        m = re.search(r"(\d+)\s*day", text)
        if m:
            return now - timedelta(days=int(m.group(1)))

        m = re.search(r"(\d+)\s*week", text)
        if m:
            return now - timedelta(weeks=int(m.group(1)))

        m = re.search(r"(\d+)\s*month", text)
        if m:
            return now - timedelta(days=int(m.group(1)) * 30)

        formats = ["%d %b %Y", "%d %B %Y", "%b %d, %Y", "%d/%m/%Y"]
        for fmt in formats:
            try:
                return datetime.strptime(text.strip(), fmt).replace(tzinfo=timezone.utc)
            except ValueError:
                continue

        return None
