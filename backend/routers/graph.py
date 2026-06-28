"""Graph router — concept extraction and initial graph data."""

from fastapi import APIRouter, HTTPException

from models.schemas import (
    ConceptEdge,
    ConceptNode,
    GraphExtractRequest,
    GraphExtractResponse,
    InitialGraphResponse,
)
from prompts.concept_extract import build_concept_extract_prompt
from services.openai_client import generate_json_fallback

try:
    from data.concepts import CONCEPTS
    from data.connections import CONNECTIONS
    from data.courses import COURSES
except ImportError:
    CONCEPTS = []
    CONNECTIONS = []
    COURSES = []

router = APIRouter()


def _find_course(course_id: str) -> dict:
    for course in COURSES:
        if course["id"] == course_id:
            return course
    return {"id": course_id, "name": course_id.upper(), "topics": []}


@router.get("/graph/initial", response_model=InitialGraphResponse)
async def get_initial_graph():
    """Return the pre-built concept graph from mock data."""
    nodes = [
        ConceptNode(
            id=concept["id"],
            label=concept["label"],
            course_id=concept["course_id"],
            description=concept["description"],
        )
        for concept in CONCEPTS
    ]
    edges = [
        ConceptEdge(
            source=connection["source"],
            target=connection["target"],
            relationship=connection["relationship"],
        )
        for connection in CONNECTIONS
    ]
    return InitialGraphResponse(nodes=nodes, edges=edges)


@router.post("/graph/extract", response_model=GraphExtractResponse)
async def extract_concepts(request: GraphExtractRequest):
    """Extract concept nodes and edges from text with OpenAI."""
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    course = _find_course(request.course_id)
    prompt = build_concept_extract_prompt(
        text=request.text,
        course_id=request.course_id,
        course_name=course.get("name", ""),
    )

    try:
        result = await generate_json_fallback(
            prompt,
            system_instruction="Extract academic concepts as valid JSON only.",
        )
        nodes_data = result.get("nodes", [])
        edges_data = result.get("edges", [])

        nodes = [
            ConceptNode(
                id=node["id"],
                label=node["label"],
                course_id=node.get("course_id", request.course_id),
                description=node["description"],
            )
            for node in nodes_data
        ]

        node_ids = {node.id for node in nodes}
        edges = [
            ConceptEdge(
                source=edge["source"],
                target=edge["target"],
                relationship=edge["relationship"],
            )
            for edge in edges_data
            if edge["source"] in node_ids and edge["target"] in node_ids
        ]

        return GraphExtractResponse(nodes=nodes, edges=edges)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Concept extraction failed: {exc}")
