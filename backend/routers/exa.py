"""
Exa-backed course discovery routes.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.catalog_service import catalog_service
from services.exa_client import exa_client

log = logging.getLogger("exa_router")

router = APIRouter()


class ExaSearchRequest(BaseModel):
    query: str = Field(..., min_length=1)
    num_results: int = Field(5, ge=1, le=10)
    course_level: str | None = None


@router.post("/exa/search-courses")
async def search_courses(request: ExaSearchRequest):
    query = request.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="query must not be empty")

    if exa_client.is_configured():
        try:
            results = await exa_client.search_courses(query, num_results=request.num_results)
            if results:
                return results
        except Exception as e:
            log.warning(f"Exa search failed, falling back to local catalog: {e}")

    catalog = await catalog_service.fetch_courses()
    lowered = query.lower()
    filtered = [
        c for c in catalog
        if lowered in c.get("course_id", "").lower() or lowered in c.get("name", "").lower()
    ]
    return filtered[: request.num_results]


@router.get("/exa/module/{course_id}")
async def get_module(course_id: str):
    details = await catalog_service.fetch_course_details(course_id)
    if not details:
        raise HTTPException(status_code=404, detail="Module not found")
    return details
