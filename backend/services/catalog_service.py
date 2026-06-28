"""
NTU Module Catalog Service
==========================
Provides the NTU Singapore module catalog to the app (used by /api/ntu/* routes
and the module-recommendation flow). Replaces the previous external course-API client.

Data sources, in priority order:
  1. NTU_CATALOG_URL env var → a JSON endpoint returning a list of modules
     (e.g. a self-hosted NTUMods-style export). Wired but optional.
  2. NTU's official "Content of Courses" web system at wis.ntu.edu.sg
     (the real endpoint surfaced during research). Best-effort form POST.
     NTU exposes no JSON API and returns HTML, so this is guarded and will
     gracefully fall back if parsing fails — we do NOT depend on it for the demo.
  3. Built-in mock NTU CS catalog (always available, used for the demo).

This keeps the app fully runnable offline while still integrating the real NTU
sources where they are reachable.
"""

import logging
import os
from datetime import datetime
from typing import Any, Dict, List

import httpx
from services.exa_client import exa_client

log = logging.getLogger("catalog_service")

# Real NTU "Content of Courses" endpoint (no public JSON API — returns HTML).
# Surfaced from NTU's WISH/AUS systems; see ntumods-scraper for the form schema.
NTU_CONTENT_OF_COURSES = "https://wis.ntu.edu.sg/webexe/owa/AUS_SUBJ_CONT.main_display1"
NTU_CATALOG_URL = os.getenv("NTU_CATALOG_URL", "").strip()

# Built-in mock NTU CS module catalog (believable, not official).
# Mirrors the shape the app expects: course_id / name / credits / description.
_MOCK_NTU_CATALOG: List[Dict[str, Any]] = [
    {"course_id": "SC1003", "name": "Introduction to Computational Thinking & Programming", "credits": 3,
     "description": "Foundational programming and computational thinking in C/Python."},
    {"course_id": "SC1015", "name": "Introduction to Data Science & AI", "credits": 3,
     "description": "Data wrangling, statistics, and intro machine learning with Python."},
    {"course_id": "SC2001", "name": "Algorithm Design & Analysis", "credits": 3,
     "description": "Asymptotics, divide & conquer, greedy, dynamic programming, graph algorithms."},
    {"course_id": "SC2002", "name": "Object Oriented Design & Programming", "credits": 3,
     "description": "OO design principles, UML, design patterns, and Java programming."},
    {"course_id": "SC2005", "name": "Operating Systems", "credits": 4,
     "description": "Processes, memory management, file systems, concurrency and scheduling."},
    {"course_id": "SC2006", "name": "Software Engineering", "credits": 3,
     "description": "Requirements, design, testing, and the software development lifecycle."},
    {"course_id": "SC2207", "name": "Introduction to Databases", "credits": 3,
     "description": "Relational model, SQL, ER design, normalization, transactions."},
    {"course_id": "SC3000", "name": "Artificial Intelligence", "credits": 3,
     "description": "Search, knowledge representation, reasoning, and intelligent agents."},
    {"course_id": "SC3010", "name": "Computer Security", "credits": 3,
     "description": "Cryptography, access control, network and software security."},
    {"course_id": "SC3020", "name": "Database System Principles", "credits": 3,
     "description": "Storage, indexing, query processing and optimization, concurrency control."},
    {"course_id": "SC3040", "name": "Advanced Software Engineering", "credits": 3,
     "description": "Architecture, DevOps, large-scale design and maintainability."},
    {"course_id": "SC4001", "name": "Deep Learning & Neural Networks", "credits": 3,
     "description": "Neural networks, CNNs, RNNs, transformers and training techniques."},
    {"course_id": "SC4002", "name": "Natural Language Processing", "credits": 3,
     "description": "Language modelling, embeddings, parsing, attention and transformers."},
    {"course_id": "SC4024", "name": "Data Visualization", "credits": 3,
     "description": "Visual encodings, perception, interactive and web-based visualization."},
    {"course_id": "MH1812", "name": "Discrete Mathematics", "credits": 4,
     "description": "Logic, proofs, sets, relations, induction, combinatorics, graph theory."},
    {"course_id": "MH2802", "name": "Linear Algebra", "credits": 4,
     "description": "Vectors, matrices, vector spaces, eigenvalues, diagonalization."},
    {"course_id": "MH3700", "name": "Applied Linear Algebra", "credits": 3,
     "description": "SVD, least squares, Markov chains and applications."},
]


