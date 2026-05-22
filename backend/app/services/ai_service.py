import asyncio
import json
from typing import Optional, List, Dict, Any, Tuple
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
import openai
import anthropic
from app.core.config import settings
from app.core.logging_config import logger
from app.ai.profile import CANDIDATE_PROFILE

# Initialize clients lazily
_openai_client: Optional[openai.AsyncOpenAI] = None
_anthropic_client: Optional[anthropic.AsyncAnthropic] = None


def get_openai_client() -> openai.AsyncOpenAI:
    global _openai_client
    if _openai_client is None:
        _openai_client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    return _openai_client


def get_anthropic_client() -> anthropic.AsyncAnthropic:
    global _anthropic_client
    if _anthropic_client is None:
        _anthropic_client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
    return _anthropic_client


PROFILE_SUMMARY_TEXT = f"""
Candidate: Senior Consulting Professional, {CANDIDATE_PROFILE['years_experience']}+ years experience.
Core expertise: {', '.join(CANDIDATE_PROFILE['core_competencies'][:10])}.
Key domains: {', '.join(CANDIDATE_PROFILE['domain_expertise'][:8])}.
Preferred roles: {', '.join(CANDIDATE_PROFILE['preferred_roles'][:8])}.
Preferred employers: {', '.join(CANDIDATE_PROFILE['preferred_employers'][:8])}.
Keywords (high priority): {', '.join(CANDIDATE_PROFILE['keywords_high_priority'][:10])}.
"""


