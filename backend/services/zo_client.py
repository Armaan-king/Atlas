"""
ZO email agent client.
Calls Armaan's hosted ZO endpoint which digests emails + calendar items
into a structured daily-digest response.
"""

import logging
import os
import re

import httpx

from services.openai_client import generate_json_fallback

log = logging.getLogger(__name__)

ZO_API_URL = "https://api.zo.computer/zo/ask"
ZO_LEGACY_API_URL = "https://armaanking.zo.space/api/email-summary"
ZO_MODEL_NAME = os.getenv("ZO_MODEL_NAME", "openai:gpt-5.4-mini-2026-03-17")
_DIGEST_KEYS = [
    "summary",
    "upcoming_events",
    "exams",
    "meetings",
    "deadlines",
    "action_items",
    "needs_reply",
]
_EMAIL_SUMMARY_TAGS = [
    "deadline",
    "exam",
    "meeting",
    "event",
    "action",
    "reply",
    "announcement",
]


def _compact(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def _clean_unknown(text: str) -> str:
    normalized = _compact(text)
    if normalized.lower() in {"", "n/a", "none", "null", "unknown"}:
        return ""
    return normalized


def _get_zo_token() -> str:
    return (
        os.getenv("ZO_API_KEY", "").strip()
        or os.getenv("EMAIL_SUMMARY_SHARED_SECRET", "").strip()
    )


def _split_candidates(email_text: str) -> list[str]:
    normalized = email_text.replace("\r\n", "\n").replace("\r", "\n")
    pieces: list[str] = []
    for block in normalized.split("\n"):
        block = _compact(block.strip(" -*\t"))
        block = re.sub(r"^(Email \d+|Calendar Item \d+):\s*", "", block, flags=re.IGNORECASE)
        block = re.sub(
            r"^(Subject|From|Received|Read|Attachments|Content|Start|End|Time Zone|Location|Organizer):\s*",
            "",
            block,
            flags=re.IGNORECASE,
        )
        if not block:
            continue
        chunks = re.split(r"(?<=[.!?])\s+(?=[A-Z0-9])", block)
        for chunk in chunks:
            text = _clean_unknown(chunk)
            if text:
                pieces.append(text)
    return pieces


def _split_email_blocks(email_text: str) -> list[str]:
    normalized = email_text.replace("\r\n", "\n").replace("\r", "\n")
    blocks = [block.strip() for block in re.split(r"\n\s*\n+", normalized) if block.strip()]
    return blocks or ([email_text.strip()] if email_text.strip() else [])


def _dedupe(items: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for item in items:
        cleaned = _clean_unknown(item)
        if not cleaned:
            continue
        key = cleaned.lower()
        if key in seen:
            continue
        seen.add(key)
        result.append(cleaned)
    return result


def _matches_any(text: str, patterns: list[str]) -> bool:
    lowered = text.lower()
    return any(re.search(pattern, lowered) for pattern in patterns)


def _email_subject(email: dict, index: int) -> str:
    return _clean_unknown(str(email.get("subject", ""))) or f"Email {index}"


def _email_sender_line(email: dict) -> str:
    return _person_label(email.get("from"))


def _email_received_at(email: dict) -> str:
    return _clean_unknown(str(email.get("receivedDateTime", "")))


def _match_calendar_lines_for_email(email: dict, calendar_items: list[dict]) -> list[str]:
    if not calendar_items:
        return []

    subject = _email_subject(email, 1).lower()
    sender = _email_sender_line(email).lower()
    preview = _email_preview_text(email).lower()
    matches: list[str] = []

    for item in calendar_items:
        line = _format_calendar_digest_item(item)
        if not line:
            continue
        line_lower = line.lower()
        if subject and (subject in line_lower or line_lower[:80] in subject):
            matches.append(line)
            continue
        if sender and sender in line_lower:
            matches.append(line)
            continue
        if preview and any(token in line_lower for token in preview.split()[:8] if len(token) > 4):
            matches.append(line)

    return _dedupe(matches)[:3]


def _email_summary_tags(text: str) -> list[str]:
    lowered = text.lower()
    tags: list[str] = []
    tag_rules = {
        "deadline": [r"\bdue\b", r"\bdeadline\b", r"\bsubmit\b", r"\bsubmission\b"],
        "exam": [r"\bexam\b", r"\bquiz\b", r"\bmidterm\b", r"\bfinal\b", r"\btest\b"],
        "meeting": [r"\bmeeting\b", r"\bconsultation\b", r"\boffice hours?\b", r"\bzoom\b", r"\bteams\b", r"\bcall\b"],
        "event": [r"\bevent\b", r"\bworkshop\b", r"\bseminar\b", r"\btalk\b", r"\bsession\b"],
        "action": [r"\bplease\b", r"\bcomplete\b", r"\breview\b", r"\bread\b", r"\bprepare\b", r"\bupload\b", r"\bfill\b"],
        "reply": [r"\breply\b", r"\brespond\b", r"\brsvp\b", r"\bconfirm\b", r"\blet me know\b"],
        "announcement": [r"\bannouncement\b", r"\bupdate\b", r"\bnotice\b", r"\breminder\b"],
    }
    for tag, patterns in tag_rules.items():
        if any(re.search(pattern, lowered) for pattern in patterns):
            tags.append(tag)
    return tags


def _local_email_summary_record(
    email: dict,
    index: int,
    calendar_items: list[dict],
) -> dict:
    subject = _email_subject(email, index)
    sender = _email_sender_line(email)
    received_at = _email_received_at(email)
    preview = _email_preview_text(email)
    preview = preview[:240].rstrip()
    preview = preview if preview.endswith((".", "!", "?")) else preview + ("..." if preview else "")
    if not preview:
        preview = subject

    related_calendar = _match_calendar_lines_for_email(email, calendar_items)
    merged_text = " ".join(filter(None, [subject, sender, received_at, preview, " ".join(related_calendar)]))
    tags = _email_summary_tags(merged_text)
    needs_reply = "reply" in tags

    return {
        "id": _clean_unknown(str(email.get("id", ""))) or f"email-{index}",
        "subject": subject,
        "from_line": sender,
        "received_at": received_at,
        "summary": preview,
        "tags": tags,
        "needs_reply": needs_reply,
        "related_calendar": related_calendar,
    }


def _normalize_email_summary_record(item: dict, index: int) -> dict:
    if not isinstance(item, dict):
        return {
            "id": f"email-{index}",
            "subject": f"Email {index}",
            "from_line": "",
            "received_at": "",
            "summary": _clean_unknown(str(item)),
            "tags": [],
            "needs_reply": False,
            "related_calendar": [],
        }

    tags_raw = item.get("tags", [])
    if isinstance(tags_raw, list):
        tags = [tag for tag in (_clean_unknown(str(tag)).lower() for tag in tags_raw) if tag in _EMAIL_SUMMARY_TAGS]
    else:
        tags = [tag for tag in (_clean_unknown(str(tags_raw)).lower(),) if tag in _EMAIL_SUMMARY_TAGS]

    related_calendar_raw = item.get("related_calendar", [])
    if isinstance(related_calendar_raw, list):
        related_calendar = _dedupe([str(value) for value in related_calendar_raw])
    else:
        related_calendar = _dedupe([str(related_calendar_raw)])

    needs_reply_value = item.get("needs_reply", False)
    needs_reply = bool(needs_reply_value)

    return {
        "id": _clean_unknown(str(item.get("id", ""))) or f"email-{index}",
        "subject": _clean_unknown(str(item.get("subject", ""))) or f"Email {index}",
        "from_line": _clean_unknown(str(item.get("from_line", item.get("from", "")))),
        "received_at": _clean_unknown(str(item.get("received_at", item.get("receivedDateTime", "")))),
        "summary": _clean_unknown(str(item.get("summary", ""))),
        "tags": tags,
        "needs_reply": needs_reply or ("reply" in tags),
        "related_calendar": related_calendar,
    }


def _normalize_email_summaries(data: dict) -> list[dict]:
    raw_items = data.get("email_summaries", [])
    if not isinstance(raw_items, list):
        return []
    summaries = [
        _normalize_email_summary_record(item, index)
        for index, item in enumerate(raw_items, start=1)
    ]
    return [item for item in summaries if item.get("summary") or item.get("subject")]


def _normalize_digest(data: dict) -> dict:
    digest: dict = {}
    for key in _DIGEST_KEYS:
        value = data.get(key, "" if key == "summary" else [])
        if key == "summary":
            digest[key] = _clean_unknown(str(value))
            continue

        if isinstance(value, list):
            digest[key] = _dedupe([str(item) for item in value])
            continue

        text = _clean_unknown(str(value))
        digest[key] = [text] if text else []
    digest["email_summaries"] = _normalize_email_summaries(data)
    digest["summary"] = _finalize_summary(digest)
    return digest


def _looks_meta_summary(summary: str) -> bool:
    lowered = summary.lower()
    if not lowered:
        return True
    if "academic digest" in lowered or "structured academic daily digest" in lowered:
        return True
    if re.search(r"\b\d+\s+(meeting|meetings|deadline|deadlines|reply|replies|email|emails|event|events|calendar item|calendar items)\b", lowered):
        return True
    if "email summary" in lowered or "calendar items were provided" in lowered or "calendar items were not provided" in lowered:
        return True
    return False


def _finalize_summary(digest: dict) -> str:
    summary = _clean_unknown(str(digest.get("summary", "")))
    if summary and not _looks_meta_summary(summary):
        return summary

    highlights: list[str] = []
    for key in ["deadlines", "exams", "meetings", "upcoming_events", "needs_reply", "action_items"]:
        value = digest.get(key, [])
        if isinstance(value, list):
            for item in value:
                cleaned = _clean_unknown(str(item))
                if cleaned and cleaned not in highlights:
                    highlights.append(cleaned)
                if len(highlights) >= 3:
                    break
        if len(highlights) >= 3:
            break

    return " ".join(highlights[:3]) if highlights else summary


def _output_format() -> dict:
    return {
        "type": "object",
        "properties": {
            "summary": {"type": "string"},
            "upcoming_events": {"type": "array", "items": {"type": "string"}},
            "exams": {"type": "array", "items": {"type": "string"}},
            "meetings": {"type": "array", "items": {"type": "string"}},
            "deadlines": {"type": "array", "items": {"type": "string"}},
            "action_items": {"type": "array", "items": {"type": "string"}},
            "needs_reply": {"type": "array", "items": {"type": "string"}},
            "email_summaries": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "string"},
                        "subject": {"type": "string"},
                        "from_line": {"type": "string"},
                        "received_at": {"type": "string"},
                        "summary": {"type": "string"},
                        "tags": {"type": "array", "items": {"type": "string"}},
                        "needs_reply": {"type": "boolean"},
                        "related_calendar": {"type": "array", "items": {"type": "string"}},
                    },
                    "required": ["summary"],
                },
            },
        },
        "required": ["summary"],
    }


