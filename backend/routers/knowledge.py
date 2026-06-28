import logging

from fastapi import APIRouter, HTTPException

from models.schemas import (
    CourseRecommendationRequest,
    GraphRefreshRequest,
    KnowledgeContextRequest,
)
from prompts.course_recommendation import (
    build_course_recommendation_prompt,
    build_recommendation_json_prompt,
)
from prompts.graph_analysis import build_graph_analysis_prompt
from prompts.topic_knowledge import build_topic_knowledge_prompt
from services.catalog_service import catalog_service
from services.openai_client import build_knowledge_document, generate_json_fallback

try:
    from data.assignments import ASSIGNMENTS
    from data.connections import CONNECTIONS
    from data.concepts import CONCEPTS
    from data.courses import COURSES
    from data.notes import NOTES
except ImportError:
    ASSIGNMENTS = []
    CONNECTIONS = []
    CONCEPTS = []
    COURSES = []
    NOTES = []

log = logging.getLogger("knowledge")

router = APIRouter()


@router.post("/knowledge/build-context")
async def build_context(request: KnowledgeContextRequest):
    """Build a focused OpenAI knowledge document for a specific topic."""
    query = request.prompt or ""
    course_filter = request.course_id

    if request.concept_id:
        concept = next((c for c in CONCEPTS if c["id"] == request.concept_id), None)
        if concept:
            query = f"{concept['label']} - {query}" if query else concept["label"]
            if not course_filter:
                course_filter = concept["course_id"]
        else:
            raise HTTPException(status_code=404, detail=f"Concept '{request.concept_id}' not found")

    if not query:
        raise HTTPException(status_code=400, detail="Provide either a 'prompt' or 'concept_id'")

    log.info('Building focused knowledge context for "%s" (course=%s)', query, course_filter)

    try:
        prompt = build_topic_knowledge_prompt(
            query=query,
            concepts=CONCEPTS,
            assignments=ASSIGNMENTS,
            notes=NOTES,
            connections=CONNECTIONS,
            courses=COURSES,
            course_filter=course_filter,
        )
        context_doc = await build_knowledge_document(prompt)
        log.info("Generated focused knowledge doc (%s chars)", len(context_doc))

        return {
            "status": "success",
            "query": query,
            "course": course_filter,
            "context_ready": True,
            "context_length": len(context_doc),
            "agent_url": None,
        }
    except Exception as exc:
        log.error("build-context failed: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/knowledge/refresh-from-graph")
async def refresh_from_graph(request: GraphRefreshRequest):
    """Analyze the knowledge graph with OpenAI and return a refreshed summary."""
    if not request.nodes:
        raise HTTPException(status_code=400, detail="Cannot refresh from empty graph")

    try:
        prompt = build_graph_analysis_prompt(
            nodes=request.nodes,
            edges=request.edges,
            mastery=request.mastery,
        )
        context_doc = await build_knowledge_document(prompt)
        log.info("Graph knowledge doc generated (%s chars)", len(context_doc))
        return {
            "status": "success",
            "message": "Graph context refreshed with OpenAI",
            "context_length": len(context_doc),
        }
    except Exception as exc:
        log.error("refresh-from-graph failed: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/knowledge/recommend-courses")
async def recommend_courses(request: CourseRecommendationRequest):
    """Recommend three future modules using catalog data plus OpenAI."""
    if not request.taken_course_ids:
        raise HTTPException(status_code=400, detail="taken_course_ids must not be empty")

    log.info("Recommending modules for taken=%s", request.taken_course_ids)

    try:
        all_modules = await catalog_service.fetch_all_courses("SCSE")
        catalog_available = bool(all_modules)
        if not catalog_available:
            log.warning("NTU catalog unavailable; returning manual-entry guidance")
        else:
            log.info("Fetched %s NTU modules from catalog", len(all_modules))

        taken_upper = {course_id.upper() for course_id in request.taken_course_ids}
        taken_courses = [course for course in all_modules if course.get("course_id", "").upper() in taken_upper]
        unmatched_ids = taken_upper - {course.get("course_id", "").upper() for course in taken_courses}

        if not catalog_available or not taken_courses:
            return {
                "status": "partial",
                "message": (
                    "Your course(s) have been added, but we could not retrieve details from the NTU catalog. "
                    "Please manually add course details (name, credits, description) for accurate recommendations."
                ),
                "added_course_ids": list(request.taken_course_ids),
                "unmatched_ids": sorted(unmatched_ids),
                "recommendations": [],
                "agent_url": None,
            }

        prompt = build_course_recommendation_prompt(
            taken_courses=taken_courses,
            all_cmsc_courses=all_modules,
        )
        context_doc = await build_knowledge_document(prompt)
        log.info("Generated course recommendation doc (%s chars)", len(context_doc))

        json_prompt = build_recommendation_json_prompt(context_doc, request.taken_course_ids)
        recommendations = await generate_json_fallback(json_prompt)
        if isinstance(recommendations, list):
            recommendations = recommendations[:3]

        return {
            "status": "success",
            "agent_url": None,
            "recommendations": recommendations,
        }
    except HTTPException:
        raise
    except Exception as exc:
        log.error("recommend-courses failed: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))
