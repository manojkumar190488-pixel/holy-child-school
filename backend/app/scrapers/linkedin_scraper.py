import re
import json
import asyncio
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any
from urllib.parse import quote_plus

from app.scrapers.base_scraper import BaseScraper
from app.services.job_service import JobCreate
from app.core.logging_config import logger


class LinkedInScraper(BaseScraper):
    """
    LinkedIn Jobs scraper using public job search endpoint.
    Uses httpx + BeautifulSoup without requiring login for basic scraping.
    Respects rate limits aggressively to avoid blocks.
    """

    SOURCE_NAME = "linkedin"
    BASE_URL = "https://www.linkedin.com"
    JOBS_SEARCH_URL = "https://www.linkedin.com/jobs/search"
    RESPECT_ROBOTS = False  # LinkedIn robots.txt is restrictive but we use public endpoints

    SEARCH_KEYWORDS = [
        "Digital Transformation Director India",
        "PMO Lead Government Consulting India",
        "E-Governance Program Manager",
        "Public Health IT Consultant",
        "Development Sector Program Director",
        "AI Governance Consultant India",
        "World Bank Consulting India",
        "Smart Cities Program Manager India",
        "Health Information Systems Consultant",
        "Government IT Consulting Senior",
    ]

    DEFAULT_DELAY = 4.0  # LinkedIn needs extra delay

    async def scrape(self) -> List[JobCreate]:
        """Scrape LinkedIn Jobs for relevant keywords."""
        all_jobs: List[JobCreate] = []
        seen_ids: set = set()

        for keyword in self.SEARCH_KEYWORDS[:5]:  # Limit to 5 keywords per run
            try:
                jobs = await self._search_keyword(keyword)
                for job in jobs:
                    if job.external_job_id and job.external_job_id not in seen_ids:
                        seen_ids.add(job.external_job_id)
                        all_jobs.append(job)
                await asyncio.sleep(3)
            except Exception as e:
                logger.warning(f"LinkedIn keyword '{keyword}' failed: {e}")

        return all_jobs

    async def _search_keyword(self, keyword: str, start: int = 0) -> List[JobCreate]:
        """Search LinkedIn Jobs for a keyword."""
        params = {
            "keywords": keyword,
            "location": "India",
            "f_TPR": "r604800",  # Past week
            "f_E": "4,5,6",  # Senior, Director, Executive
            "sortBy": "DD",  # Date descending
            "start": str(start),
        }

        try:
            html = await self.fetch(self.JOBS_SEARCH_URL, params=params)
            if not html:
                return []
            return await self._parse_job_cards(html)
        except Exception as e:
            logger.warning(f"LinkedIn search error for '{keyword}': {e}")
            return []

    async def _parse_job_cards(self, html: str) -> List[JobCreate]:
        """Parse LinkedIn job listing HTML."""
        soup = self.parse_html(html)
        jobs = []

        # LinkedIn job cards are in ul.jobs-search__results-list
        job_cards = soup.find_all("div", class_=re.compile(r"base-card|job-search-card"))
        if not job_cards:
            # Try JSON-LD embedded data
            json_ld = soup.find("script", type="application/ld+json")
            if json_ld:
                try:
                    data = json.loads(json_ld.string)
                    return self._parse_json_ld(data)
                except Exception:
                    pass

        for card in job_cards[:20]:
            try:
                job = self._parse_card(card)
                if job:
                    jobs.append(job)
            except Exception as e:
                logger.debug(f"Failed to parse LinkedIn card: {e}")

        return jobs

    def _parse_card(self, card) -> Optional[JobCreate]:
        """Parse a single LinkedIn job card element."""
        # Title
        title_el = card.find(["h3", "h4"], class_=re.compile(r"title|job-title"))
        title = title_el.get_text(strip=True) if title_el else None

        # Company
        company_el = card.find(class_=re.compile(r"company|subtitle"))
        company = company_el.get_text(strip=True) if company_el else None

        # Location
        location_el = card.find(class_=re.compile(r"location|job-location"))
        location = location_el.get_text(strip=True) if location_el else None

        # Job URL and ID
        link_el = card.find("a", href=re.compile(r"/jobs/view/"))
        source_url = None
        external_id = None
        if link_el:
            href = link_el.get("href", "")
            source_url = href.split("?")[0] if href else None
            id_match = re.search(r"/jobs/view/(\d+)", href)
            if id_match:
                external_id = id_match.group(1)

        # Posted date
        date_el = card.find("time")
        posted_date = None
        if date_el:
            dt_str = date_el.get("datetime")
            if dt_str:
                try:
                    posted_date = datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
                except Exception:
                    posted_date = self._parse_relative_date(date_el.get_text(strip=True))

        if not title or not company:
            return None

        return self.normalize_job({
            "title": title,
            "company": company,
            "location": location,
            "source_url": source_url,
            "external_job_id": external_id,
            "posted_date": posted_date,
            "remote_type": self._detect_remote(location or "", title),
        })

    def _parse_json_ld(self, data: Any) -> List[JobCreate]:
        """Parse JSON-LD structured data from LinkedIn."""
        jobs = []
        items = data if isinstance(data, list) else [data]
        for item in items:
            if item.get("@type") != "JobPosting":
                continue
            try:
                loc = item.get("jobLocation", {})
                address = loc.get("address", {}) if isinstance(loc, dict) else {}
                location = address.get("addressLocality") or address.get("addressRegion")

                salary_info = item.get("baseSalary", {})
                salary_text = ""
                if isinstance(salary_info, dict):
                    value = salary_info.get("value", {})
                    if isinstance(value, dict):
                        min_v = value.get("minValue", "")
                        max_v = value.get("maxValue", "")
                        salary_text = f"{min_v}-{max_v}" if min_v and max_v else str(min_v or max_v)

                posted_raw = item.get("datePosted")
                posted_date = None
                if posted_raw:
                    try:
                        posted_date = datetime.fromisoformat(posted_raw)
                    except Exception:
                        pass

                job = self.normalize_job({
                    "title": item.get("title", ""),
                    "company": item.get("hiringOrganization", {}).get("name", ""),
                    "description": item.get("description", ""),
                    "location": location,
                    "source_url": item.get("url"),
                    "posted_date": posted_date,
                    "salary_text": salary_text,
                    "job_type": item.get("employmentType", "full-time").lower(),
                    "remote_type": item.get("jobLocationType", "").lower() or None,
                })
                if job:
                    jobs.append(job)
            except Exception as e:
                logger.debug(f"JSON-LD parse error: {e}")
        return jobs

    def _detect_remote(self, location: str, title: str) -> Optional[str]:
        """Detect remote/hybrid/onsite from location and title strings."""
        combined = (location + " " + title).lower()
        if "remote" in combined:
            return "remote"
        if "hybrid" in combined:
            return "hybrid"
        return "onsite"

    def _parse_relative_date(self, text: str) -> Optional[datetime]:
        """Convert '3 days ago' style strings to datetime."""
        now = datetime.now(timezone.utc)
        text = text.lower().strip()
        if "just now" in text or "hour" in text:
            return now
        if "day" in text:
            m = re.search(r"(\d+)\s*day", text)
            days = int(m.group(1)) if m else 1
            return now - timedelta(days=days)
        if "week" in text:
            m = re.search(r"(\d+)\s*week", text)
            weeks = int(m.group(1)) if m else 1
            return now - timedelta(weeks=weeks)
        if "month" in text:
            m = re.search(r"(\d+)\s*month", text)
            months = int(m.group(1)) if m else 1
            return now - timedelta(days=months * 30)
        return None
