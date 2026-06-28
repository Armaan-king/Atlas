"""
Career router grounded in the student's real coursework and projects.

Endpoints:
  POST /api/career/profile
  POST /api/career/match
  POST /api/career/interview
"""

import logging
import re
from collections import defaultdict

from fastapi import APIRouter, HTTPException

from models.career_schemas import (
    CareerProfileRequest,
    CareerProfileResponse,
    InterviewPrepRequest,
    InterviewPrepResponse,
    InterviewQuestion,
    JobMatch,
    JobMatchRequest,
    JobMatchResponse,
    ProfileStrength,
    SkillMatch,
)
from prompts.career import build_interview_prompt, build_profile_prompt
from services.exa_client import exa_client
from services.openai_client import generate_json_fallback

try:
    from data.jobs import JOBS
except ImportError:
    JOBS = []

log = logging.getLogger("career")

router = APIRouter()


async def _openai_json(prompt: str, system: str):
    return await generate_json_fallback(prompt, system_instruction=system)


def _profile_summary(concepts, projects) -> str:
    by_course: dict[str, list] = defaultdict(list)
    for concept in concepts:
        by_course[(concept.course_id or "general").upper()].append(concept)

    lines: list[str] = []
    for course, items in sorted(by_course.items()):
        items.sort(key=lambda concept: concept.mastery, reverse=True)
        lines.append(f"### {course}")
        for concept in items:
            lines.append(f"- {concept.label}: {concept.mastery}% mastery")
        lines.append("")
    return "\n".join(lines).strip() or "(no concept data provided)"


def _projects_block(projects) -> str:
    if not projects:
        return "(no completed projects provided)"
    return "\n".join(
        f"- {project.name}"
        + (f" [{project.course_id.upper()}]" if project.course_id else "")
        + (f": {project.description}" if project.description else "")
        for project in projects
    )


def _build_job_query(concepts, explicit_query: str | None) -> str:
    if explicit_query and explicit_query.strip():
        return explicit_query.strip()

    top = sorted(concepts, key=lambda concept: concept.mastery, reverse=True)[:6]
    skills = ", ".join(concept.label for concept in top if getattr(concept, "label", ""))
    base = (
        "current internship and new graduate software engineering, backend, systems, "
        "machine learning, data engineering, security, and quant roles"
    )
    return f"{base} relevant to these skills: {skills}" if skills else base


def _norm(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", text.lower()).strip()


def _best_match(skill: str, concept_map: dict[str, tuple[str, int]]):
    skill_n = _norm(skill)
    skill_tokens = set(skill_n.split())
    best = None
    best_score = 0.0

    for label_n, (original, mastery) in concept_map.items():
        if skill_n == label_n:
            return (original, mastery, 1.0)
        if skill_n in label_n or label_n in skill_n:
            score = 0.85
        else:
            label_tokens = set(label_n.split())
            union = skill_tokens | label_tokens
            score = (len(skill_tokens & label_tokens) / len(union)) if union else 0.0
        if score > best_score:
            best_score = score
            best = (original, mastery)

    if best and best_score >= 0.5:
        return (best[0], best[1], best_score)
    return None


def _score_job(job: dict, concept_map: dict[str, tuple[str, int]]) -> JobMatch:
    matched: list[SkillMatch] = []
    missing: list[str] = []
    weighted_sum = 0.0
    weight_total = 0.0

    for skills, weight in (
        (job.get("required_skills", []), 1.0),
        (job.get("preferred_skills", []), 0.5),
    ):
        for skill in skills:
            weight_total += weight
            match = _best_match(skill, concept_map)
            coverage = (match[1] / 100.0) if match else 0.0
            weighted_sum += weight * coverage
            if match and match[1] >= 50:
                matched.append(SkillMatch(skill=skill, mastery=match[1], matched_concept=match[0]))
            elif weight == 1.0:
                missing.append(skill)

    fit = round(100 * weighted_sum / weight_total) if weight_total else 0
    matched.sort(key=lambda item: item.mastery, reverse=True)

    return JobMatch(
        id=job["id"],
        title=job["title"],
        company=job["company"],
        location=job["location"],
        type=job["type"],
        level=job["level"],
        salary=job["salary"],
        source=job["source"],
        url=job["url"],
        summary=job["summary"],
        tags=job.get("tags", []),
        fit_score=fit,
        matched_skills=matched[:6],
        missing_skills=missing[:5],
    )


@router.post("/career/profile", response_model=CareerProfileResponse)
async def career_profile(request: CareerProfileRequest):
    """Build an evidence-backed career profile from the mastery graph."""
    prompt = build_profile_prompt(
        profile_summary=_profile_summary(request.concepts, request.projects)
        + "\n\n## Completed Projects\n"
        + _projects_block(request.projects),
        target=request.target,
    )

    try:
        result = await _openai_json(
            prompt,
            system="You output valid JSON career profiles only.",
        )
        if not isinstance(result, dict):
            raise ValueError("Unexpected profile format")

        strengths = [
            ProfileStrength(
                skill=strength.get("skill", ""),
                mastery=int(strength.get("mastery", 0) or 0),
                evidence=strength.get("evidence", ""),
            )
            for strength in result.get("strengths", [])
            if isinstance(strength, dict)
        ]

        return CareerProfileResponse(
            headline=result.get("headline", ""),
            summary=result.get("summary", ""),
            strengths=strengths,
            developing=result.get("developing", []),
            resume_bullets=result.get("resume_bullets", []),
            suggested_roles=result.get("suggested_roles", []),
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Profile generation failed: {exc}")


@router.post("/career/match", response_model=JobMatchResponse)
async def career_match(request: JobMatchRequest):
    """Score live Exa job results against the student's mastery profile."""
    concept_map: dict[str, tuple[str, int]] = {}
    for concept in request.concepts:
        key = _norm(concept.label)
        if key not in concept_map or concept.mastery > concept_map[key][1]:
            concept_map[key] = (concept.label, concept.mastery)

    jobs = JOBS
    if exa_client.is_configured():
        try:
            live_jobs = await exa_client.search_jobs(
                _build_job_query(request.concepts, request.query),
                num_results=request.limit,
            )
            if live_jobs:
                jobs = live_jobs
        except Exception as exc:
            log.warning("Live Exa job search failed, using curated fallback: %s", exc)

    matches = [_score_job(job, concept_map) for job in jobs]
    matches.sort(key=lambda match: match.fit_score, reverse=True)
    return JobMatchResponse(matches=matches[: request.limit])


@router.post("/career/interview", response_model=InterviewPrepResponse)
async def career_interview(request: InterviewPrepRequest):
    """Generate mock interview questions grounded in the student's real projects."""
    if not request.role.strip():
        raise HTTPException(status_code=400, detail="role is required")

    prompt = build_interview_prompt(
        role=request.role,
        profile_summary=_profile_summary(request.concepts, request.projects),
        projects=_projects_block(request.projects),
        count=request.count,
    )

    try:
        result = await _openai_json(
            prompt,
            system="You output valid JSON interview questions only.",
        )
        questions_data = result.get("questions", result) if isinstance(result, dict) else result
        if not isinstance(questions_data, list):
            raise ValueError("Unexpected interview format")

        questions = [
            InterviewQuestion(
                type=question.get("type", "technical"),
                question=question.get("question", ""),
                grounded_in=question.get("grounded_in", ""),
                assesses=question.get("assesses", ""),
                answer_hint=question.get("answer_hint", ""),
            )
            for question in questions_data
            if isinstance(question, dict) and question.get("question")
        ]
        return InterviewPrepResponse(role=request.role, questions=questions)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Interview prep failed: {exc}")
