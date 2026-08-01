"""
Connectors for expert networks referenced in the GovIntel sourcing spec:
GLG, Guidepoint, AlphaSights, Third Bridge, Coleman Research.

These networks route paid consultations/advisory engagements through
project-specific invitations rather than an open job board, and integrating
with them requires an expert/partner-portal API agreement. Each connector is
config-gated the same way as app/scrapers/consulting_marketplace_scraper.py —
inactive (returns no results, logs why) until its API key is supplied, so the
discovery agent keeps running cleanly with these sources simply contributing
zero opportunities until real access is wired up.
"""
from typing import List

from app.scrapers.consulting_marketplace_scraper import _PartnerAPIConsultingScraper


class GLGScraper(_PartnerAPIConsultingScraper):
    SOURCE_NAME = "glg"
    API_KEY_SETTING = "GLG_API_KEY"
    PLATFORM_LABEL = "GLG"


class GuidepointScraper(_PartnerAPIConsultingScraper):
    SOURCE_NAME = "guidepoint"
    API_KEY_SETTING = "GUIDEPOINT_API_KEY"
    PLATFORM_LABEL = "Guidepoint"


class AlphaSightsScraper(_PartnerAPIConsultingScraper):
    SOURCE_NAME = "alphasights"
    API_KEY_SETTING = "ALPHASIGHTS_API_KEY"
    PLATFORM_LABEL = "AlphaSights"


class ThirdBridgeScraper(_PartnerAPIConsultingScraper):
    SOURCE_NAME = "thirdbridge"
    API_KEY_SETTING = "THIRDBRIDGE_API_KEY"
    PLATFORM_LABEL = "Third Bridge"


class ColemanResearchScraper(_PartnerAPIConsultingScraper):
    SOURCE_NAME = "coleman"
    API_KEY_SETTING = "COLEMAN_API_KEY"
    PLATFORM_LABEL = "Coleman Research"
