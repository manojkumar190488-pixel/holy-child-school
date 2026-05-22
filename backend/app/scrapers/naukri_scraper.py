import re
import json
import asyncio
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any

from app.scrapers.base_scraper import BaseScraper
from app.services.job_service import JobCreate
from app.core.logging_config import logger


class NaukriScraper(BaseScraper):
    """
    Naukri.com scraper for senior consulting roles in India.
    Uses Naukri's public search API endpoint.
    """

    SOURCE_NAME = "naukri"
    BASE_URL = "https://www.naukri.com"
    API_URL = "https://www.naukri.com/jobapi/v3/search"
    RESPECT_ROBOTS = True
    DEFAULT_DELAY = 2.5

    SEARCH_KEYWORDS = [
        "Digital Transformation Director",
        "PMO Lead Consulting",
        "E-Governance Consultant",
        "Program Director Government",
        "Public Health IT",
        "Senior Management Consultant",
        "AI Governance",
        "Health Information Systems",
        "Smart Cities Consultant",
    ]

    API_HEADERS = {
        "appid": "109",
        "systemid": "109",
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Referer": "https://www.naukri.com/",
    }

    async def scrape(self) -> List[JobCreate]:
        all_jobs: List[JobCreate] = []
        seen_ids: set = set()

        for keyword in self.SEARCH_KEYWORDS[:6]:
            try:
                jobs = await self._search_keyword(keyword)
                for job in jobs:
                    uid = job.external_job_id or f"{job.title}|{job.company}"
                    if uid not in seen_ids:
                        seen_ids.add(uid)
                        all_jobs.append(job)
                await asyncio.sleep(2)
            except Exception as e:
                logger.warning(f"Naukri keyword '{keyword}' failed: {e}")

        return all_jobs

    async def _search_keyword(self, keyword: str) -> List[JobCreate]:
        """Search Naukri via API."""
        params = {
            "noOfResults": "20",
            "urlType": "search_by_keyword",
            "searchType": "adv",
            "keyword": keyword,
            "location": "India",
            "experience": "10",  # 10+ years
            "salary": "1000000",  # 10 LPA minimum
            "pageNo": "1",
        }

        try:
            data = await self.fetch(
                self.API_URL,
                params=params,
                json_response=True,
                extra_headers=self.API_HEADERS,
            )
            if not data:
                return []
            return self._parse_api_response(data)
        except Exception as e:
            logger.warning(f"Naukri API error for '{keyword}': {e}")
            # Fallback to HTML scraping
            return await self._scrape_html(keyword)

    def _parse_api_response(self, data: Dict[str, Any]) -> List[JobCreate]:
        """Parse Naukri JSON API response."""
        jobs = []
        job_details = data.get("jobDetails", []) or data.get("jobs", [])

        for item in job_details:
            try:
                title = item.get("title") or item.get("jobTitle", "")
                company = (
                    item.get("companyName")
                    or item.get("company", {}).get("label", "")
                )
                location_list = item.get("placeholders", [])
                location = None
                salary_text = ""

                for ph in location_list:
                    if ph.get("type") == "location":
                        location = ph.get("label")
                    if ph.get("type") == "salary":
                        salary_text = ph.get("label", "")

                experience_text = ""
                for ph in location_list:
                    if ph.get("type") == "experience":
                        experience_text = ph.get("label", "")

                job_id = str(item.get("jobId", "") or item.get("id", ""))
                source_url = item.get("jdURL") or (
                    f"https://www.naukri.com/job-listings-{job_id}" if job_id else None
                )

                posted_raw = item.get("createdDate") or item.get("modifiedDate")
                posted_date = None
                if posted_raw:
                    try:
                        # Naukri uses epoch milliseconds
                        if isinstance(posted_raw, (int, float)):
                            posted_date = datetime.fromtimestamp(posted_raw / 1000, tz=timezone.utc)
                        else:
                            posted_date = datetime.fromisoformat(str(posted_raw))
                    except Exception:
                        pass

                description = item.get("jobDescription", "")
                tags = item.get("tagsAndSkills", "")
                if isinstance(tags, str):
                    tags = [t.strip() for t in tags.split(",") if t.strip()]

                remote_type = None
                combined_text = f"{title} {location or ''} {description}".lower()
                if "remote" in combined_text:
                    remote_type = "remote"
                elif "hybrid" in combined_text:
                    remote_type = "hybrid"

                if not title or not company:
                    continue

                sal_min, sal_max, currency = self.normalize_salary(salary_text)
                job = JobCreate(
                    title=title,
                    company=company,
                    description=description,
                    location=location,
                    salary_min=sal_min,
                    salary_max=sal_max,
                    salary_currency=currency,
                    remote_type=remote_type,
                    source_platform=self.SOURCE_NAME,
                    source_url=source_url,
                    external_job_id=job_id or None,
                    posted_date=posted_date,
                    seniority_level=self.normalize_seniority(title, description),
                    job_type="full-time",
                    industry=item.get("industryName"),
                    department=item.get("functionalAreaName"),
                    tags=tags if isinstance(tags, list) else [],
                    raw_data={"source": "naukri_api"},
                )
                jobs.append(job)
            except Exception as e:
                logger.debug(f"Naukri parse error: {e}")

        return jobs

    async def _scrape_html(self, keyword: str) -> List[JobCreate]:
        """Fallback HTML scraper for Naukri."""
        url = f"{self.BASE_URL}/{'-'.join(keyword.lower().split())}-jobs"
        try:
            html = await self.fetch(url)
            if not html:
                return []

            soup = self.parse_html(html)
            jobs = []

            job_cards = soup.find_all("article", class_=re.compile(r"jobTuple|job-card"))
            for card in job_cards[:15]:
                try:
                    title_el = card.find("a", class_=re.compile(r"title"))
                    title = title_el.get_text(strip=True) if title_el else None

                    company_el = card.find(class_=re.compile(r"companyInfo|company"))
                    company = company_el.get_text(strip=True) if company_el else None

                    loc_el = card.find(class_=re.compile(r"location|loc"))
                    location = loc_el.get_text(strip=True) if loc_el else None

                    link = card.find("a", href=re.compile(r"naukri.com"))
                    source_url = link.get("href") if link else None

                    if title and company:
                        job = self.normalize_job({
                            "title": title,
                            "company": company,
                            "location": location,
                            "source_url": source_url,
                        })
                        if job:
                            jobs.append(job)
                except Exception:
                    pass

            return jobs
        except Exception as e:
            logger.warning(f"Naukri HTML fallback failed for '{keyword}': {e}")
            return []
