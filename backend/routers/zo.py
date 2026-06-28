"""
ZO email agent router.

POST /api/zo/parse   — accepts raw email text, returns structured digest
"""

import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.zo_client import parse_emails, summarize_mail

log = logging.getLogger(__name__)
router = APIRouter()


class ZOParseRequest(BaseModel):
    email_text: str = ""
    emailText: str = ""
    emails: list[dict] = Field(default_factory=list)
    calendar_items: list[dict] = Field(default_factory=list)
    calendarItems: list[dict] = Field(default_factory=list)


class ZODigest(BaseModel):
    summary: str
    upcoming_events: list = Field(default_factory=list)
    exams: list = Field(default_factory=list)
    meetings: list = Field(default_factory=list)
    deadlines: list = Field(default_factory=list)
    action_items: list = Field(default_factory=list)
    needs_reply: list = Field(default_factory=list)
    email_summaries: list[dict] = Field(default_factory=list)


@router.post("/zo/parse", response_model=ZODigest)
async def zo_parse(request: ZOParseRequest):
    """
    Accept either pasted raw email text or structured Outlook email/calendar
    payloads and return a structured academic digest.
    """
    email_text = (request.email_text or request.emailText).strip()
    calendar_items = [*request.calendar_items, *request.calendarItems]
    has_text = bool(email_text)
    has_structured = bool(request.emails or calendar_items)

    if not has_text and not has_structured:
        raise HTTPException(
            status_code=400,
            detail="Provide email_text or structured emails/calendar_items payloads.",
        )

    try:
        if has_structured:
            result = await summarize_mail(request.emails, calendar_items)
        else:
            result = await parse_emails(email_text)
        return ZODigest(
            summary=result.get("summary", ""),
            upcoming_events=result.get("upcoming_events", []),
            exams=result.get("exams", []),
            meetings=result.get("meetings", []),
            deadlines=result.get("deadlines", []),
            action_items=result.get("action_items", []),
            needs_reply=result.get("needs_reply", []),
            email_summaries=result.get("email_summaries", []),
        )
    except Exception as e:
        log.error(f"ZO parse failed: {e}")
        raise HTTPException(status_code=502, detail=f"ZO API error: {str(e)}")