def _person_label(value: dict | None) -> str:
    if not isinstance(value, dict):
        return ""
    email = value.get("emailAddress", {})
    if not isinstance(email, dict):
        return ""
    name = _clean_unknown(str(email.get("name", "")))
    address = _clean_unknown(str(email.get("address", "")))
    if name and address:
        return f"{name} <{address}>"
    return name or address


def _email_preview_text(email: dict) -> str:
    preview = email.get("bodyPreview")
    if preview:
        return _clean_unknown(str(preview))

    body = email.get("body")
    if isinstance(body, dict):
        return _clean_unknown(str(body.get("content", "")))
    if body:
        return _clean_unknown(str(body))

    return _clean_unknown(str(email.get("content") or ""))


def _email_text_from_payload(emails: list[dict]) -> str:
    blocks: list[str] = []
    for idx, email in enumerate(emails, start=1):
        if not isinstance(email, dict):
            continue
        subject = _clean_unknown(str(email.get("subject", "")))
        sender = _person_label(email.get("from"))
        received = _clean_unknown(str(email.get("receivedDateTime", "")))
        preview = _email_preview_text(email)
        is_read = email.get("isRead")
        has_attachments = email.get("hasAttachments")

        if preview and not any([
            subject,
            sender,
            received,
            isinstance(is_read, bool),
            isinstance(has_attachments, bool),
        ]):
            blocks.append(preview)
            continue

        lines = [f"Email {idx}:"]
        if subject:
            lines.append(f"Subject: {subject}")
        if sender:
            lines.append(f"From: {sender}")
        if received:
            lines.append(f"Received: {received}")
        if isinstance(is_read, bool):
            lines.append(f"Read: {'yes' if is_read else 'no'}")
        if isinstance(has_attachments, bool):
            lines.append(f"Attachments: {'yes' if has_attachments else 'no'}")
        if preview:
            lines.append(f"Content: {preview}")
        blocks.append("\n".join(lines))

    return "\n\n".join(blocks)


