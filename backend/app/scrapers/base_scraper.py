import asyncio
import hashlib
import random
import time
from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any, Tuple
from urllib.parse import urlparse, urljoin, robots
from urllib.robotparser import RobotFileParser

import httpx
from bs4 import BeautifulSoup
from fake_useragent import UserAgent
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    before_sleep_log,
)
import logging

from app.core.config import settings
from app.core.logging_config import logger
from app.services.job_service import JobCreate


class RobotsCache:
    """Simple in-memory cache for robots.txt parsers."""
    _cache: Dict[str, Tuple[RobotFileParser, float]] = {}
    _ttl: int = 3600  # 1 hour

    @classmethod
    async def can_fetch(cls, url: str, user_agent: str = "*") -> bool:
        """Check if URL is allowed by robots.txt."""
        parsed = urlparse(url)
        base = f"{parsed.scheme}://{parsed.netloc}"
        now = time.time()

        if base in cls._cache:
            parser, cached_at = cls._cache[base]
            if now - cached_at < cls._ttl:
                return parser.can_fetch(user_agent, url)

        robots_url = f"{base}/robots.txt"
        parser = RobotFileParser(robots_url)
        try:
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, parser.read)
            cls._cache[base] = (parser, now)
            return parser.can_fetch(user_agent, url)
        except Exception:
            return True  # Allow on error


