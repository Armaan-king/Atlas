"""
Pydantic models for core academic entities.
Field names follow common LMS API conventions (snake_case), ready for a
future NTULearn / LMS connector.
"""

from __future__ import annotations

from pydantic import BaseModel, Field
from typing import Optional, Literal


class CourseModel(BaseModel):
    id: str
    course_code: str
    name: str
    workflow_state: Literal["available", "unpublished", "completed", "deleted"] = "available"
    start_at: Optional[str] = Field(None, description="ISO 8601 datetime")
    end_at: Optional[str] = Field(None, description="ISO 8601 datetime")
    created_at: Optional[str] = Field(None, description="ISO 8601 datetime")
    time_zone: str = "America/New_York"
    color: str = Field(description="Hex color for UI theming")
    instructor: str
    credits: int = Field(ge=1, le=5)
    progress: int = Field(ge=0, le=100, description="Semester completion percentage")


class AssignmentModel(BaseModel):
    id: str
    course_id: str
    name: str
    submission_types: list[Literal[
        "online_upload", "online_text_entry", "online_quiz",
        "on_paper", "discussion_topic", "none"
    ]] = Field(default_factory=list)
    assignment_category: Literal["homework", "exam", "project", "quiz", "lab"]
    due_at: str = Field(description="ISO 8601 datetime")
    created_at: Optional[str] = Field(None, description="ISO 8601 datetime")
    updated_at: Optional[str] = Field(None, description="ISO 8601 datetime")
    has_submitted_submissions: bool = False
    points_possible: float = Field(ge=0, description="Maximum points for this assignment")
    workflow_state: Literal["published", "unpublished", "deleted"] = "published"
    description: Optional[str] = None
    status: Literal["upcoming", "in_progress", "submitted", "graded"] = "upcoming"
    priority: Literal["low", "medium", "high", "critical"] = "medium"


class NoteModel(BaseModel):
    id: str
    course_id: str
    title: str
    content: str
    created_at: str = Field(description="ISO 8601 datetime")
    tags: list[str] = Field(default_factory=list)
    week_number: Optional[int] = Field(None, ge=1, le=15, description="Syllabus week this note belongs to")


class ConceptModel(BaseModel):
    id: str
    course_id: str
    label: str
    description: str
    mastery: int = Field(ge=0, le=100)


class ConnectionModel(BaseModel):
    id: str
    source_id: str
    target_id: str
    label: str
    cross_course: bool = False


class SyllabusWeekModel(BaseModel):
    week: int = Field(ge=1, le=15)
    topic: str
    concept_ids: list[str] = Field(default_factory=list)
    assignment_ids: list[str] = Field(default_factory=list)
    outcomes: list[str] = Field(default_factory=list)


class SyllabusModel(BaseModel):
    course_id: str
    weeks: list[SyllabusWeekModel]


class AnnouncementModel(BaseModel):
    id: str
    course_id: str
    title: str
    message: str = Field(description="Plain-text or Markdown announcement body")
    author: str = Field(description="Instructor or TA name who posted")
    posted_at: str = Field(description="ISO 8601 datetime")
    read_state: Literal["read", "unread"] = "unread"
    pinned: bool = False
    importance: Literal["low", "medium", "high", "critical"] = "medium"