def _calendar_text_from_payload(calendar_items: list[dict]) -> str:
    blocks: list[str] = []
    for idx, item in enumerate(calendar_items, start=1):
        if not isinstance(item, dict):
            continue
        subject = _clean_unknown(str(item.get("subject", "")))
        start = item.get("start", {}) if isinstance(item.get("start"), dict) else {}
        end = item.get("end", {}) if isinstance(item.get("end"), dict) else {}
        start_at = _clean_unknown(str(start.get("dateTime", "")))
        end_at = _clean_unknown(str(end.get("dateTime", "")))
        tz = _clean_unknown(str(start.get("timeZone") or end.get("timeZone") or ""))
        organizer = _person_label(item.get("organizer"))
        location_raw = item.get("location")
        if isinstance(location_raw, dict):
            location = _clean_unknown(str(location_raw.get("displayName", "")))
        else:
            location = _clean_unknown(str(location_raw or ""))

        lines = [f"Calendar Item {idx}:"]
        if subject:
            lines.append(f"Subject: {subject}")
        if start_at:
            lines.append(f"Start: {start_at}")
        if end_at:
            lines.append(f"End: {end_at}")
        if tz:
            lines.append(f"Time Zone: {tz}")
        if location:
            lines.append(f"Location: {location}")
        if organizer:
            lines.append(f"Organizer: {organizer}")
        blocks.append("\n".join(lines))

    return "\n\n".join(blocks)