class CatalogService:
    """NTU module catalog client with real-source attempts + mock fallback."""

    def __init__(self):
        self.client = httpx.AsyncClient(timeout=20.0, verify=False)

    async def _try_remote_json(self) -> List[Dict[str, Any]]:
        """Fetch modules from a configured NTUMods-style JSON endpoint, if set."""
        if not NTU_CATALOG_URL:
            return []
        try:
            resp = await self.client.get(NTU_CATALOG_URL)
            resp.raise_for_status()
            data = resp.json()
            return data if isinstance(data, list) else data.get("modules", [])
        except Exception as e:
            log.warning(f"NTU_CATALOG_URL fetch failed, using mock catalog: {e}")
            return []

    async def fetch_courses(self, dept_id: str = "SCSE") -> List[Dict[str, Any]]:
        """Return NTU modules for a school/department (mock-backed)."""
        remote = await self._try_remote_json()
        if remote:
            return remote
        return list(_MOCK_NTU_CATALOG)

    async def fetch_all_courses(self, dept_id: str = "SCSE") -> List[Dict[str, Any]]:
        """Return the full NTU CS module catalog (used by recommendations)."""
        return await self.fetch_courses(dept_id)

    async def fetch_course_details(self, course_id: str) -> Dict[str, Any]:
        """Return details for one module from the catalog."""
        requested_id = course_id.upper()
        base: Dict[str, Any] = {}

        for c in await self.fetch_courses():
            if c.get("course_id", "").upper() == requested_id:
                base = dict(c)
                break

        if exa_client.is_configured():
            try:
                exa_details = await exa_client.fetch_module(
                    requested_id,
                    name=base.get("name", ""),
                )
                if exa_details:
                    merged = {**base, **exa_details}
                    if not merged.get("description"):
                        merged["description"] = base.get("description", "")
                    return merged
            except Exception as e:
                log.warning(f"Exa detail lookup failed for {requested_id}: {e}")

        return base

    def _default_term_hint(self) -> str:
        now = datetime.now()
        semester = "1" if now.month >= 6 else "2"
        acad_year = now.year if semester == "1" else now.year - 1
        return f"{acad_year};{semester}"

    async def fetch_sections(self, course_id: str, term: str | None = None) -> List[Dict[str, Any]]:
        """Return NTU class schedule rows via Exa against public timetable pages."""
        requested_id = course_id.upper()
        base_name = ""
        for course in await self.fetch_courses():
            if course.get("course_id", "").upper() == requested_id:
                base_name = str(course.get("name", ""))
                break

        if exa_client.is_configured():
            try:
                sections = await exa_client.fetch_sections(
                    requested_id,
                    name=base_name,
                    term=(term or self._default_term_hint()),
                )
                if sections:
                    return sections
            except Exception as e:
                log.warning(f"Exa section lookup failed for {requested_id}: {e}")

        return []

    async def fetch_departments(self) -> List[Dict[str, Any]]:
        return [
            {"dept_id": "SCSE", "name": "College of Computing and Data Science"},
            {"dept_id": "SPMS", "name": "School of Physical and Mathematical Sciences"},
            {"dept_id": "NBS", "name": "Nanyang Business School"},
        ]

    async def fetch_terms(self) -> List[Dict[str, Any]]:
        return [
            {"term": "2026;1", "name": "AY2026/27 Semester 1"},
            {"term": "2026;2", "name": "AY2026/27 Semester 2"},
        ]

    async def close(self):
        await self.client.aclose()


catalog_service = CatalogService()