class BaseScraper(ABC):
    """
    Abstract base class for all job scrapers.
    Provides: rate limiting, retry logic, user-agent rotation,
    robots.txt compliance, and result normalization.
    """

    SOURCE_NAME: str = "base"
    BASE_URL: str = ""
    SEARCH_KEYWORDS: List[str] = [
        "Digital Transformation Director",
        "PMO Lead",
        "Government Consulting",
        "E-Governance",
        "Health Systems",
        "Program Director",
        "Public Health IT",
        "Development Sector Consulting",
    ]
    RESPECT_ROBOTS: bool = True
    DEFAULT_DELAY: float = settings.SCRAPING_RATE_LIMIT_DELAY

    def __init__(self):
        self.ua = UserAgent()
        self._last_request_time: float = 0.0
        self._request_count: int = 0

    def get_headers(self) -> Dict[str, str]:
        """Rotate User-Agent and set anti-detection headers."""
        if settings.USER_AGENT_ROTATION:
            user_agent = self.ua.random
        else:
            user_agent = (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            )
        return {
            "User-Agent": user_agent,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "DNT": "1",
            "Upgrade-Insecure-Requests": "1",
            "Cache-Control": "no-cache",
        }

    async def _rate_limit(self):
        """Enforce rate limiting between requests."""
        now = time.monotonic()
        elapsed = now - self._last_request_time
        min_delay = self.DEFAULT_DELAY + random.uniform(0.5, 1.5)
        if elapsed < min_delay:
            await asyncio.sleep(min_delay - elapsed)
        self._last_request_time = time.monotonic()
        self._request_count += 1

    @retry(
        stop=stop_after_attempt(settings.SCRAPING_MAX_RETRIES),
        wait=wait_exponential(multiplier=2, min=3, max=30),
        retry=retry_if_exception_type(
            (httpx.HTTPStatusError, httpx.ConnectError, httpx.TimeoutException)
        ),
    )
    async def fetch(
        self,
        url: str,
        params: Optional[Dict[str, Any]] = None,
        json_response: bool = False,
        extra_headers: Optional[Dict[str, str]] = None,
    ) -> Any:
        """Fetch a URL with rate limiting, retry, and robots.txt check."""
        if self.RESPECT_ROBOTS:
            allowed = await RobotsCache.can_fetch(url)
            if not allowed:
                logger.warning(f"Robots.txt disallows: {url}")
                return None

        await self._rate_limit()

        headers = self.get_headers()
        if extra_headers:
            headers.update(extra_headers)

        async with httpx.AsyncClient(
            timeout=settings.SCRAPING_TIMEOUT,
            follow_redirects=True,
            verify=False,
        ) as client:
            response = await client.get(url, params=params, headers=headers)
            response.raise_for_status()

            if json_response:
                return response.json()
            return response.text

    def parse_html(self, html: str) -> BeautifulSoup:
        return BeautifulSoup(html, "lxml")

    def normalize_remote_type(self, text: str) -> Optional[str]:
        """Normalize remote type strings."""
        if not text:
            return None
        t = text.lower()
        if any(w in t for w in ["remote", "work from home", "wfh", "fully remote"]):
            return "remote"
        if any(w in t for w in ["hybrid"]):
            return "hybrid"
        if any(w in t for w in ["onsite", "on-site", "in office", "in-office", "office"]):
            return "onsite"
        return None

    def normalize_salary(self, text: str) -> Tuple[Optional[float], Optional[float], str]:
        """Parse salary text to (min, max, currency)."""
        if not text:
            return None, None, "INR"
        import re
        # Clean
        text = text.replace(",", "").replace("₹", "").replace("$", "").strip()
        # Find ranges
        range_match = re.search(r"(\d+(?:\.\d+)?)\s*[-–to]+\s*(\d+(?:\.\d+)?)", text)
        if range_match:
            low = float(range_match.group(1))
            high = float(range_match.group(2))
            # Detect LPA (in lakhs)
            if "lpa" in text.lower() or "lakh" in text.lower():
                low *= 100000
                high *= 100000
            return low, high, "INR"
        single_match = re.search(r"(\d+(?:\.\d+)?)", text)
        if single_match:
            val = float(single_match.group(1))
            if "lpa" in text.lower():
                val *= 100000
            return val, val, "INR"
        return None, None, "INR"

    def normalize_seniority(self, title: str, description: str = "") -> Optional[str]:
        """Infer seniority level from job title."""
        if not title:
            return None
        combined = (title + " " + description).lower()
        if any(w in combined for w in ["chief", "cto", "cxo", "vice president", "vp ", "evp", "svp"]):
            return "executive"
        if any(w in combined for w in ["director", "head of", "gm ", "general manager"]):
            return "director"
        if any(w in combined for w in ["lead", "principal", "senior manager", "sr. manager"]):
            return "lead"
        if any(w in combined for w in ["senior", "sr ", "sr.", "specialist"]):
            return "senior"
        if any(w in combined for w in ["manager", "consultant"]):
            return "mid"
        if any(w in combined for w in ["junior", "associate", "assistant", "fresher", "trainee"]):
            return "junior"
        return "senior"  # default assumption for ambiguous postings

    def normalize_job(self, raw: Dict[str, Any]) -> Optional[JobCreate]:
        """
        Subclasses should call this with a dict of raw scraped data.
        Returns a normalized JobCreate Pydantic model or None if invalid.
        """
        title = raw.get("title", "").strip()
        company = raw.get("company", "").strip()
        if not title or not company:
            return None

        description = raw.get("description", "")
        salary_text = raw.get("salary_text", "")
        sal_min, sal_max, currency = self.normalize_salary(salary_text)

        return JobCreate(
            title=title,
            company=company,
            description=description,
            requirements=raw.get("requirements"),
            location=raw.get("location"),
            remote_type=self.normalize_remote_type(raw.get("remote_type", "") or description),
            salary_min=sal_min,
            salary_max=sal_max,
            salary_currency=currency,
            source_platform=self.SOURCE_NAME,
            source_url=raw.get("source_url"),
            external_job_id=raw.get("external_job_id"),
            recruiter_name=raw.get("recruiter_name"),
            recruiter_linkedin=raw.get("recruiter_linkedin"),
            recruiter_email=raw.get("recruiter_email"),
            posted_date=raw.get("posted_date"),
            job_type=raw.get("job_type", "full-time"),
            seniority_level=self.normalize_seniority(title, description),
            industry=raw.get("industry"),
            department=raw.get("department"),
            tags=raw.get("tags", []),
            raw_data=raw,
        )

    @abstractmethod
    async def scrape(self) -> List[JobCreate]:
        """
        Main scraping method. Must be implemented by subclasses.
        Returns a list of normalized JobCreate objects.
        """
        raise NotImplementedError

    async def run(self) -> List[JobCreate]:
        """Entry point — wraps scrape() with logging and error handling."""
        logger.info(f"Starting scraper: {self.SOURCE_NAME}")
        start = time.monotonic()
        try:
            jobs = await self.scrape()
            elapsed = time.monotonic() - start
            logger.info(
                f"Scraper {self.SOURCE_NAME} completed: {len(jobs)} jobs in {elapsed:.1f}s"
            )
            return jobs
        except Exception as e:
            logger.error(f"Scraper {self.SOURCE_NAME} failed: {e}", exc_info=True)
            return []
