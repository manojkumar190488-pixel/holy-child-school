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
    Complete matching engine for scoring job fit against the candidate profile.
    Combines keyword relevance, semantic similarity, seniority alignment,
    and sector relevance into a final weighted score.
    """

    def __init__(self):
        self.profile = CANDIDATE_PROFILE
        self.high_priority_keywords = [kw.lower() for kw in CANDIDATE_PROFILE["keywords_high_priority"]]
        self.medium_priority_keywords = [kw.lower() for kw in CANDIDATE_PROFILE["keywords_medium_priority"]]
        self.negative_keywords = [kw.lower() for kw in CANDIDATE_PROFILE["keywords_negative"]]
        self.preferred_roles = [r.lower() for r in CANDIDATE_PROFILE["preferred_roles"]]
        self.preferred_employers = [e.lower() for e in CANDIDATE_PROFILE["preferred_employers"]]
        self.sector_weights = CANDIDATE_PROFILE["sector_weights"]
        self._profile_embedding: Optional[List[float]] = None

    async def _get_profile_embedding(self) -> Optional[List[float]]:
        """Get (or generate) the embedding for the candidate profile."""
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

    def keyword_relevance_score(self, job_text: str) -> Tuple[float, Dict[str, Any]]:
        """
        Score based on keyword presence in job text.
        High priority: 3 points each, Medium: 1.5 points, Negative: -5 each.
        Max possible: capped at 25 points → normalized to 0-25.
        """
        text = job_text.lower()
        high_hits = [kw for kw in self.high_priority_keywords if kw in text]
        med_hits = [kw for kw in self.medium_priority_keywords if kw in text]
        neg_hits = [kw for kw in self.negative_keywords if kw in text]

        raw_score = (len(high_hits) * 3.0) + (len(med_hits) * 1.5) - (len(neg_hits) * 5.0)
        normalized = max(0.0, min(25.0, raw_score / 15.0 * 25.0))

        return normalized, {
            "high_priority_matches": high_hits[:5],
            "medium_priority_matches": med_hits[:5],
            "negative_matches": neg_hits,
            "raw_score": raw_score,
        }

    def seniority_alignment_score(
        self, job_text: str, years_experience: int = 14
    ) -> Tuple[float, str]:
        """
        Score 0-20 based on whether the role matches the candidate's seniority level.
        14+ years experience → should be senior/director/lead/VP level.
        """
        text = job_text.lower()

        # Hard negative: explicit junior / entry level
        if any(p in text for p in ["entry level", "0-2 years", "1-3 years", "freshers", "entry-level"]):
            return 0.0, "junior"

        # Executive / C-suite
        if any(p in text for p in ["cto", "chief", "vice president", "evp", "svp", "vp ", "c-suite"]):
            return 18.0, "executive"

        # Director level — ideal
        if any(p in text for p in ["director", "head of", "general manager", "gm "]):
            return 20.0, "director"

        # Lead / Principal — strong fit
        if any(p in text for p in ["lead ", "principal", "senior manager", "sr. manager", "sr manager"]):
            return 18.0, "lead"

        # Senior — good fit
        if any(p in text for p in ["senior", "sr.", " sr ", "specialist", "expert"]):
            return 16.0, "senior"

        # Manager / consultant — moderate
        if any(p in text for p in ["manager", "consultant", "associate director"]):
            return 14.0, "manager"

        # Experience requirements parsing
        exp_match = re.search(r"(\d+)\+?\s*(?:to|-)\s*(\d+)?\s*years", text)
        if exp_match:
            min_exp = int(exp_match.group(1))
            max_exp = int(exp_match.group(2) or min_exp + 5)
            if min_exp >= 10:
                return 18.0, "senior"
            if min_exp >= 7:
                return 14.0, "mid-senior"
            if min_exp < 5:
                return 5.0, "too-junior"

        return 12.0, "unspecified"  # Default moderate score for unclear seniority

    def sector_relevance_score(self, job_text: str) -> Tuple[float, str]:
        """
        Score 0-25 based on sector/domain relevance.
        Returns (score, matched_sector).
        """
        text = job_text.lower()

        sector_patterns = {
            "digital_transformation": [
                "digital transformation", "digitization", "digitalization",
                "e-governance", "digital india", "digital public infrastructure"
            ],
            "e_governance": [
                "e-governance", "egovernance", "egov", "government digital", "smart governance",
                "citizen services", "public administration digital"
            ],
            "public_health": [
                "public health", "health systems", "hmis", "dhis", "health information",
                "national health", "health ministry", "nhm", "health program"
            ],
            "development_sector": [
                "world bank", "undp", "un ", "adb", "usaid", "giz", "fcdo", "dfid",
                "development sector", "multilateral", "donor", "oda", "aid program",
                "development consulting"
            ],
            "government_consulting": [
                "government consulting", "public sector", "state government",
                "central government", "ministry", "meity", "government advisory"
            ],
            "it_consulting": [
                "it consulting", "technology consulting", "tech advisory",
                "enterprise transformation", "erp consulting"
            ],
            "social_sector": [
                "ngo", "social sector", "non-profit", "nonprofit", "social impact",
                "csr", "foundation", "development organization"
            ],
            "healthcare": [
                "hospital", "clinical", "patient", "medical", "pharmaceutical",
                "healthcare it", "health tech"
            ],
            "education": [
                "edtech", "education technology", "education program", "school",
                "university program", "learning management"
            ],
            "finance": [
                "fintech", "banking", "finance", "insurance", "capital markets"
            ],
        }

        best_sector = "private_sector_generic"
        best_weight = 0.3

        for sector, patterns in sector_patterns.items():
            if any(p in text for p in patterns):
                weight = self.sector_weights.get(sector, 0.5)
                if weight > best_weight:
                    best_sector = sector
                    best_weight = weight

        score = best_weight * 25.0
        return score, best_sector

    def role_alignment_score(self, job_text: str) -> Tuple[float, List[str]]:
        """
        Score 0-20 based on how well job title/role matches preferred roles.
        """
        text = job_text.lower()

        # Check preferred employer names
        employer_bonus = 5.0 if any(emp in text for emp in self.preferred_employers) else 0.0

        # Check preferred role titles
        matched_roles = [role for role in self.preferred_roles if role in text]

        if len(matched_roles) >= 3:
            base = 15.0
        elif len(matched_roles) == 2:
            base = 12.0
        elif len(matched_roles) == 1:
            base = 9.0
        else:
            # Partial keyword match
            role_keywords = [
                "consulting", "program", "project", "digital", "transformation",
                "governance", "health", "director", "manager", "lead", "head"
            ]
            partial = sum(1 for kw in role_keywords if kw in text)
            base = min(7.0, partial * 1.5)

        score = min(20.0, base + employer_bonus)
        return score, matched_roles

    def semantic_similarity(
        self,
        job_embedding: Optional[List[float]],
        profile_embedding: Optional[List[float]],
    ) -> float:
        """
        Compute cosine similarity between job and profile embeddings.
        Returns score 0-10.
        """
        if job_embedding is None or profile_embedding is None:
            return 5.0  # Neutral score if embeddings unavailable

        job_vec = np.array(job_embedding, dtype=np.float32)
        profile_vec = np.array(profile_embedding, dtype=np.float32)

        job_norm = np.linalg.norm(job_vec)
        profile_norm = np.linalg.norm(profile_vec)

        if job_norm == 0 or profile_norm == 0:
            return 5.0

        cosine = float(np.dot(job_vec, profile_vec) / (job_norm * profile_norm))
        # Cosine ranges -1 to 1; map to 0-10
        return (cosine + 1) / 2 * 10

    async def score_job_fit(self, job: Any) -> Dict[str, Any]:
        """
        Compute a 0-100 match score with full breakdown.

        Score breakdown:
        - keyword_relevance: 0-25
        - sector_relevance: 0-25
        - role_alignment: 0-20
        - seniority_alignment: 0-20
        - semantic_similarity: 0-10

        Total: 100
        """
        # Build combined text for analysis
        title = getattr(job, "title", "") or ""
        company = getattr(job, "company", "") or ""
        description = getattr(job, "description", "") or ""
        requirements = getattr(job, "requirements", "") or ""
        location = getattr(job, "location", "") or ""

        job_text = f"{title} {company} {description} {requirements} {location}"

        # Individual scores
        kw_score, kw_detail = self.keyword_relevance_score(job_text)
        sector_score, matched_sector = self.sector_relevance_score(job_text)
        role_score, matched_roles = self.role_alignment_score(job_text)
        seniority_score, seniority_level = self.seniority_alignment_score(
            job_text, self.profile["years_experience"]
        )

        # Semantic similarity
        job_embedding = getattr(job, "embedding", None)
        profile_embedding = await self._get_profile_embedding()
        semantic_score = self.semantic_similarity(job_embedding, profile_embedding)

        # Final weighted score
        total = kw_score + sector_score + role_score + seniority_score + semantic_score

        # Hard cap: if negative keywords present, max is 30
        neg_hits = [kw for kw in self.negative_keywords if kw in job_text.lower()]
        if neg_hits:
            total = min(total, 30.0)

        final_score = round(min(100.0, max(0.0, total)), 1)

        return {
            "score": final_score,
            "breakdown": {
                "keyword_relevance": round(kw_score, 1),
                "sector_relevance": round(sector_score, 1),
                "role_alignment": round(role_score, 1),
                "seniority_alignment": round(seniority_score, 1),
                "semantic_similarity": round(semantic_score, 1),
            },
            "matched_sector": matched_sector,
            "matched_roles": matched_roles[:3],
            "keyword_matches": kw_detail.get("high_priority_matches", [])[:5],
            "negative_flags": neg_hits[:3],
            "seniority_detected": seniority_level,
        }

    async def batch_rank_jobs(
        self,
        jobs: List[Any],
        db: Optional[AsyncSession] = None,
    ) -> List[Dict[str, Any]]:
        """
        Score and rank all jobs, optionally persisting scores to DB.
        Returns sorted list with scores.
        """
        from app.services.ai_service import AIService
        ai_service = AIService()

        # Generate embeddings for jobs that don't have them
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

        # Score jobs concurrently
        score_semaphore = asyncio.Semaphore(5)

        async def score_with_semaphore(job):
            async with score_semaphore:
                result = await self.score_job_fit(job)
                result["job_id"] = job.id
                result["title"] = getattr(job, "title", "")

                # Persist to database
                if db:
                    try:
                        from app.models.job import Job
                        await db.execute(
                            update(Job)
                            .where(Job.id == job.id)
                            .values(
                                match_score=result["score"],
                                score_breakdown=result["breakdown"],
                            )
                        )
                    except Exception as e:
                        logger.error(f"Failed to persist score for job {job.id}: {e}")
                return result

        tasks = [score_with_semaphore(job) for job in jobs]
        results = await asyncio.gather(*tasks, return_exceptions=False)

        # Sort by score descending
        results.sort(key=lambda x: x.get("score", 0), reverse=True)
        logger.info(f"Batch scored {len(results)} jobs. Top score: {results[0]['score'] if results else 0}")
        return results


# Type alias
from typing import Any
