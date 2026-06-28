"""
Pydantic models for the Career layer.

Kept in a separate module from schemas.py so the Career feature is a clean
drop-in and doesn't conflict with Person 2's ownership of schemas.py.
"""

from pydantic import BaseModel, Field
from typing import Optional


# ─── Shared input ────────────────────────────────────────────────────────────

class ConceptMastery(BaseModel):
    """A single concept from the knowledge graph with its mastery level."""
    label: str
    mastery: int = 0
    course_id: Optional[str] = None


class CompletedProject(BaseModel):
    """An assignment/project the student has submitted or been graded on."""
    name: str
    course_id: Optional[str] = None
    description: Optional[str] = None


# ─── Profile generation ──────────────────────────────────────────────────────

class CareerProfileRequest(BaseModel):
    concepts: list[ConceptMastery] = Field(default_factory=list)
    projects: list[CompletedProject] = Field(default_factory=list)
    target: Optional[str] = Field(
        None, description="Optional target role/industry to tailor the profile toward"
    )


class ProfileStrength(BaseModel):
    skill: str
    mastery: int = 0
    evidence: str = ""


class CareerProfileResponse(BaseModel):
    headline: str = ""
    summary: str = ""
    strengths: list[ProfileStrength] = Field(default_factory=list)
    developing: list[str] = Field(default_factory=list)
    resume_bullets: list[str] = Field(default_factory=list)
    suggested_roles: list[str] = Field(default_factory=list)


# ─── Job matching ────────────────────────────────────────────────────────────

class JobMatchRequest(BaseModel):
    concepts: list[ConceptMastery] = Field(default_factory=list)
    limit: int = 10
    query: Optional[str] = None


class SkillMatch(BaseModel):
    skill: str
    mastery: int = 0
    matched_concept: Optional[str] = None


class JobMatch(BaseModel):
    id: str
    title: str
    company: str
    location: str
    type: str
    level: str
    salary: str
    source: str
    url: str
    summary: str
    tags: list[str] = Field(default_factory=list)
    fit_score: int = 0
    matched_skills: list[SkillMatch] = Field(default_factory=list)
    missing_skills: list[str] = Field(default_factory=list)


class JobMatchResponse(BaseModel):
    matches: list[JobMatch] = Field(default_factory=list)


# ─── Interview prep ──────────────────────────────────────────────────────────

class InterviewPrepRequest(BaseModel):
    role: str
    concepts: list[ConceptMastery] = Field(default_factory=list)
    projects: list[CompletedProject] = Field(default_factory=list)
    count: int = 6


class InterviewQuestion(BaseModel):
    type: str = "technical"
    question: str
    grounded_in: str = ""
    assesses: str = ""
    answer_hint: str = ""


class InterviewPrepResponse(BaseModel):
    role: str
    questions: list[InterviewQuestion] = Field(default_factory=list)