def _format_calendar_digest_item(item: dict) -> str:
    if not isinstance(item, dict):
        return ""

    subject = _clean_unknown(str(item.get("subject", ""))) or "Scheduled event"
    start = item.get("start", {}) if isinstance(item.get("start"), dict) else {}
    end = item.get("end", {}) if isinstance(item.get("end"), dict) else {}
    start_at = _clean_unknown(str(start.get("dateTime", "")))
    end_at = _clean_unknown(str(end.get("dateTime", "")))
    tz = _clean_unknown(str(start.get("timeZone") or end.get("timeZone") or ""))
    organizer = _person_label(item.get("organizer"))
    location_raw = item.get("location")
    if isinstance(location_raw, dict):
        location = _clean_unknown(str(location_raw.get("displayName", "")))
    else:
        location = _clean_unknown(str(location_raw or ""))

    parts = [subject]
    if start_at and end_at:
        parts.append(f"from {start_at} to {end_at}")
    elif start_at:
        parts.append(f"at {start_at}")
    elif end_at:
        parts.append(f"until {end_at}")
    if tz:
        parts.append(f"({tz})")
    if location:
        parts.append(f"at {location}")
    if organizer:
        parts.append(f"with {organizer}")

    return _compact(" ".join(parts))


def _merge_calendar_context(digest: dict, calendar_items: list[dict]) -> dict:
    if not calendar_items:
        return digest

    calendar_lines = _dedupe(
        [_format_calendar_digest_item(item) for item in calendar_items]
    )
    if not calendar_lines:
        return digest

    meeting_keywords = [
        "meeting",
        "consultation",
        "office hour",
        "office hours",
        "sync",
        "call",
        "discussion",
        "tutorial",
        "lab",
    ]
    meeting_lines = [
        line for line in calendar_lines if any(keyword in line.lower() for keyword in meeting_keywords)
    ]

    digest["upcoming_events"] = _dedupe(calendar_lines + digest.get("upcoming_events", []))[:6]
    if meeting_lines:
        digest["meetings"] = _dedupe(meeting_lines + digest.get("meetings", []))[:6]
    digest["summary"] = _finalize_summary(digest)
    return digest


def _build_email_summaries_locally(emails: list[dict], calendar_items: list[dict]) -> list[dict]:
    return [
        _local_email_summary_record(email, index, calendar_items)
        for index, email in enumerate(emails, start=1)
        if isinstance(email, dict)
    ]


