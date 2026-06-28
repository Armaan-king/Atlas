"""
Validates all mock data against Pydantic models and checks referential integrity.
Run directly: python -m data.validate
"""

from __future__ import annotations

from .courses import COURSES
from .assignments import ASSIGNMENTS
from .notes import NOTES
from .concepts import CONCEPTS
from .connections import CONNECTIONS
from .syllabus import SYLLABUS

from models.data_models import (
    CourseModel,
    AssignmentModel,
    NoteModel,
    ConceptModel,
    ConnectionModel,
    SyllabusModel,
)


def validate_all() -> list[str]:
    errors: list[str] = []

    course_ids = set()
    for c in COURSES:
        try:
            CourseModel(**c)
            course_ids.add(c["id"])
        except Exception as e:
            errors.append(f"Course {c.get('id', '?')}: {e}")

    assignment_ids = set()
    for a in ASSIGNMENTS:
        try:
            AssignmentModel(**a)
            assignment_ids.add(a["id"])
        except Exception as e:
            errors.append(f"Assignment {a.get('id', '?')}: {e}")
        if a.get("course_id") not in course_ids:
            errors.append(f"Assignment {a['id']}: course_id '{a.get('course_id')}' not in courses")

    for n in NOTES:
        try:
            NoteModel(**n)
        except Exception as e:
            errors.append(f"Note {n.get('id', '?')}: {e}")
        if n.get("course_id") not in course_ids:
            errors.append(f"Note {n['id']}: course_id '{n.get('course_id')}' not in courses")

    concept_ids = set()
    for c in CONCEPTS:
        try:
            ConceptModel(**c)
            concept_ids.add(c["id"])
        except Exception as e:
            errors.append(f"Concept {c.get('id', '?')}: {e}")
        if c.get("course_id") not in course_ids:
            errors.append(f"Concept {c['id']}: course_id '{c.get('course_id')}' not in courses")

    for conn in CONNECTIONS:
        try:
            ConnectionModel(**conn)
        except Exception as e:
            errors.append(f"Connection {conn.get('id', '?')}: {e}")
        if conn.get("source_id") not in concept_ids:
            errors.append(f"Connection {conn['id']}: source_id '{conn.get('source_id')}' not in concepts")
        if conn.get("target_id") not in concept_ids:
            errors.append(f"Connection {conn['id']}: target_id '{conn.get('target_id')}' not in concepts")

    for s in SYLLABUS:
        try:
            SyllabusModel(**s)
        except Exception as e:
            errors.append(f"Syllabus {s.get('course_id', '?')}: {e}")
        if s.get("course_id") not in course_ids:
            errors.append(f"Syllabus {s['course_id']}: course_id not in courses")
        for w in s.get("weeks", []):
            for aid in w.get("assignment_ids", []):
                if aid not in assignment_ids:
                    errors.append(f"Syllabus {s['course_id']} week {w['week']}: assignment_id '{aid}' not in assignments")
            for cid in w.get("concept_ids", []):
                if cid not in concept_ids:
                    errors.append(f"Syllabus {s['course_id']} week {w['week']}: concept_id '{cid}' not in concepts")

    return errors


if __name__ == "__main__":
    errs = validate_all()
    if errs:
        print(f"❌ {len(errs)} validation error(s):")
        for e in errs:
            print(f"  - {e}")
        raise SystemExit(1)
    else:
        print("✅ All mock data is valid and referentially consistent.")
