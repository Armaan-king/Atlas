"""
NTU module catalog routes.

NTU-flavoured catalog endpoints backed by services.catalog_service
(real NTU sources where reachable, mock NTU catalog otherwise).
Supersedes the previous external course-API routes.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from services.catalog_service import catalog_service

router = APIRouter()


@router.get("/ntu/courses")
async def get_ntu_courses(
    dept_id: Optional[str] = Query("SCSE", description="School/department (e.g. SCSE)"),
    term: Optional[str] = Query(None, description="Term (e.g. 2026;1)"),
):
    """Fetch NTU modules from the catalog."""
    return await catalog_service.fetch_courses(dept_id=dept_id)


@router.get("/ntu/courses/{course_id}")
async def get_ntu_course_details(course_id: str):
    """Fetch details for a specific NTU module."""
    details = await catalog_service.fetch_course_details(course_id)
    if not details:
        raise HTTPException(status_code=404, detail="Module not found")
    return details


@router.get("/ntu/courses/{course_id}/sections")
async def get_ntu_course_sections(
    course_id: str,
    term: Optional[str] = Query(None, description="Optional term hint, e.g. 2026;1"),
):
    """Fetch NTU class schedule rows for a specific module."""
    return await catalog_service.fetch_sections(course_id, term=term)


@router.get("/ntu/departments")
async def get_ntu_departments():
    """Fetch NTU schools/departments."""
    return await catalog_service.fetch_departments()


@router.get("/ntu/terms")
async def get_ntu_terms():
    """Fetch NTU academic terms."""
    return await catalog_service.fetch_terms()
