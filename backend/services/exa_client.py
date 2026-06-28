"""
Exa course discovery client.

Uses Exa's search endpoint with structured output to discover NTU module data
from public web pages while keeping the app's existing catalog shape stable.
"""

from __future__ import annotations

import logging
import os
import re
from typing import Any
from urllib.parse import parse_qs, urlparse

import httpx

log = logging.getLogger("exa_client")

EXA_SEARCH_URL = os.getenv("EXA_API_URL", "https://api.exa.ai/search")
EXA_INCLUDE_DOMAINS = [
    "ntu.edu.sg",
    "wis.ntu.edu.sg",
    "wish.wis.ntu.edu.sg",
    "ccds.ntu.edu.sg",
    "scse.ntu.edu.sg",
    "stars.ntu.edu.sg",
]

EXA_JOB_DOMAINS = [
    "linkedin.com",
    "boards.greenhouse.io",
    "jobs.ashbyhq.com",
    "lever.co",
    "myworkdayjobs.com",
    "indeed.com",
    "wellfound.com",
]


def _get_api_key() -> str:
    return os.getenv("EXA_API_KEY", "").strip()


def _compact(text: str | None) -> str:
    return re.sub(r"\s+", " ", (text or "")).strip()


def _clean_unknown(value: Any) -> str:
    text = _compact(str(value))
    lowered = text.lower()
    if lowered in {"", "n/a", "na", "none", "null", "unknown", "not available", "not specified", "unspecified"}:
        return ""
    if "not available" in lowered and len(text) > 24:
        return ""
    return text


def _normalize_time(value: Any) -> str:
    text = _clean_unknown(value)
    if not text:
        return ""

    digits = re.sub(r"\D", "", text)
    if len(digits) == 4:
        return f"{digits[:2]}:{digits[2:]}"

    return text


def _normalize_day(value: Any) -> str:
    text = _clean_unknown(value).upper().replace(".", "")
    aliases = {
        "MONDAY": "MON",
        "TUESDAY": "TUE",
        "WEDNESDAY": "WED",
        "THURSDAY": "THU",
        "FRIDAY": "FRI",
        "SATURDAY": "SAT",
        "SUNDAY": "SUN",
    }
    return aliases.get(text, text)


def _normalize_term_label(value: str) -> str:
    text = _compact(value)
    if not text:
        return ""

    semi_match = re.fullmatch(r"(\d{4});([1-3])", text)
    if semi_match:
        acad = int(semi_match.group(1))
        return f"AY{acad}/{str(acad + 1)[-2:]} Semester {semi_match.group(2)}"

    ay_match = re.search(r"AY\s*(\d{4})\s*/\s*(\d{2,4}).*?Semester\s*([1-3])", text, re.IGNORECASE)
    if ay_match:
        return f"AY{ay_match.group(1)}/{ay_match.group(2)[-2:]} Semester {ay_match.group(3)}"

    sem_match = re.search(r"(\d{4}).*?Semester\s*([1-3])", text, re.IGNORECASE)
    if sem_match:
        acad = int(sem_match.group(1))
        return f"AY{acad}/{str(acad + 1)[-2:]} Semester {sem_match.group(2)}"

    return text


def _term_from_url(url: str) -> str:
    if not url:
        return ""

    parsed = urlparse(url)
    query = parse_qs(parsed.query)
    acad = _compact(query.get("Acad", [""])[0])
    semester = _compact(query.get("Semester", [""])[0])
    if re.fullmatch(r"\d{4}", acad) and semester in {"1", "2", "3"}:
        return _normalize_term_label(f"{acad};{semester}")
    return ""


def _coerce_credits(value: Any, fallback: int) -> int:
    if isinstance(value, int):
        return value if value > 0 else fallback
    if isinstance(value, float):
        return int(value) if value > 0 else fallback
    if isinstance(value, str):
        match = re.search(r"\d+", value)
        if match:
            parsed = int(match.group(0))
            if parsed > 0:
                return parsed
    return fallback


