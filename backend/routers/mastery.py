"""
Mastery router — tracks concept mastery updates.

POST /api/mastery/update   — record a mastery delta for a concept
GET  /api/mastery/{concept_id} — get current mastery for a concept

For the hackathon, the frontend Zustand store is the source of truth.
This endpoint exists for architecture completeness and future persistence.
"""

from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter()

# In-memory store (resets on server restart — frontend store is authoritative)
_mastery: dict[str, int] = {}


class MasteryUpdateRequest(BaseModel):
    concept_id: str = Field(..., description="Concept ID to update")
    delta: int = Field(..., description="Mastery change (+5 correct, -3 wrong)")
    source: str = Field("quiz", description="Source: 'quiz', 'flashcard', or 'manual'")


class MasteryUpdateResponse(BaseModel):
    concept_id: str
    new_mastery: int
    delta: int
    source: str


@router.post("/mastery/update", response_model=MasteryUpdateResponse)
def update_mastery(req: MasteryUpdateRequest):
    """Record a mastery delta. Clamps result to 0-100."""
    current = _mastery.get(req.concept_id, 50)  # default 50% if unknown
    new_val = max(0, min(100, current + req.delta))
    _mastery[req.concept_id] = new_val
    return MasteryUpdateResponse(
        concept_id=req.concept_id,
        new_mastery=new_val,
        delta=req.delta,
        source=req.source,
    )


@router.get("/mastery/{concept_id}")
def get_mastery(concept_id: str):
    """Get current mastery for a concept."""
    return {
        "concept_id": concept_id,
        "mastery": _mastery.get(concept_id, 50),
    }


@router.get("/mastery")
def get_all_mastery():
    """Get all tracked mastery values."""
    return {"mastery": _mastery}
