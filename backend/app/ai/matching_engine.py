import asyncio
import re
from typing import List, Optional, Dict, Any, Tuple
import numpy as np
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update

from app.ai.profile import CANDIDATE_PROFILE
from app.core.config import settings
from app.core.logging_config import logger


class MatchingEngine:
    """
    GovIntel AI opportunity scoring engine.

    Weighted scoring model (0-100):
      - Leadership Match       25%
      - Government Consulting  20%
      - Domain Match           15%
      - Multilateral Match     15%
      - Procurement Match      10%
      - Technology Match        5%
      - Compensation Match       5%
      - Location Match           5%

    Also derives win_probability, strategic_value, revenue_potential,
    and career_impact for every scored opportunity.
    """

    WEIGHTS = {
        "leadership": 25.0,
        "government_consulting": 20.0,
        "domain": 15.0,
        "multilateral": 15.0,
        "procurement": 10.0,
        "technology": 5.0,
        "compensation": 5.0,
        "location": 5.0,
    }

    def __init__(self):
        self.profile = CANDIDATE_PROFILE
        self.high_priority_keywords = [kw.lower() for kw in CANDIDATE_PROFILE["keywords_high_priority"]]
        self.medium_priority_keywords = [kw.lower() for kw in CANDIDATE_PROFILE["keywords_medium_priority"]]
        self.negative_keywords = [kw.lower() for kw in CANDIDATE_PROFILE["keywords_negative"]]
        self.leadership_titles = [t.lower() for t in CANDIDATE_PROFILE["target_leadership_titles"]]
        self.preferred_employers = [e.lower() for e in CANDIDATE_PROFILE["preferred_employers"]]
        self.sector_weights = CANDIDATE_PROFILE["sector_weights"]
        self.multilateral_orgs = [m.lower() for m in CANDIDATE_PROFILE["multilateral_experience"]]
        self.ncr_locations = CANDIDATE_PROFILE["ncr_locations"]
        self.remote_priority_geos = CANDIDATE_PROFILE["remote_priority_geographies"]
        self._profile_embedding: Optional[List[float]] = None

    async def _get_profile_embedding(self) -> Optional[List[float]]:
        if self._profile_embedding is not None:
            return self._profile_embedding

        if not settings.AI_SCORING_ENABLED or not settings.OPENAI_API_KEY:
            return None

        from app.services.ai_service import AIService
        ai_service = AIService()
        profile_text = (
            f"{self.profile['summary']} "
            f"Skills: {', '.join(self.profile['core_competencies'][:15])}. "
            f"Domains: {', '.join(self.profile['domain_expertise'][:10])}. "
            f"Keywords: {', '.join(self.profile['keywords_high_priority'][:15])}."
        )
        try:
            self._profile_embedding = await ai_service.generate_embedding(profile_text)
        except Exception as e:
            logger.warning(f"Profile embedding generation failed: {e}")
            self._profile_embedding = None
        return self._profile_embedding

    # ------------------------------------------------------------------
    # Individual weighted components (each returns 0-1 fraction of its weight)
    # ------------------------------------------------------------------

    def leadership_match(self, job_text: str) -> Tuple[float, str]:
        """25%: seniority/title alignment with VP/Director/Partner/Practice Head level."""
        text = job_text.lower()

        if any(p in text for p in ["entry level", "0-2 years", "1-3 years", "fresher", "entry-level", "intern"]):
            return 0.0, "junior"

        if any(p in text for p in ["partner", "practice head", "practice lead"]):
            return 1.0, "partner/practice-head"
        if any(p in text for p in ["vice president", "vp ", " vp,", "vp-", "evp", "svp"]):
            return 0.95, "vp"
        if any(p in text for p in ["director", "associate partner"]):
            return 0.9, "director/associate-partner"
        if any(p in text for p in ["head of", "government consulting lead", "public sector lead",
                                    "digital transformation lead", "advisory lead"]):
            return 0.85, "practice-lead"
        if any(p in text for p in ["principal consultant", "senior manager", "engagement manager"]):
            return 0.6, "senior-manager"
        if any(p in text for p in ["consultant", "manager"]):
            return 0.4, "manager"

        exp_match = re.search(r"(\d+)\+?\s*(?:to|-)\s*(\d+)?\s*years", text)
        if exp_match:
            min_exp = int(exp_match.group(1))
            if min_exp >= 15:
                return 0.85, "experience-15+"
            if min_exp >= 12:
                return 0.6, "experience-12+"
            if min_exp < 8:
                return 0.1, "too-junior"

        return 0.35, "unspecified"

    def government_consulting_match(self, job_text: str) -> Tuple[float, List[str]]:
        """20%: government/public-sector consulting relevance."""
        text = job_text.lower()
        patterns = [
            "government consulting", "public sector advisory", "public sector",
            "government advisory", "state government", "central government",
            "ministry", "meity", "e-governance", "smart governance", "gem portal",
            "public procurement", "civil service", "public administration",
        ]
        hits = [p for p in patterns if p in text]
        score = min(1.0, len(hits) * 0.28)
        return score, hits[:5]

    def domain_match(self, job_text: str) -> Tuple[float, str]:
        """15%: sector/domain relevance (digital health, public finance, infra, etc.)."""
        text = job_text.lower()

        sector_patterns = {
            "digital_health": ["digital health", "hmis", "health information", "ehr", "public health"],
            "public_finance": ["public finance", "financial management", "pfm", "treasury"],
            "infrastructure": ["infrastructure", "urban development", "roads", "transport"],
            "smart_governance": ["smart governance", "citizen services", "digital public infrastructure", "e-governance"],
            "power_sector": ["power sector", "power distribution", "energy", "electricity"],
            "policing": ["policing", "police modernization", "law enforcement"],
            "postal_modernization": ["postal", "post office modernization"],
            "digital_transformation": ["digital transformation", "digitization", "digitalization"],
            "development_sector": ["development sector", "donor", "multilateral", "oda"],
            "it_consulting": ["it consulting", "technology consulting", "tech advisory"],
        }

        best_sector = "private_sector_generic"
        best_weight = 0.3
        matched_terms = []
        for sector, patterns in sector_patterns.items():
            hits = [p for p in patterns if p in text]
            if hits:
                weight = self.sector_weights.get(sector, 0.5)
                if weight > best_weight:
                    best_sector = sector
                    best_weight = weight
                    matched_terms = hits

        return best_weight, best_sector

    def multilateral_match(self, job_text: str) -> Tuple[float, List[str]]:
        """15%: World Bank / ADB / JICA / AIIB and other multilateral exposure."""
        text = job_text.lower()
        all_multilaterals = self.multilateral_orgs + ["undp", "unicef", "who", "giz", "fcdo", "usaid", "un ", "united nations"]
        hits = [m for m in all_multilaterals if m in text]
        if not hits:
            return 0.0, []
        # Direct hit on core 4 orgs (WB/ADB/JICA/AIIB) scores highest
        core_hits = [h for h in hits if h in self.multilateral_orgs]
        score = 1.0 if core_hits else min(1.0, len(hits) * 0.5)
        return score, hits[:5]

    def procurement_match(self, job_text: str) -> Tuple[float, List[str]]:
        """10%: procurement/bid/DPR/RFP/technical evaluation relevance."""
        text = job_text.lower()
        patterns = [
            "procurement", "bid management", "dpr", "rfp", "technical evaluation",
            "vendor management", "tender", "proposal management", "contract management",
        ]
        hits = [p for p in patterns if p in text]
        score = min(1.0, len(hits) * 0.3)
        return score, hits[:5]

    def technology_match(self, job_text: str) -> float:
        """5%: technology/AI governance relevance."""
        text = job_text.lower()
        patterns = ["ai governance", "artificial intelligence", "digital public infrastructure",
                    "erp", "sap", "cloud", "data governance", "technology strategy"]
        hits = sum(1 for p in patterns if p in text)
        return min(1.0, hits * 0.35)

    def compensation_match(self, job_text: str, opportunity_value_inr: Optional[float] = None) -> float:
        """5%: compensation fit against salary/rate expectations."""
        if opportunity_value_inr is not None:
            min_expect = self.profile["salary_expectation_inr_lpa"]["min"] * 100_000
            if opportunity_value_inr >= min_expect:
                return 1.0
            return max(0.2, opportunity_value_inr / min_expect)

        text = job_text.lower()
        lpa_match = re.search(r"(\d+)\s*(?:to|-)?\s*(\d+)?\s*lpa", text)
        if lpa_match:
            low = int(lpa_match.group(1))
            if low >= self.profile["salary_expectation_inr_lpa"]["min"]:
                return 1.0
            return max(0.2, low / self.profile["salary_expectation_inr_lpa"]["min"])
        return 0.5  # unspecified — neutral

    def location_match(self, job_text: str, location: str = "", opportunity_type: str = "full_time") -> float:
        """5%: location fit — strict NCR for full-time, global priority geos for remote."""
        loc_text = (location or job_text).lower()

        if opportunity_type == "full_time":
            return 1.0 if any(ncr in loc_text for ncr in self.ncr_locations) else 0.0
        if opportunity_type == "remote":
            if any(geo in loc_text for geo in self.remote_priority_geos):
                return 1.0
            return 0.6  # remote-anywhere still acceptable, just not priority geography
        return 0.7  # freelance — location largely irrelevant

    # ------------------------------------------------------------------
    # Derived business metrics
    # ------------------------------------------------------------------

    def _win_probability(self, score: float, leadership_level: str, has_negative: bool) -> float:
        if has_negative:
            return round(min(15.0, score * 0.3), 1)
        base = score * 0.75
        if leadership_level in ("partner/practice-head", "vp", "director/associate-partner"):
            base += 8
        return round(min(95.0, max(5.0, base)), 1)

    def _strategic_value(self, multilateral_hits: List[str], govt_hits: List[str], sector: str) -> str:
        if multilateral_hits and govt_hits:
            return "Very High"
        if multilateral_hits or (govt_hits and len(govt_hits) >= 2):
            return "High"
        if govt_hits or sector != "private_sector_generic":
            return "Medium"
        return "Low"

    def _revenue_potential(self, opportunity_value_inr: Optional[float], opportunity_type: str) -> str:
        if opportunity_value_inr:
            if opportunity_value_inr >= 2_500_000:
                return "Very High (>=25L)"
            if opportunity_value_inr >= 1_000_000:
                return "High (10L-25L)"
            if opportunity_value_inr >= 100_000:
                return "Moderate (1L-10L)"
            return "Low (<1L)"
        return "Unquantified" if opportunity_type != "full_time" else "Salary-based"

    def _career_impact(self, leadership_score: float, strategic_value: str) -> str:
        if leadership_score >= 0.85 and strategic_value in ("High", "Very High"):
            return "Transformational"
        if leadership_score >= 0.6:
            return "Significant"
        return "Incremental"

    # ------------------------------------------------------------------
    # Main scoring entry point
    # ------------------------------------------------------------------

    async def score_job_fit(self, job: Any) -> Dict[str, Any]:
        """Compute a 0-100 GovIntel match score with full breakdown and derived metrics."""
        title = getattr(job, "title", "") or ""
        company = getattr(job, "company", "") or ""
        description = getattr(job, "description", "") or ""
        requirements = getattr(job, "requirements", "") or ""
        location = getattr(job, "location", "") or ""
        job_type_raw = (getattr(job, "job_type", "") or "").lower()
        opportunity_type = "remote" if "remote" in (getattr(job, "remote_type", "") or "").lower() else (
            "freelance" if any(k in job_type_raw for k in ("freelance", "contract", "consulting assignment")) else "full_time"
        )
        opportunity_value = getattr(job, "salary_max", None) or getattr(job, "salary_min", None)

        job_text = f"{title} {company} {description} {requirements} {location}"

        leadership_score, leadership_level = self.leadership_match(job_text)
        govt_score, govt_hits = self.government_consulting_match(job_text)
        domain_score, matched_sector = self.domain_match(job_text)
        multilateral_score, multilateral_hits = self.multilateral_match(job_text)
        procurement_score, procurement_hits = self.procurement_match(job_text)
        tech_score = self.technology_match(job_text)
        comp_score = self.compensation_match(job_text, opportunity_value)
        loc_score = self.location_match(job_text, location, opportunity_type)

        weighted = {
            "leadership_match": round(leadership_score * self.WEIGHTS["leadership"], 1),
            "government_consulting_match": round(govt_score * self.WEIGHTS["government_consulting"], 1),
            "domain_match": round(domain_score * self.WEIGHTS["domain"], 1),
            "multilateral_match": round(multilateral_score * self.WEIGHTS["multilateral"], 1),
            "procurement_match": round(procurement_score * self.WEIGHTS["procurement"], 1),
            "technology_match": round(tech_score * self.WEIGHTS["technology"], 1),
            "compensation_match": round(comp_score * self.WEIGHTS["compensation"], 1),
            "location_match": round(loc_score * self.WEIGHTS["location"], 1),
        }

        total = sum(weighted.values())

        neg_hits = [kw for kw in self.negative_keywords if kw in job_text.lower()]
        if neg_hits:
            total = min(total, 25.0)

        # Full-time roles that fail the strict NCR filter are hard-capped —
        # they should not surface as recommended opportunities.
        if opportunity_type == "full_time" and settings.STRICT_NCR_FILTER_FULL_TIME and loc_score == 0.0:
            total = min(total, 20.0)

        final_score = round(min(100.0, max(0.0, total)), 1)

        strategic_value = self._strategic_value(multilateral_hits, govt_hits, matched_sector)
        is_leadership_position = leadership_level in ("partner/practice-head", "vp", "director/associate-partner", "practice-lead")

        return {
            "score": final_score,
            "breakdown": weighted,
            "weights_used": self.WEIGHTS,
            "opportunity_type": opportunity_type,
            "matched_sector": matched_sector,
            "leadership_level": leadership_level,
            "is_leadership_position": is_leadership_position,
            "government_consulting_signals": govt_hits,
            "multilateral_signals": multilateral_hits,
            "procurement_signals": procurement_hits,
            "negative_flags": neg_hits[:3],
            "win_probability": self._win_probability(final_score, leadership_level, bool(neg_hits)),
            "strategic_value": strategic_value,
            "revenue_potential": self._revenue_potential(opportunity_value, opportunity_type),
            "career_impact": self._career_impact(leadership_score, strategic_value),
            "ncr_compliant": loc_score > 0.0 if opportunity_type == "full_time" else None,
        }

    async def batch_rank_jobs(
        self,
        jobs: List[Any],
        db: Optional[AsyncSession] = None,
    ) -> List[Dict[str, Any]]:
        """Score and rank all opportunities, optionally persisting scores to DB."""
        from app.services.ai_service import AIService
        ai_service = AIService()

        embed_semaphore = asyncio.Semaphore(3)

        async def ensure_embedding(job):
            async with embed_semaphore:
                if getattr(job, "embedding", None) is None and settings.AI_SCORING_ENABLED:
                    try:
                        embedding = await ai_service.generate_job_embedding(job)
                        if embedding and db:
                            await db.execute(
                                update(__import__("app.models.job", fromlist=["Job"]).Job)
                                .where(__import__("app.models.job", fromlist=["Job"]).Job.id == job.id)
                                .values(embedding=embedding)
                            )
                            job.embedding = embedding
                    except Exception as e:
                        logger.debug(f"Embedding failed for job {job.id}: {e}")

        embed_tasks = [ensure_embedding(job) for job in jobs]
        await asyncio.gather(*embed_tasks, return_exceptions=True)

        score_semaphore = asyncio.Semaphore(5)

        async def score_with_semaphore(job):
            async with score_semaphore:
                result = await self.score_job_fit(job)
                result["job_id"] = job.id
                result["title"] = getattr(job, "title", "")

                try:
                    result["qualification"] = await ai_service.generate_qualification_dossier(job, result)
                except Exception as e:
                    logger.debug(f"Qualification dossier generation skipped for job {job.id}: {e}")

                if db:
                    try:
                        from app.models.job import Job
                        qualification = result.get("qualification", {})
                        await db.execute(
                            update(Job)
                            .where(Job.id == job.id)
                            .values(
                                match_score=result["score"],
                                score_breakdown=result,
                                why_relevant=qualification.get("why_matches"),
                                missing_skills=qualification.get("missing_skills"),
                            )
                        )
                    except Exception as e:
                        logger.error(f"Failed to persist score for job {job.id}: {e}")
                return result

        tasks = [score_with_semaphore(job) for job in jobs]
        results = await asyncio.gather(*tasks, return_exceptions=False)

        results.sort(key=lambda x: x.get("score", 0), reverse=True)
        logger.info(f"Batch scored {len(results)} opportunities. Top score: {results[0]['score'] if results else 0}")
        return results
