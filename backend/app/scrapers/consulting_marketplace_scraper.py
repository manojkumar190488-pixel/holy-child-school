"""
Connectors for premium consulting marketplaces referenced in the GovIntel
sourcing spec: Catalant, Comatch, Talmix, Expert360, Malt, Business Talent
Group (BTG).

None of these platforms expose open/public job-board style listings — access
to live assignments requires a partner or enterprise API agreement with each
platform. Each connector below is wired to its config-driven API key
(app/core/config.py) and stays a documented no-op until that key is supplied,
rather than attempting to scrape an authenticated member area (which would
violate each platform's terms of service). Once a partner key is available,
implement `_fetch_assignments()` against that platform's documented API and
the rest of the pipeline (normalization, scoring, alerting) works unchanged.
"""
from typing import List, Optional

from app.scrapers.base_scraper import BaseScraper
from app.services.job_service import JobCreate
from app.core.config import settings
from app.core.logging_config import logger


class _PartnerAPIConsultingScraper(BaseScraper):
    """Base class for consulting marketplaces gated behind a partner API key."""

    API_KEY_SETTING: str = ""
    PLATFORM_LABEL: str = ""
    RESPECT_ROBOTS = True

    async def scrape(self) -> List[JobCreate]:
        api_key = getattr(settings, self.API_KEY_SETTING, "")
        if not api_key:
            logger.info(
                f"{self.PLATFORM_LABEL} connector inactive — set {self.API_KEY_SETTING} "
                f"once a partner/enterprise API agreement is in place."
            )
            return []
        try:
            return await self._fetch_assignments(api_key)
        except Exception as e:
            logger.warning(f"{self.PLATFORM_LABEL} assignment fetch failed: {e}")
            return []

    async def _fetch_assignments(self, api_key: str) -> List[JobCreate]:
        """Override once partner API access and documentation are available."""
        return []


class CatalantScraper(_PartnerAPIConsultingScraper):
    SOURCE_NAME = "catalant"
    API_KEY_SETTING = "CATALANT_API_KEY"
    PLATFORM_LABEL = "Catalant"


class ComatchScraper(_PartnerAPIConsultingScraper):
    SOURCE_NAME = "comatch"
    API_KEY_SETTING = "COMATCH_API_KEY"
    PLATFORM_LABEL = "Comatch"


class TalmixScraper(_PartnerAPIConsultingScraper):
    SOURCE_NAME = "talmix"
    API_KEY_SETTING = "TALMIX_API_KEY"
    PLATFORM_LABEL = "Talmix"


class Expert360Scraper(_PartnerAPIConsultingScraper):
    SOURCE_NAME = "expert360"
    API_KEY_SETTING = "EXPERT360_API_KEY"
    PLATFORM_LABEL = "Expert360"


class MaltScraper(_PartnerAPIConsultingScraper):
    SOURCE_NAME = "malt"
    API_KEY_SETTING = "MALT_API_KEY"
    PLATFORM_LABEL = "Malt"


class BusinessTalentGroupScraper(_PartnerAPIConsultingScraper):
    SOURCE_NAME = "btg"
    API_KEY_SETTING = "BTG_API_KEY"
    PLATFORM_LABEL = "Business Talent Group"