async def _summarize_emails_with_openai(
    emails: list[dict],
    calendar_items: list[dict],
) -> list[dict]:
    if not emails:
        return []

    email_blocks: list[str] = []
    for index, email in enumerate(emails, start=1):
        subject = _email_subject(email, index)
        sender = _email_sender_line(email)
        received_at = _email_received_at(email)
        preview = _email_preview_text(email)
        related_calendar = _match_calendar_lines_for_email(email, calendar_items)

        lines = [f"Email {index}", f"id: {email.get('id', f'email-{index}')}", f"subject: {subject}"]
        if sender:
            lines.append(f"from_line: {sender}")
        if received_at:
            lines.append(f"received_at: {received_at}")
        if preview:
            lines.append(f"content: {preview}")
        if related_calendar:
            lines.append("related_calendar:")
            lines.extend(f"- {line}" for line in related_calendar)
        email_blocks.append("\n".join(lines))

    prompt = f"""
Summarize each email individually. Return JSON with an `email_summaries` array.

Rules:
- Keep one concise factual summary per email.
- Do not merge different emails together.
- Preserve any concrete meeting, deadline, exam, or reply-needed details.
- Tags must only come from this list: {", ".join(_EMAIL_SUMMARY_TAGS)}.
- `needs_reply` should be true only if the message clearly asks for a response or confirmation.
- `related_calendar` should contain only clearly matching calendar context that was provided.

EMAILS:
{chr(10).join(email_blocks)}
"""

    result = await generate_json_fallback(
        prompt,
        system_instruction="You summarize each email individually and output valid JSON only.",
    )
    if not isinstance(result, dict):
        raise RuntimeError("OpenAI per-email summary fallback returned a non-dict result.")
    return _normalize_email_summaries(result)


async def _attach_email_summaries(
    digest: dict,
    emails: list[dict],
    calendar_items: list[dict],
) -> dict:
    if digest.get("email_summaries"):
        return digest

    try:
        digest["email_summaries"] = await _summarize_emails_with_openai(emails, calendar_items)
    except Exception as openai_error:
        log.warning(f"OpenAI per-email summary fallback failed, using local summaries: {openai_error}")
        digest["email_summaries"] = _build_email_summaries_locally(emails, calendar_items)

    return digest


def _build_mail_prompt(
    emails: list[dict],
    calendar_items: list[dict],
    timezone: str,
    max_items: int,
) -> str:
    email_block = _email_text_from_payload(emails) or "(no email content provided)"
    calendar_block = _calendar_text_from_payload(calendar_items) or "(no calendar items provided)"
    return f"""
Summarize these Outlook emails and calendar items into a structured academic daily digest.

Timezone: {timezone}
Max items per section: {max_items}

Critical formatting rules:
- Do not summarize abstractly as counts like "1 email mentions a meeting" or "2 emails discuss deadlines".
- Preserve concrete details from the source as directly as possible.
- If a meeting, event, exam, deadline, or consultation has a date, time, location, organizer, or course code, include it.
- If calendar items are present, trust their exact times and locations.
- Keep each list item short, but keep the important factual detail.
- The summary should be 1-3 concrete sentences, not a generic meta-description.

Focus on:
- deadlines
- quizzes or exams
- meetings
- upcoming events
- concrete action items
- anything that needs a reply

EMAILS:
{email_block}

CALENDAR ITEMS:
{calendar_block}
"""


def _build_source_text(emails: list[dict], calendar_items: list[dict]) -> str:
    email_block = _email_text_from_payload(emails) or "(no email content provided)"
    calendar_block = _calendar_text_from_payload(calendar_items) or "(no calendar items provided)"
    return f"EMAILS:\n{email_block}\n\nCALENDAR ITEMS:\n{calendar_block}"


def _build_raw_text_prompt(
    email_text: str,
    timezone: str,
    max_items: int,
) -> str:
    return f"""
Summarize this pasted email content into a structured academic daily digest.

Timezone: {timezone}
Max items per section: {max_items}

Critical formatting rules:
- Do not summarize abstractly as counts like "1 email mentions a meeting".
- Re-state the actual content as directly as possible.
- If the text contains a meeting, event, deadline, quiz, exam, consultation, or reply request with a date, day, time, location, or person, include those details explicitly.
- Keep each list item concise, but preserve concrete factual detail from the source.
- The summary should be 1-3 concrete sentences, not a vague meta-summary.

PASTED EMAIL CONTENT:
{email_text}
"""


