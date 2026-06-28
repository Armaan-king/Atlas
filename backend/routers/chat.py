"""OpenAI-backed chat router."""

import json

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from models.schemas import ChatRequest
from prompts.chat_system import build_chat_system_prompt
from prompts.context_builder import build_openai_chat_prompt
from services.openai_client import generate_text_fallback

try:
    from data.assignments import ASSIGNMENTS
    from data.courses import COURSES
    from data.notes import NOTES
except ImportError:
    ASSIGNMENTS = []
    COURSES = []
    NOTES = []

router = APIRouter()


@router.post("/chat")
async def chat(request: ChatRequest):
    """Main chat endpoint with SSE output for the existing frontend."""
    if not request.messages:
        raise HTTPException(status_code=400, detail="Messages list cannot be empty")

    last_message = request.messages[-1].content
    history = [{"role": m.role, "content": m.content} for m in request.messages[:-1]]

    named_triage = {}
    if request.triage_statuses:
        for assignment_id, status in request.triage_statuses.items():
            assignment = next((a for a in ASSIGNMENTS if a.get("id") == assignment_id), None)
            name = assignment.get("name", assignment_id) if assignment else assignment_id
            named_triage[name] = status

    prompt = build_openai_chat_prompt(
        user_question=last_message,
        conversation_history=history if history else None,
        module_statuses=request.module_statuses,
        triage_statuses=named_triage,
        system_status=request.system_status,
        active_remediation=request.active_remediation,
        upcoming_deadlines=request.upcoming_deadlines,
        graph_context=request.graph_context,
        graph_connections=request.graph_connections,
    )

    async def event_stream():
        try:
            system_prompt = build_chat_system_prompt(
                courses=COURSES,
                assignments=ASSIGNMENTS,
                notes=NOTES,
                course_filter=request.course_context,
                module_statuses=request.module_statuses,
                triage_statuses=request.triage_statuses,
                active_remediation=request.active_remediation,
            )
            full_prompt = f"{system_prompt}\n\n{prompt}"
            response_text = await generate_text_fallback(
                full_prompt,
                system_instruction="You are Atlas, an NTU Singapore study assistant.",
            )
        except Exception as exc:
            err = json.dumps({"error": f"OpenAI chat failed: {str(exc)}"})
            yield f"data: {err}\n\n"
            yield "data: [DONE]\n\n"
            return

        chunk_size = 50
        for i in range(0, len(response_text), chunk_size):
            chunk = response_text[i : i + chunk_size]
            yield f"data: {json.dumps({'content': chunk})}\n\n"

        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
