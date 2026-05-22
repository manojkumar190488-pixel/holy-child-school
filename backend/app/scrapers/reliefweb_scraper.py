import asyncio
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

from app.scrapers.base_scraper import BaseScraper
from app.services.job_service import JobCreate
from app.core.logging_config import logger


class ReliefWebScraper(BaseScraper):
    """
    ReliefWeb API scraper for humanitarian, development and consulting jobs.
    Uses the official ReliefWeb public REST API: https://api.reliefweb.int/v1/jobs
    """

    SOURCE_NAME = "reliefweb"
    BASE_URL = "https://api.reliefweb.int"
    API_URL = "https://api.reliefweb.int/v1/jobs"
    RESPECT_ROBOTS = False  # API doesn't need robots checking
    DEFAULT_DELAY = 1.5

    SEARCH_QUERIES = [
        "digital transformation",
        "program director",
        "e-governance",
        "health systems",
        "public health consultant",
        "monitoring evaluation",
        "technology consultant",
        "project management",
    ]

    async def scrape(self) -> List[JobCreate]:
        """Fetch jobs from ReliefWeb API."""
        all_jobs: List[JobCreate] = []
        seen_ids: set = set()

        for query in self.SEARCH_QUERIES[:5]:
            try:
                jobs = await self._fetch_jobs(query)
                for job in jobs:
                    uid = job.external_job_id or f"{job.title}|{job.company}"
                    if uid not in seen_ids:
                        seen_ids.add(uid)
                        all_jobs.append(job)
                await asyncio.sleep(1)
            except Exception as e:
                logger.warning(f"ReliefWeb query '{query}' failed: {e}")

        return all_jobs

    async def _fetch_jobs(self, query: str) -> List[JobCreate]:
        """Query ReliefWeb API for jobs matching a search term."""
        payload = {
            "query": {
                "value": query,
                "operator": "AND",
            },
            "filter": {
                "operator": "AND",
                "conditions": [
                    {
                        "field": "career_categories.name",
                        "value": [
                            "Information and Communications Technology",
                            "Program/Project Management",
                            "Health",
                            "Donor Relations/Grants Management",
                        ],
                        "operator": "OR",
                    }
                ],
            },
            "sort": [{"field": "date.created", "order": "desc"}],
            "fields": {
                "include": [
                    "id",
                    "title",
                    "body",
                    "status",
                    "date",
                    "source",
                    "country",
                    "city",
                    "career_categories",
                    "type",
                    "experience",
                    "url",
                    "job_closing_date",
                ]
            },
            "limit": 20,
            "offset": 0,
        }

        try:
            data = await self.fetch(
                self.API_URL,
                json_response=True,
                extra_headers={
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
            )

            # ReliefWeb API requires POST, but our fetch() uses GET
            # Use httpx directly for POST
            import httpx
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(
                    self.API_URL,
                    json=payload,
                    params={"appname": "job-intelligence-agent", "profile": "full"},
                    headers={
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "User-Agent": "JobIntelligenceAgent/1.0",
                    },
                )
                response.raise_for_status()
                data = response.json()

            return self._parse_api_response(data)
        except Exception as e:
            logger.warning(f"ReliefWeb API error for query '{query}': {e}")
            return []

    def _parse_api_response(self, data: Dict[str, Any]) -> List[JobCreate]:
        """Parse ReliefWeb API response."""
        jobs = []
        items = data.get("data", [])

        for item in items:
            try:
                fields = item.get("fields", {})
                job_id = str(item.get("id", ""))

                title = fields.get("title", "")

                # Source organization
                sources = fields.get("source", [])
                company = sources[0].get("name", "International Organization") if sources else "International Organization"

                # Location
                countries = fields.get("country", [])
                cities = fields.get("city", [])
                country_names = [c.get("name", "") for c in countries]
                city_names = [c.get("name", "") for c in cities]
                location_parts = city_names[:1] + country_names[:1]
                location = ", ".join(p for p in location_parts if p) or None

                # Description
                description = fields.get("body", "")
                if isinstance(description, dict):
                    description = description.get("value", "")

                # Dates
                date_info = fields.get("date", {})
                created_str = date_info.get("created") or date_info.get("posted")
                posted_date = None
                if created_str:
                    try:
                        posted_date = datetime.fromisoformat(
                            created_str.replace("Z", "+00:00")
                        )
                    except Exception:
                        pass

                # Career category
                career_cats = fields.get("career_categories", [])
                industry = career_cats[0].get("name") if career_cats else "International Development"

                # Job type
                job_type_info = fields.get("type", [])
                job_type = "contract"
                if job_type_info:
                    jt = job_type_info[0].get("name", "").lower()
                    if "permanent" in jt or "regular" in jt:
                        job_type = "full-time"
                    elif "consultant" in jt or "individual" in jt:
                        job_type = "contract"

                # URL
                url_info = fields.get("url")
                source_url = url_info if isinstance(url_info, str) else (
                    url_info.get("canonical") if isinstance(url_info, dict) else None
                )
                if not source_url and job_id:
                    source_url = f"https://reliefweb.int/job/{job_id}"

                if not title:
                    continue

                job = JobCreate(
                    title=title,
                    company=company,
                    description=description[:3000] if description else None,
                    location=location,
                    source_platform=self.SOURCE_NAME,
                    source_url=source_url,
                    external_job_id=job_id or None,
                    posted_date=posted_date,
                    seniority_level=self.normalize_seniority(title, description or ""),
                    job_type=job_type,
                    industry=industry,
                    remote_type="remote" if "remote" in (description or "").lower() else None,
                    raw_data={"source": "reliefweb_api", "career_categories": [c.get("name") for c in career_cats]},
                )
                jobs.append(job)

            except Exception as e:
                logger.debug(f"ReliefWeb parse error: {e}")

        return jobs