async def _summarize_via_zo_ask(
    emails: list[dict],
    calendar_items: list[dict],
    timezone: str,
    max_items: int,
) -> dict:
    token = _get_zo_token()
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"

    payload = {
        "input": _build_mail_prompt(emails, calendar_items, timezone, max_items),
        "model_name": ZO_MODEL_NAME,
        "output_format": _output_format(),
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(ZO_API_URL, json=payload, headers=headers)
        try:
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            body = response.text.strip()
            if body:
                raise RuntimeError(f"{exc}. Response body: {body}") from exc
            raise
        data = response.json()
        return _normalize_digest(data.get("output", data.get("result", data)))


async def _summarize_raw_text_via_zo_ask(
    email_text: str,
    timezone: str,
    max_items: int,
) -> dict:
    token = _get_zo_token()
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"

    payload = {
        "input": _build_raw_text_prompt(email_text, timezone, max_items),
        "model_name": ZO_MODEL_NAME,
        "output_format": _output_format(),
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(ZO_API_URL, json=payload, headers=headers)
        try:
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            body = response.text.strip()
            if body:
                raise RuntimeError(f"{exc}. Response body: {body}") from exc
            raise
        data = response.json()
        return _normalize_digest(data.get("output", data.get("result", data)))


async def _summarize_via_legacy(
    emails: list[dict],
    calendar_items: list[dict],
    timezone: str,
    max_items: int,
) -> dict:
    shared_secret = os.getenv("EMAIL_SUMMARY_SHARED_SECRET", "").strip()
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    if shared_secret:
        headers["Authorization"] = f"Bearer {shared_secret}"

    payload = {
        "timezone": timezone,
        "mode": "daily-digest",
        "max_items": max_items,
        "emails": emails,
        "calendar_items": calendar_items,
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(ZO_LEGACY_API_URL, json=payload, headers=headers)
        try:
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            body = response.text.strip()
            if body:
                raise RuntimeError(f"{exc}. Response body: {body}") from exc
            raise
        data = response.json()
        return _normalize_digest(data.get("result", data))


async def _parse_with_openai(email_text: str) -> dict:
    prompt = f"""
Extract an academic email digest from the following email text.

Return a JSON object with exactly these fields:
- summary: string
- upcoming_events: string[]
- exams: string[]
- meetings: string[]
- deadlines: string[]
- action_items: string[]
- needs_reply: string[]
- email_summaries: object[]

Rules:
- Be concise and factual.
- Prefer academic obligations, class events, quizzes, exams, assignments, project milestones, meetings, and reply-needed items.
- If a section has no items, return an empty array.
- Do not invent dates or details that are not present.
- For email_summaries, summarize each distinct email block individually.

EMAIL TEXT:
{email_text}
"""
    result = await generate_json_fallback(
        prompt,
        system_instruction="You extract structured academic email digests and output valid JSON only.",
    )
    if not isinstance(result, dict):
        raise RuntimeError("OpenAI ZO fallback returned a non-dict result.")
    return _normalize_digest(result)


def _parse_locally(email_text: str) -> dict:
    candidates = _split_candidates(email_text)
    if not candidates:
        return {
            "summary": "",
            "upcoming_events": [],
            "exams": [],
            "meetings": [],
            "deadlines": [],
            "action_items": [],
            "needs_reply": [],
        }

    deadline_patterns = [
        r"\bdue\b",
        r"\bdeadline\b",
        r"\bsubmit\b",
        r"\bsubmission\b",
        r"\bturn in\b",
    ]
    exam_patterns = [
        r"\bexam\b",
        r"\bquiz\b",
        r"\bmidterm\b",
        r"\bfinal\b",
        r"\btest\b",
    ]
    meeting_patterns = [
        r"\bmeeting\b",
        r"\bzoom\b",
        r"\bteams\b",
        r"\bconsultation\b",
        r"\boffice hours?\b",
        r"\bcall\b",
    ]
    reply_patterns = [
        r"\breply\b",
        r"\brespond\b",
        r"\brsvp\b",
        r"\bconfirm\b",
        r"\blet me know\b",
        r"\baction required\b",
    ]
    action_patterns = [
        r"\bplease\b",
        r"\bcomplete\b",
        r"\bsubmit\b",
        r"\breview\b",
        r"\bread\b",
        r"\bprepare\b",
        r"\battend\b",
        r"\bupload\b",
        r"\bfill\b",
        r"\bconfirm\b",
    ]
    time_patterns = [
        r"\btomorrow\b",
        r"\btoday\b",
        r"\bnext week\b",
        r"\bmon(day)?\b",
        r"\btue(s(day)?)?\b",
        r"\bwed(nesday)?\b",
        r"\bthu(rs(day)?)?\b",
        r"\bfri(day)?\b",
        r"\bsat(urday)?\b",
        r"\bsun(day)?\b",
        r"\b\d{1,2}:\d{2}\b",
        r"\b\d{1,2}(am|pm)\b",
        r"\bjan\b|\bfeb\b|\bmar\b|\bapr\b|\bmay\b|\bjun\b|\bjul\b|\baug\b|\bsep\b|\boct\b|\bnov\b|\bdec\b",
    ]

    deadlines = [c for c in candidates if _matches_any(c, deadline_patterns)]
    exams = [c for c in candidates if _matches_any(c, exam_patterns)]
    meetings = [c for c in candidates if _matches_any(c, meeting_patterns)]
    needs_reply = [c for c in candidates if _matches_any(c, reply_patterns)]
    action_items = [c for c in candidates if _matches_any(c, action_patterns)]

    upcoming_events = _dedupe([c for c in candidates if _matches_any(c, time_patterns)])

    highlights = _dedupe(deadlines[:2] + exams[:1] + meetings[:1] + needs_reply[:1])
    summary = _compact(" ".join(highlights[:3])) or _compact(" ".join(_dedupe(candidates[:2])))

    return _normalize_digest(
        {
            "summary": summary,
            "upcoming_events": upcoming_events[:6],
            "exams": exams[:6],
            "meetings": meetings[:6],
            "deadlines": deadlines[:6],
            "action_items": action_items[:6],
            "needs_reply": needs_reply[:6],
        }
    )


async def summarize_mail(
    emails: list[dict],
    calendar_items: list[dict] | None = None,
    timezone: str = "Asia/Singapore",
    max_items: int = 25,
) -> dict:
    calendar_items = calendar_items or []

    try:
        digest = await _summarize_via_zo_ask(emails, calendar_items, timezone, max_items)
        return await _attach_email_summaries(digest, emails, calendar_items)
    except Exception as ask_error:
        log.warning(f"ZO ask endpoint failed, trying legacy email-summary endpoint: {ask_error}")

    try:
        digest = await _summarize_via_legacy(emails, calendar_items, timezone, max_items)
        return await _attach_email_summaries(digest, emails, calendar_items)
    except Exception as legacy_error:
        log.warning(f"Legacy email-summary endpoint failed, using local fallbacks: {legacy_error}")

    source_text = _build_source_text(emails, calendar_items)
    local_digest = _merge_calendar_context(_parse_locally(source_text), calendar_items)
    local_digest["email_summaries"] = _build_email_summaries_locally(emails, calendar_items)
    if local_digest.get("summary") or any(local_digest.get(key) for key in _DIGEST_KEYS[1:]):
        return local_digest

    try:
        digest = await _parse_with_openai(source_text)
        return await _attach_email_summaries(digest, emails, calendar_items)
    except Exception as openai_error:
        log.warning(f"OpenAI ZO fallback failed after deterministic parser: {openai_error}")
        return local_digest


async def parse_emails(email_text: str) -> dict:
    """
    Wrap pasted raw email content as a single message and send it through the
    structured mail path. This is faster and more reliable than the raw-text
    ask route while still preserving concrete details via the stricter prompt
    and summary refinement.
    """
    pseudo_emails = [
        {
            "id": f"manual-email-input-{idx}",
            "bodyPreview": block,
        }
        for idx, block in enumerate(_split_email_blocks(email_text), start=1)
    ]

    try:
        return await summarize_mail(pseudo_emails, [])
    except Exception as structured_error:
        log.warning(f"Structured ZO fallback failed for pasted text, using local fallbacks: {structured_error}")

    local_digest = _parse_locally(email_text)
    if local_digest.get("summary") or any(local_digest.get(key) for key in _DIGEST_KEYS[1:]):
        return local_digest

    try:
        return await _parse_with_openai(email_text)
    except Exception as openai_error:
        log.warning(f"OpenAI ZO fallback failed after deterministic parser: {openai_error}")
        return local_digest
