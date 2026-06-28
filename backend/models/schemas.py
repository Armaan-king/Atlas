"""
Pydantic models for all API request/response shapes.
Shared contract between backend routes and frontend API calls.
"""

from pydantic import BaseModel, Field
from typing import Optional


# ─── Chat ────────────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str = Field(..., description="Either 'user' or 'assistant'")
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    course_context: Optional[str] = Field(
        None, description="Optional course ID to focus the conversation (e.g. 'sc2002')"
    )
    module_statuses: Optional[dict[str, list[dict]]] = Field(
        None,
        description="Module groups keyed by current/taken/planned, each item like {id, course_code, name}.",
    )
    triage_statuses: Optional[dict[str, str]] = None
    system_status: Optional[dict[str, str]] = None
    active_remediation: Optional[dict] = None
    upcoming_deadlines: Optional[list[dict]] = None
    graph_context: Optional[list[dict]] = Field(
        None, description="Concepts from knowledge graph: [{id, label, course_id, mastery, status}]"
    )
    graph_connections: Optional[list[dict]] = Field(
        None, description="Resolved edges: [{source_label, source_course, relationship, target_label, target_course, cross_course}]"
    )
    agent_url: Optional[str] = Field(
        None, description="Legacy field retained for frontend compatibility; ignored by the backend."
    )


# ─── Study Generation ────────────────────────────────────────────────────────

class GenerateRequest(BaseModel):
    topic: str = Field(..., description="Topic to generate content for")
    course_id: str = Field(..., description="Course ID (e.g. 'sc2002')")
    additional_context: Optional[str] = Field(
        None, description="Extra context like lecture notes or specific subtopics"
    )


class FlashCard(BaseModel):
    front: str
    back: str
    course_id: str


class QuizQuestion(BaseModel):
    question: str
    options: list[str]
    correct_index: int
    explanation: str


class StudyGuideResponse(BaseModel):
    content: str = Field(..., description="Markdown-formatted study guide")
    topic: str
    course_id: str


class FlashcardsResponse(BaseModel):
    cards: list[FlashCard]
    topic: str
    course_id: str


class QuizResponse(BaseModel):
    questions: list[QuizQuestion]
    topic: str
    course_id: str


# ─── File Parsing ─────────────────────────────────────────────────────────────

class ParseResponse(BaseModel):
    text: str
    filename: str
    pages: int


# ─── Knowledge Graph ─────────────────────────────────────────────────────────

class ConceptNode(BaseModel):
    id: str
    label: str
    course_id: str
    description: str


class ConceptEdge(BaseModel):
    source: str
    target: str
    relationship: str


class GraphExtractRequest(BaseModel):
    text: str = Field(..., description="Text to extract concepts from")
    course_id: str = Field(..., description="Course this text belongs to")


class GraphExtractResponse(BaseModel):
    nodes: list[ConceptNode]
    edges: list[ConceptEdge]


class InitialGraphResponse(BaseModel):
    nodes: list[ConceptNode]
    edges: list[ConceptEdge]


class GraphRefreshRequest(BaseModel):
    nodes: list[ConceptNode]
    edges: list[ConceptEdge]
    mastery: dict[str, int] = Field(default_factory=dict, description="Map of concept ID to mastery (0-100)")


class KnowledgeContextRequest(BaseModel):
    prompt: Optional[str] = Field(None, description="Free-text study goal, e.g. 'study for my CFG exam'")
    concept_id: Optional[str] = Field(None, description="Concept ID from the graph click, e.g. 'c330-cfg'")
    course_id: Optional[str] = Field(None, description="Optional course filter")


class CourseRecommendationRequest(BaseModel):
    taken_course_ids: list[str] = Field(
        ..., description="Course IDs the student has taken/is taking, e.g. ['cmsc421', 'cmsc422']"
    )




# ─── Voice (shared with Person 4) ────────────────────────────────────────────

class VoiceRequest(BaseModel):
    text: str = Field(..., description="Text to convert to speech")
    voice_id: Optional[str] = Field("JBFqnCBsd6RMkjVDRZzb", description="ElevenLabs voice ID")
