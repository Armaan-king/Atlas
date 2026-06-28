"""
Data router — serves mock data to the frontend.
GET /api/courses
GET /api/assignments
GET /api/notes
GET /api/concepts
GET /api/connections
GET /api/syllabi
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, Literal

try:
    from data.courses import COURSES
    from data.assignments import ASSIGNMENTS
    from data.notes import NOTES
    from data.concepts import CONCEPTS
    from data.connections import CONNECTIONS
    from data.syllabus import SYLLABUS
    from data.announcements import ANNOUNCEMENTS
except ImportError:
    COURSES = []
    ASSIGNMENTS = []
    NOTES = []
    CONCEPTS = []
    CONNECTIONS = []
    SYLLABUS = []
    ANNOUNCEMENTS = []

from models.data_models import (
    CourseModel,
    AssignmentModel,
    NoteModel,
    ConceptModel,
    ConnectionModel,
    SyllabusModel,
    AnnouncementModel,
)

try:
    from data.concepts import CONCEPTS
except ImportError:
    CONCEPTS = []

try:
    from data.connections import CONNECTIONS
except ImportError:
    CONNECTIONS = []

try:
    from data.syllabus import SYLLABUS
except ImportError:
    SYLLABUS = []

router = APIRouter()


@router.get("/courses")
async def get_courses():
    """Return all enrolled courses."""
    return COURSES


@router.get("/assignments")
async def get_assignments():
    """Return all assignments and exams."""
    return ASSIGNMENTS


@router.get("/notes")
async def get_notes():
    """Return all lecture notes."""
    return NOTES


@router.get("/concepts")
async def get_concepts():
    """Return all knowledge graph concept nodes."""
    return CONCEPTS


@router.get("/connections")
async def get_connections():
    """Return all knowledge graph edges."""
    return CONNECTIONS


@router.get("/syllabi")
async def get_syllabi():
    """Return syllabi for all courses."""
    return SYLLABUS


@router.get("/announcements")
async def get_announcements():
    """Return all course announcements."""
    return ANNOUNCEMENTS