class AIService:
    """AI-powered job analysis, matching, and content generation service."""

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((openai.RateLimitError, openai.APIConnectionError)),
    )
    async def generate_embedding(self, text: str) -> List[float]:
        """Generate text embedding using OpenAI text-embedding-3-small."""
        client = get_openai_client()
        # Truncate text to avoid token limit
        truncated = text[:8000]
        response = await client.embeddings.create(
            model=settings.OPENAI_EMBEDDING_MODEL,
            input=truncated,
            dimensions=settings.OPENAI_EMBEDDING_DIMENSIONS,
        )
        return response.data[0].embedding

    async def generate_job_embedding(self, job) -> Optional[List[float]]:
        """Generate embedding for a job object."""
        job_text = self._build_job_text(job)
        try:
            return await self.generate_embedding(job_text)
        except Exception as e:
            logger.error(f"Embedding generation failed for job {getattr(job, 'id', '?')}: {e}")
            return None

    def _build_job_text(self, job) -> str:
        """Build a combined text representation of a job for embedding."""
        parts = []
        if hasattr(job, "title") and job.title:
            parts.append(f"Title: {job.title}")
        if hasattr(job, "company") and job.company:
            parts.append(f"Company: {job.company}")
        if hasattr(job, "location") and job.location:
            parts.append(f"Location: {job.location}")
        if hasattr(job, "industry") and job.industry:
            parts.append(f"Industry: {job.industry}")
        if hasattr(job, "seniority_level") and job.seniority_level:
            parts.append(f"Seniority: {job.seniority_level}")
        if hasattr(job, "description") and job.description:
            parts.append(f"Description: {job.description[:3000]}")
        if hasattr(job, "requirements") and job.requirements:
            parts.append(f"Requirements: {job.requirements[:1500]}")
        return "\n".join(parts)

    @retry(
        stop=stop_after_attempt(2),
        wait=wait_exponential(multiplier=1, min=3, max=15),
    )
    async def calculate_match_score(self, job) -> Dict[str, Any]:
        """
        Calculate match score 0-100 with breakdown using GPT-4o.
        Returns dict with score, breakdown, why_relevant, missing_skills.
        """
        job_text = self._build_job_text(job)

        prompt = f"""You are an expert career advisor analyzing job fit for a senior consulting professional.

CANDIDATE PROFILE:
{PROFILE_SUMMARY_TEXT}

JOB POSTING:
{job_text[:4000]}

Analyze this job and respond ONLY with a JSON object (no markdown, no extra text):
{{
  "score": <integer 0-100>,
  "breakdown": {{
    "role_alignment": <0-25, how well the role matches preferred roles>,
    "domain_relevance": <0-25, how relevant the domain/sector is>,
    "seniority_fit": <0-20, seniority level match for 14+ years experience>,
    "employer_quality": <0-15, prestige/type of employer for this profile>,
    "skills_match": <0-15, technical and domain skills match>
  }},
  "why_relevant": "<2-3 sentence explanation of why this job is a good fit>",
  "missing_skills": ["<skill1>", "<skill2>"],
  "summary": "<1 sentence job summary>",
  "red_flags": ["<flag1>", "<flag2>"]
}}

Score guide: 90-100=perfect match, 70-89=strong match, 50-69=moderate match, below 50=weak match.
If the job clearly targets entry/junior level or is completely unrelated, score 0-20."""

        try:
            client = get_openai_client()
            response = await client.chat.completions.create(
                model=settings.OPENAI_CHAT_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
                max_tokens=600,
                response_format={"type": "json_object"},
            )
            content = response.choices[0].message.content
            result = json.loads(content)
            return result
        except Exception as e:
            logger.warning(f"OpenAI scoring failed, trying Anthropic: {e}")
            return await self._claude_calculate_match_score(job_text)

    async def _claude_calculate_match_score(self, job_text: str) -> Dict[str, Any]:
        """Fallback to Anthropic Claude for match scoring."""
        client = get_anthropic_client()
        prompt = f"""Analyze this job for a senior consulting professional ({CANDIDATE_PROFILE['years_experience']}+ years, expertise in {', '.join(CANDIDATE_PROFILE['keywords_high_priority'][:8])}).

JOB: {job_text[:3000]}

Respond ONLY with valid JSON:
{{"score": <0-100>, "breakdown": {{"role_alignment": <0-25>, "domain_relevance": <0-25>, "seniority_fit": <0-20>, "employer_quality": <0-15>, "skills_match": <0-15>}}, "why_relevant": "<string>", "missing_skills": [], "summary": "<string>", "red_flags": []}}"""

        message = await client.messages.create(
            model=settings.ANTHROPIC_MODEL,
            max_tokens=600,
            messages=[{"role": "user", "content": prompt}],
        )
        try:
            return json.loads(message.content[0].text)
        except Exception:
            return {
                "score": 50,
                "breakdown": {"role_alignment": 12, "domain_relevance": 12, "seniority_fit": 10, "employer_quality": 8, "skills_match": 8},
                "why_relevant": "Unable to generate detailed analysis.",
                "missing_skills": [],
                "summary": "Job analysis unavailable.",
                "red_flags": [],
            }

    async def generate_ai_summary(self, job) -> str:
        """Generate a concise 2-3 sentence AI summary of a job."""
        job_text = self._build_job_text(job)
        prompt = (
            f"Write a concise 2-3 sentence professional summary of this job posting. "
            f"Focus on role scope, key responsibilities, and what makes it interesting.\n\n"
            f"JOB:\n{job_text[:2000]}"
        )
        try:
            client = get_openai_client()
            response = await client.chat.completions.create(
                model=settings.OPENAI_CHAT_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=200,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"Summary generation failed: {e}")
            desc = getattr(job, "description", "") or ""
            return desc[:300] + "..." if len(desc) > 300 else desc

    async def explain_relevance(self, job) -> str:
        """Explain why a job is relevant to the candidate profile."""
        job_text = self._build_job_text(job)
        prompt = (
            f"In 2-3 sentences, explain specifically WHY this job is relevant for "
            f"a senior professional with 14+ years in digital transformation, "
            f"e-governance, public health IT, and government consulting.\n\n"
            f"JOB:\n{job_text[:2000]}"
        )
        try:
            client = get_openai_client()
            response = await client.chat.completions.create(
                model=settings.OPENAI_CHAT_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=200,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"Relevance explanation failed: {e}")
            return "Relevant to your expertise in consulting and digital transformation."

    async def find_missing_skills(self, job) -> List[str]:
        """Identify skills required by the job that the candidate may be missing."""
        job_text = self._build_job_text(job)
        known_skills = set(s.lower() for s in CANDIDATE_PROFILE["core_competencies"] + CANDIDATE_PROFILE["technical_skills"])

        prompt = (
            f"List the specific technical skills, certifications, or domain knowledge "
            f"required in this job posting that a candidate with these skills MIGHT be missing:\n"
            f"Candidate skills: {', '.join(list(known_skills)[:30])}\n\n"
            f"JOB REQUIREMENTS:\n{job_text[:2000]}\n\n"
            f"Return ONLY a JSON array of strings. Max 5 items. Be specific."
        )
        try:
            client = get_openai_client()
            response = await client.chat.completions.create(
                model=settings.OPENAI_CHAT_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
                max_tokens=150,
                response_format={"type": "json_object"},
            )
            result = json.loads(response.choices[0].message.content)
            if isinstance(result, dict):
                for key in result:
                    if isinstance(result[key], list):
                        return result[key][:5]
            return []
        except Exception as e:
            logger.error(f"Missing skills analysis failed: {e}")
            return []

    async def generate_cover_letter_draft(
        self,
        job,
        custom_notes: Optional[str] = None,
    ) -> str:
        """Generate a personalized cover letter draft."""
        job_title = getattr(job, "title", "the position")
        company = getattr(job, "company", "your organization")
        description = getattr(job, "description", "") or ""

        additional = f"\nSpecial emphasis: {custom_notes}" if custom_notes else ""

        prompt = f"""Write a compelling professional cover letter for this senior consulting professional applying to the role below.

CANDIDATE BACKGROUND:
- 14+ years in Project Management, Digital Transformation, Government Consulting, Public Health IT, E-Governance
- Led PMU/TSU for World Bank & multilateral donor projects
- Expert in AI governance, health information systems, smart cities
- PMP certified, strong stakeholder management
{additional}

TARGET ROLE:
Title: {job_title}
Company: {company}
Description: {description[:1500]}

Write a 3-paragraph cover letter (opening, value proposition, closing with call to action).
Tone: professional, confident, results-oriented.
Length: 250-300 words."""

        try:
            client = get_openai_client()
            response = await client.chat.completions.create(
                model=settings.OPENAI_CHAT_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.6,
                max_tokens=500,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"Cover letter generation failed: {e}")
            raise

    async def generate_recruiter_outreach(
        self,
        job,
        recruiter_name: str,
        tone: str = "professional",
    ) -> str:
        """Generate a LinkedIn/email outreach message to a recruiter."""
        job_title = getattr(job, "title", "the role")
        company = getattr(job, "company", "your company")

        tone_guide = {
            "professional": "formal and professional",
            "friendly": "warm and conversational",
            "concise": "brief (under 100 words)",
        }.get(tone, "professional")

        prompt = f"""Write a {tone_guide} outreach message from a senior consulting professional to a recruiter.

Recruiter: {recruiter_name}
Job: {job_title} at {company}

Candidate background: 14+ years in digital transformation, government consulting, public health IT,
World Bank project management, e-governance. Seeking senior leadership roles.

Message should:
- Reference the specific role
- Highlight 2-3 key strengths briefly
- Express interest and request a conversation
- Be authentic and not generic

LinkedIn message format (under 300 characters for connection request, or full message for InMail)."""

        try:
            client = get_openai_client()
            response = await client.chat.completions.create(
                model=settings.OPENAI_CHAT_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.6,
                max_tokens=300,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"Outreach generation failed: {e}")
            raise

    async def analyze_skills_gap(self, jobs: List[Any]) -> Dict[str, Any]:
        """Analyze skills gap across a set of jobs."""
        all_missing: List[str] = []
        for job in jobs:
            if hasattr(job, "missing_skills") and job.missing_skills:
                all_missing.extend(job.missing_skills)

        # Frequency analysis
        freq: Dict[str, int] = {}
        for skill in all_missing:
            freq[skill.lower().strip()] = freq.get(skill.lower().strip(), 0) + 1

        sorted_gaps = sorted(freq.items(), key=lambda x: x[1], reverse=True)[:15]

        if not sorted_gaps:
            return {"gap_analysis": "No skills gaps identified.", "top_gaps": []}

        gaps_text = ", ".join(f"{s} ({c}x)" for s, c in sorted_gaps[:10])
        prompt = (
            f"A senior consultant (14+ yrs, digital transformation, govt consulting, public health IT) "
            f"has these skills mentioned as missing in job postings:\n{gaps_text}\n\n"
            f"Provide 3-4 specific, actionable recommendations to address these gaps. "
            f"Be concise and practical."
        )

        try:
            client = get_openai_client()
            response = await client.chat.completions.create(
                model=settings.OPENAI_CHAT_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.4,
                max_tokens=300,
            )
            analysis = response.choices[0].message.content.strip()
        except Exception:
            analysis = f"Focus on developing these frequently requested skills: {gaps_text}"

        return {
            "top_gaps": [{"skill": s, "frequency": c} for s, c in sorted_gaps],
            "recommendations": analysis,
            "jobs_analyzed": len(jobs),
        }

    async def batch_score_jobs(self, jobs: List[Any]) -> List[Dict[str, Any]]:
        """Score multiple jobs concurrently with rate limiting."""
        semaphore = asyncio.Semaphore(3)  # Max 3 concurrent AI calls

        async def score_with_semaphore(job):
            async with semaphore:
                try:
                    result = await self.calculate_match_score(job)
                    return {"job_id": job.id, "success": True, **result}
                except Exception as e:
                    logger.error(f"Failed to score job {job.id}: {e}")
                    return {"job_id": job.id, "success": False, "score": 50}

        tasks = [score_with_semaphore(job) for job in jobs]
        results = await asyncio.gather(*tasks, return_exceptions=False)
        return results
