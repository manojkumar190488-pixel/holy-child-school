import re
import asyncio
import json
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from urllib.parse import urljoin

from app.scrapers.base_scraper import BaseScraper
from app.services.job_service import JobCreate
from app.core.logging_config import logger


class WorldBankScraper(BaseScraper):
    """
    World Bank Group careers scraper.
    Targets consulting, PM, and digital transformation roles.
    Uses the WB careers search interface.
    """

    SOURCE_NAME = "worldbank"
    BASE_URL = "https://jobs.worldbank.org"
    SEARCH_URL = "https://jobs.worldbank.org/en/jobs/searchjobs"
    API_URL = "https://jobs.worldbank.org/api/jobs"
    RESPECT_ROBOTS = True
    DEFAULT_DELAY = 3.5

    SEARCH_KEYWORDS = [
        "Digital Transformation",
        "Program Manager",
        "Information Technology Specialist",
        "Senior Operations Officer",
        "Health Specialist",
        "E-Government",
        "Monitoring and Evaluation Specialist",
        "Procurement Specialist",
        "Project Management",
        "Governance Specialist",
    ]

    async def scrape(self) -> List[JobCreate]:
        """Scrape World Bank careers portal."""
        all_jobs: List[JobCreate] = []
        seen_ids: set = set()

        # Try API first
        try:
            jobs = await self._fetch_via_api()
            for job in jobs:
                uid = job.external_job_id or f"{job.title}|{job.company}"
                if uid not in seen_ids:
                    seen_ids.add(uid)
                    all_jobs.append(job)
        except Exception as e:
            logger.warning(f"World Bank API failed, trying HTML: {e}")

        # HTML fallback per keyword
        if not all_jobs:
            for keyword in self.SEARCH_KEYWORDS[:5]:
                try:
                    jobs = await self._search_html(keyword)
                    for job in jobs:
                        uid = job.external_job_id or f"{job.title}|{job.company}"
                        if uid not in seen_ids:
                            seen_ids.add(uid)
                            all_jobs.append(job)
                    await asyncio.sleep(3)
                except Exception as e:
                    logger.warning(f"World Bank HTML search '{keyword}' failed: {e}")

        return all_jobs

    async def _fetch_via_api(self) -> List[JobCreate]:
        """Attempt to use WB jobs API."""
        import httpx

        params = {
            "rows": "20",
            "start": "0",
            "keywords": "Digital Transformation",
            "jobType": "Professional",
            "sort": "posted_date desc",
        }

        try:
            async with httpx.AsyncClient(timeout=20, follow_redirects=True) as client:
                response = await client.get(
                    self.SEARCH_URL,
                    params=params,
                    headers={
                        **self.get_headers(),
                        "Accept": "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                )
                if response.status_code == 200:
                    try:
                        data = response.json()
                        return self._parse_api_response(data)
                    except Exception:
                        return self._parse_html_response(response.text)
                return []
        except Exception as e:
            logger.warning(f"World Bank API request failed: {e}")
            return []

    async def _search_html(self, keyword: str) -> List[JobCreate]:
        """Search WB careers via HTML."""
        params = {
            "keywords": keyword,
            "jobType": "Professional",
            "sort": "posted_date desc",
        }

        try:
            html = await self.fetch(self.SEARCH_URL, params=params)
            if not html:
                return []
            return self._parse_html_response(html)
        except Exception as e:
            logger.warning(f"World Bank HTML search error: {e}")
            return []

    def _parse_api_response(self, data: Dict[str, Any]) -> List[JobCreate]:
        """Parse WB API JSON response."""
        jobs = []
        items = data.get("jobs", []) or data.get("results", []) or data.get("docs", [])

        for item in items:
            try:
                title = item.get("title") or item.get("job_title", "")
                location = item.get("location") or item.get("location_name", "")
                job_id = str(item.get("id") or item.get("job_id", ""))
                source_url = item.get("url") or (
                    f"{self.BASE_URL}/en/jobs/job/{job_id}" if job_id else None
                )

                description = item.get("description") or item.get("body", "")
                posted_raw = item.get("posted_date") or item.get("date_posted")
                posted_date = None
                if posted_raw:
                    try:
                        posted_date = datetime.fromisoformat(
                            str(posted_raw).replace("Z", "+00:00")
                        )
                    except Exception:
                        pass

                grade = item.get("grade", "")
                seniority = self._map_wb_grade(grade) or self.normalize_seniority(title)

                if not title:
                    continue

                job = JobCreate(
                    title=title,
                    company="World Bank Group",
                    description=description[:3000] if description else None,
                    location=location,
                    source_platform=self.SOURCE_NAME,
                    source_url=source_url,
                    external_job_id=job_id or None,
                    posted_date=posted_date,
                    seniority_level=seniority,
                    job_type="full-time",
                    industry="International Development / Finance",
                    raw_data={"grade": grade, "source": "worldbank_api"},
                )
                jobs.append(job)
            except Exception as e:
                logger.debug(f"World Bank API parse error: {e}")

        return jobs

    def _parse_html_response(self, html: str) -> List[JobCreate]:
        """Parse WB careers HTML."""
        soup = self.parse_html(html)
        jobs = []

        # WB uses various selectors depending on the page version
        job_items = (
            soup.find_all("div", class_=re.compile(r"job-result|job-item|search-result"))
            or soup.find_all("li", class_=re.compile(r"job"))
            or soup.find_all("tr", class_=re.compile(r"job"))
        )

        for item in job_items[:20]:
            try:
                title_el = item.find(["h2", "h3", "h4", "a"], class_=re.compile(r"title|job-title"))
                if not title_el:
                    title_el = item.find("a")
                title = title_el.get_text(strip=True) if title_el else None

                loc_el = item.find(class_=re.compile(r"location|country"))
                location = loc_el.get_text(strip=True) if loc_el else None

                source_url = None
                if title_el and title_el.name == "a":
                    href = title_el.get("href", "")
                    source_url = urljoin(self.BASE_URL, href) if href else None
                    # Extract ID from URL
                id_match = re.search(r"/job/(\d+)|jobid=(\d+)", source_url or "")
                external_id = next((g for g in id_match.groups() if g), None) if id_match else None

                if not title:
                    continue

                job = self.normalize_job({
                    "title": title,
                    "company": "World Bank Group",
                    "location": location,
                    "source_url": source_url,
                    "external_job_id": external_id,
                    "industry": "International Development / Finance",
                    "job_type": "full-time",
                })
                if job:
                    jobs.append(job)
            except Exception as e:
                logger.debug(f"World Bank HTML parse error: {e}")

        return jobs

    def _map_wb_grade(self, grade: str) -> Optional[str]:
        """Map World Bank grade to seniority level."""
        if not grade:
            return None
        grade = grade.upper().strip()
        if grade in ("GF", "GG", "GH"):
            return "senior"
        if grade in ("GI", "GJ"):
            return "lead"
        if grade in ("GD", "GE"):
            return "mid"
        if grade.startswith("D") or grade.startswith("MD"):
            return "director"
        return "senior"