def _normalize_string_list(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    items: list[str] = []
    for item in value:
        text = _compact(str(item))
        if text:
            items.append(text)
    return items


def _normalize_resources(value: Any) -> list[dict[str, str]]:
    if not isinstance(value, list):
        return []

    resources: list[dict[str, str]] = []
    seen: set[str] = set()
    for item in value:
        if not isinstance(item, dict):
            continue
        title = _compact(str(item.get("title", "")))
        url = _compact(str(item.get("url", "")))
        if not title or not url or url in seen:
            continue
        seen.add(url)
        resources.append({"title": title, "url": url})

    return resources


def _extract_output_payload(data: dict[str, Any]) -> dict[str, Any]:
    output = data.get("output")
    if not isinstance(output, dict):
        return {}

    content = output.get("content")
    if isinstance(content, dict):
        return content

    return output


def _extract_grounding_urls(data: dict[str, Any]) -> list[str]:
    output = data.get("output")
    if not isinstance(output, dict):
        return []

    urls: list[str] = []
    seen: set[str] = set()
    for field in output.get("grounding", []):
        if not isinstance(field, dict):
            continue
        for citation in field.get("citations", []):
            if not isinstance(citation, dict):
                continue
            url = _compact(str(citation.get("url", "")))
            if url and url not in seen:
                seen.add(url)
                urls.append(url)
    return urls


def _slug(text: str) -> str:
    value = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return value or "item"


def _source_from_url(url: str) -> str:
    host = urlparse(url).netloc.lower().replace("www.", "")
    if not host:
        return "Exa live search"

    labels = {
        "linkedin.com": "LinkedIn",
        "boards.greenhouse.io": "Greenhouse",
        "jobs.ashbyhq.com": "Ashby",
        "lever.co": "Lever",
        "myworkdayjobs.com": "Workday",
        "indeed.com": "Indeed",
        "wellfound.com": "Wellfound",
    }
    for domain, label in labels.items():
        if host == domain or host.endswith(f".{domain}"):
            return label
    return host


class ExaClient:
    def __init__(self) -> None:
        self.client = httpx.AsyncClient(timeout=30.0)
        self._module_cache: dict[str, dict[str, Any]] = {}
        self._section_cache: dict[str, list[dict[str, Any]]] = {}

    def is_configured(self) -> bool:
        return bool(_get_api_key())

    def _headers(self) -> dict[str, str]:
        api_key = _get_api_key()
        if not api_key:
            raise RuntimeError("EXA_API_KEY not set.")
        return {
            "x-api-key": api_key,
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    async def _search(self, payload: dict[str, Any]) -> dict[str, Any]:
        response = await self.client.post(
            EXA_SEARCH_URL,
            json=payload,
            headers=self._headers(),
        )
        response.raise_for_status()
        return response.json()

    @staticmethod
    def _module_schema() -> dict[str, Any]:
        return {
            "type": "object",
            "additionalProperties": False,
            "properties": {
                "course_id": {"type": "string"},
                "name": {"type": "string"},
                "credits": {"type": "integer"},
                "description": {"type": "string"},
                "prerequisites": {
                    "type": "array",
                    "items": {"type": "string"},
                },
                "resources": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "additionalProperties": False,
                        "properties": {
                            "title": {"type": "string"},
                            "url": {"type": "string"},
                        },
                        "required": ["title", "url"],
                    },
                },
            },
            "required": ["course_id", "name", "credits", "description", "prerequisites", "resources"],
        }

    @staticmethod
    def _job_schema() -> dict[str, Any]:
        return {
            "type": "object",
            "additionalProperties": False,
            "properties": {
                "title": {"type": "string"},
                "company": {"type": "string"},
                "location": {"type": "string"},
                "level": {"type": "string"},
                "salary": {"type": "string"},
                "url": {"type": "string"},
                "summary": {"type": "string"},
                "required_skills": {
                    "type": "array",
                    "items": {"type": "string"},
                },
                "preferred_skills": {
                    "type": "array",
                    "items": {"type": "string"},
                },
            },
            "required": [
                "title",
                "company",
                "location",
                "level",
                "salary",
                "url",
                "summary",
                "required_skills",
                "preferred_skills",
            ],
        }

    @staticmethod
    def _section_schema() -> dict[str, Any]:
        return {
            "type": "object",
            "additionalProperties": False,
            "properties": {
                "index": {"type": "string"},
                "section_id": {"type": "string"},
                "class_type": {"type": "string"},
                "day": {"type": "string"},
                "start_time": {"type": "string"},
                "end_time": {"type": "string"},
                "venue": {"type": "string"},
                "weeks": {"type": "string"},
                "instructor": {"type": "string"},
            },
            "required": [
                "index",
                "section_id",
                "class_type",
                "day",
                "start_time",
                "end_time",
                "venue",
                "weeks",
                "instructor",
            ],
        }

    def _normalize_module(
        self,
        raw: dict[str, Any],
        *,
        fallback_course_id: str = "",
        fallback_name: str = "",
        fallback_credits: int = 3,
        fallback_description: str = "",
        source_urls: list[str] | None = None,
    ) -> dict[str, Any]:
        course_id = _compact(str(raw.get("course_id", fallback_course_id))).upper()
        name = _compact(str(raw.get("name", fallback_name)))
        description = _compact(str(raw.get("description", fallback_description)))
        credits = _coerce_credits(raw.get("credits"), fallback_credits)
        prerequisites = _normalize_string_list(raw.get("prerequisites"))
        resources = _normalize_resources(raw.get("resources"))

        module = {
            "course_id": course_id or fallback_course_id.upper(),
            "name": name or fallback_name,
            "credits": credits,
            "description": description or fallback_description,
            "prerequisites": prerequisites,
            "resources": resources,
        }
        if source_urls:
            module["source_urls"] = source_urls
        return module

    def _normalize_job(self, raw: dict[str, Any], index: int) -> dict[str, Any] | None:
        title = _compact(str(raw.get("title", "")))
        company = _compact(str(raw.get("company", "")))
        url = _compact(str(raw.get("url", "")))
        if not title or not company or not url:
            return None

        level = _compact(str(raw.get("level", ""))) or "Live via Exa"
        lower_level = level.lower()
        job_type = "internship" if "intern" in lower_level else "full-time" if "new grad" in lower_level or "full-time" in lower_level else "role"

        return {
            "id": f"exa-{_slug(company)}-{_slug(title)}-{index}",
            "title": title,
            "company": company,
            "location": _compact(str(raw.get("location", ""))) or "Unspecified",
            "type": job_type,
            "level": level,
            "salary": _compact(str(raw.get("salary", ""))) or "Not listed",
            "source": _source_from_url(url),
            "url": url,
            "summary": _compact(str(raw.get("summary", ""))) or "Live role discovered via Exa search.",
            "required_skills": _normalize_string_list(raw.get("required_skills")),
            "preferred_skills": _normalize_string_list(raw.get("preferred_skills")),
            "tags": [],
        }

    def _normalize_section(
        self,
        raw: dict[str, Any],
        *,
        course_id: str,
        fallback_term: str = "",
        source_url: str = "",
    ) -> dict[str, Any] | None:
        section_index = _clean_unknown(raw.get("index", ""))
        section_id = _clean_unknown(raw.get("section_id", "")).upper()
        class_type = _clean_unknown(raw.get("class_type", "")).upper()
        day = _normalize_day(raw.get("day", ""))
        start_time = _normalize_time(raw.get("start_time", ""))
        end_time = _normalize_time(raw.get("end_time", ""))
        venue = _clean_unknown(raw.get("venue", "")).upper()
        weeks = _clean_unknown(raw.get("weeks", ""))
        instructor = _clean_unknown(raw.get("instructor", ""))
        term = _normalize_term_label(str(raw.get("term", ""))) or fallback_term

        if len(class_type) > 40:
            return None

        if not class_type:
            return None

        if not (day or start_time or end_time or venue or weeks):
            return None

        return {
            "course_id": course_id,
            "index": section_index,
            "section_id": section_id,
            "class_type": class_type,
            "day": day,
            "start_time": start_time,
            "end_time": end_time,
            "venue": venue,
            "weeks": weeks,
            "term": term,
            "instructor": instructor,
            "source_url": source_url,
        }

    async def search_courses(self, query: str, num_results: int = 5) -> list[dict[str, Any]]:
        clean_query = _compact(query)
        if not clean_query:
            return []

        payload = {
            "query": f"{clean_query} NTU Singapore module",
            "includeDomains": EXA_INCLUDE_DOMAINS,
            "numResults": max(1, min(num_results, 10)),
            "type": "fast",
            "contents": {
                "highlights": True,
                "summary": True,
            },
            "systemPrompt": (
                "Return NTU Singapore academic modules only. Prefer official NTU pages. "
                "Extract the official module code, full title, AUs/credits as an integer, "
                "and a concise factual description."
            ),
            "outputSchema": {
                "type": "object",
                "additionalProperties": False,
                "properties": {
                    "modules": {
                        "type": "array",
                        "items": self._module_schema(),
                    },
                },
                "required": ["modules"],
            },
        }

        data = await self._search(payload)
        content = _extract_output_payload(data)
        raw_modules = content.get("modules", []) if isinstance(content, dict) else []

        modules: list[dict[str, Any]] = []
        for raw in raw_modules:
            if not isinstance(raw, dict):
                continue
            normalized = self._normalize_module(raw)
            if normalized["course_id"] and normalized["name"]:
                modules.append(normalized)

        return modules

    async def search_jobs(self, query: str, num_results: int = 10) -> list[dict[str, Any]]:
        clean_query = _compact(query)
        if not clean_query:
            return []

        payload = {
            "query": clean_query,
            "includeDomains": EXA_JOB_DOMAINS,
            "numResults": max(1, min(num_results * 2, 20)),
            "type": "fast",
            "contents": {
                "highlights": True,
                "summary": True,
            },
            "systemPrompt": (
                "Return current software, data, ML, systems, security, product, or quant internships and "
                "entry-level jobs that best match the search query. Prefer actual job board pages or public "
                "social hiring posts. Avoid duplicates and expired postings. Extract concise summaries plus "
                "3-6 required skills and 0-4 preferred skills. Skills must be short, atomic, and technical "
                "(for example: Python, Data Structures, Algorithms, Distributed Systems, AWS). "
                "Do not include degree requirements, graduation year, availability windows, visa status, "
                "communication, or generic soft skills as skills."
            ),
            "outputSchema": {
                "type": "object",
                "additionalProperties": False,
                "properties": {
                    "jobs": {
                        "type": "array",
                        "items": self._job_schema(),
                    },
                },
                "required": ["jobs"],
            },
        }

        data = await self._search(payload)
        content = _extract_output_payload(data)
        raw_jobs = content.get("jobs", []) if isinstance(content, dict) else []

        jobs: list[dict[str, Any]] = []
        seen_urls: set[str] = set()
        for index, raw in enumerate(raw_jobs):
            if not isinstance(raw, dict):
                continue
            normalized = self._normalize_job(raw, index)
            if not normalized:
                continue
            if normalized["url"] in seen_urls:
                continue
            seen_urls.add(normalized["url"])
            jobs.append(normalized)

        return jobs[:num_results]

    async def fetch_module(self, course_id: str, name: str = "") -> dict[str, Any]:
        normalized_id = _compact(course_id).upper()
        if not normalized_id:
            return {}

        if normalized_id in self._module_cache:
            return dict(self._module_cache[normalized_id])

        query_name = _compact(name)
        query = f"NTU Singapore {normalized_id}"
        if query_name:
            query += f" {query_name}"
        query += " module course content credits prerequisites"

        payload = {
            "query": query,
            "includeDomains": EXA_INCLUDE_DOMAINS,
            "numResults": 3,
            "type": "fast",
            "contents": {
                "highlights": True,
                "summary": True,
            },
            "systemPrompt": (
                "Return one NTU Singapore academic module matching the requested code. "
                "Prefer official NTU sources. If credits are expressed as AUs, return that "
                "number as the integer credits value. Keep the description to one or two sentences."
            ),
            "outputSchema": self._module_schema(),
        }

        data = await self._search(payload)
        content = _extract_output_payload(data)
        if not isinstance(content, dict):
            return {}

        module = self._normalize_module(
            content,
            fallback_course_id=normalized_id,
            fallback_name=query_name,
            source_urls=_extract_grounding_urls(data),
        )
        self._module_cache[normalized_id] = dict(module)
        return module

    async def fetch_sections(self, course_id: str, name: str = "", term: str = "") -> list[dict[str, Any]]:
        normalized_id = _compact(course_id).upper()
        if not normalized_id:
            return []

        normalized_term = _normalize_term_label(term)
        cache_key = f"{normalized_id}|{normalized_term}"
        if cache_key in self._section_cache:
            return [dict(row) for row in self._section_cache[cache_key]]

        query_name = _compact(name)
        base_query = f"NTU Singapore {normalized_id}"
        if query_name:
            base_query += f" {query_name}"
        base_query += " class schedule timetable lecture tutorial lab index"

        query_candidates = [base_query]
        if normalized_term:
            query_candidates.insert(0, f"{base_query} {normalized_term}")

        sections: list[dict[str, Any]] = []

        for query in query_candidates:
            payload = {
                "query": query,
                "includeDomains": EXA_INCLUDE_DOMAINS,
                "numResults": 3,
                "type": "fast",
                "contents": {
                    "highlights": True,
                    "summary": True,
                    "text": {"maxCharacters": 1500},
                },
                "systemPrompt": (
                    "Return NTU Singapore class schedule rows for the requested module from public NTU timetable pages. "
                    "Use one object per scheduled meeting row. section_id should be the timetable group label such as "
                    "PT1, T1, G1, or similar. Do not invent instructors."
                ),
                "outputSchema": {
                    "type": "object",
                    "additionalProperties": False,
                    "properties": {
                        "sections": {
                            "type": "array",
                            "items": self._section_schema(),
                        },
                    },
                    "required": ["sections"],
                },
            }

            data = await self._search(payload)
            content = _extract_output_payload(data)
            raw_sections = content.get("sections", []) if isinstance(content, dict) else []
            source_urls = _extract_grounding_urls(data)
            primary_source_url = source_urls[0] if source_urls else ""
            fallback_term = _term_from_url(primary_source_url) or normalized_term

            seen: set[tuple[str, ...]] = set()
            parsed_rows: list[dict[str, Any]] = []
            for raw in raw_sections:
                if not isinstance(raw, dict):
                    continue
                normalized = self._normalize_section(
                    raw,
                    course_id=normalized_id,
                    fallback_term=fallback_term,
                    source_url=primary_source_url,
                )
                if not normalized:
                    continue
                key = (
                    normalized["index"],
                    normalized["section_id"],
                    normalized["class_type"],
                    normalized["day"],
                    normalized["start_time"],
                    normalized["end_time"],
                    normalized["venue"],
                    normalized["weeks"],
                    normalized["term"],
                )
                if key in seen:
                    continue
                seen.add(key)
                parsed_rows.append(normalized)

            if parsed_rows:
                sections = parsed_rows
                break

        self._section_cache[cache_key] = [dict(row) for row in sections]
        return sections

    async def close(self) -> None:
        await self.client.aclose()


exa_client = ExaClient()
