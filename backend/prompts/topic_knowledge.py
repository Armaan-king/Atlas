"""
Topic Knowledge Prompt
======================
Takes a user's study goal (free-text or concept click) and gathers
all relevant data (concepts, assignments, notes, connections) to
produce a focused knowledge document for the Atlas study flow.
"""


def _fuzzy_match(query: str, text: str) -> bool:
    """Case-insensitive substring match for filtering data by topic."""
    return query.lower() in text.lower()


def build_topic_knowledge_prompt(
    query: str,
    concepts: list[dict],
    assignments: list[dict],
    notes: list[dict],
    connections: list[dict],
    courses: list[dict],
    course_filter: str | None = None,
) -> str:
    """
    Build an OpenAI prompt that generates a focused knowledge document
    for a specific study topic or goal.
    
    Args:
        query: The study topic/goal (e.g., "CFG exam", "eigenvalues", "Rust ownership")
        concepts: All concepts from data/concepts.py
        assignments: All assignments from data/assignments.py
        notes: All notes from data/notes.py
        connections: All connections from data/connections.py
        courses: All courses from data/courses.py
        course_filter: Optional course_id to narrow scope
    """

    # ── Filter concepts by query match ────────────────────────────────────
    matched_concepts = []
    matched_concept_ids = set()
    for c in concepts:
        if course_filter and c["course_id"] != course_filter:
            continue
        if _fuzzy_match(query, c["label"]) or _fuzzy_match(query, c.get("description", "")):
            matched_concepts.append(c)
            matched_concept_ids.add(c["id"])

    # If no direct match, broaden to entire course if course_filter is set
    if not matched_concepts and course_filter:
        matched_concepts = [c for c in concepts if c["course_id"] == course_filter]
        matched_concept_ids = {c["id"] for c in matched_concepts}

    concepts_block = "\n".join(
        f"- {c['label']} (Mastery: {c.get('mastery', 0)}%) — {c.get('description', '')}"
        for c in matched_concepts
    ) or "No directly matching concepts found."

    # ── Filter connections involving matched concepts ──────────────────────
    relevant_connections = [
        conn for conn in connections
        if conn["source_id"] in matched_concept_ids or conn["target_id"] in matched_concept_ids
    ]
    # Resolve labels for connection display
    concept_labels = {c["id"]: c["label"] for c in concepts}
    connections_block = "\n".join(
        f"- {concept_labels.get(conn['source_id'], conn['source_id'])} "
        f"[{conn['label']}] "
        f"{concept_labels.get(conn['target_id'], conn['target_id'])}"
        for conn in relevant_connections
    ) or "No relevant connections found."

    # ── Filter assignments by query or matching course ─────────────────────
    relevant_courses = {c["course_id"] for c in matched_concepts}
    matched_assignments = []
    for a in assignments:
        if course_filter and a["course_id"] != course_filter:
            continue
        if (
            _fuzzy_match(query, a.get("name", ""))
            or _fuzzy_match(query, a.get("description", ""))
            or a["course_id"] in relevant_courses
        ):
            matched_assignments.append(a)

    assignments_block = "\n".join(
        f"- [{a['course_id'].upper()}] {a['name']} — Due: {a.get('due_at', 'N/A')} | "
        f"Status: {a.get('status', 'unknown')} | {a.get('description', '')}"
        for a in sorted(matched_assignments, key=lambda x: x.get("due_at", ""))
    ) or "No relevant assignments found."

    # ── Filter notes by query or matching course ──────────────────────────
    matched_notes = []
    for n in notes:
        if course_filter and n["course_id"] != course_filter:
            continue
        if (
            _fuzzy_match(query, n.get("title", ""))
            or _fuzzy_match(query, n.get("content", "")[:500])
            or n["course_id"] in relevant_courses
        ):
            matched_notes.append(n)

    notes_block = "\n\n".join(
        f"### {n['title']} ({n['course_id'].upper()})\n{n['content'][:600]}"
        for n in matched_notes[:5]  # limit to 5 most relevant
    ) or "No relevant lecture notes found."

    # ── Course info ───────────────────────────────────────────────────────
    course_info = "\n".join(
        f"- {c['course_code']}: {c['name']} (Instructor: {c.get('instructor', 'N/A')})"
        for c in courses
        if c["id"] in relevant_courses or (course_filter and c["id"] == course_filter)
    ) or "No specific course matched."

    return f"""You are building a FOCUSED KNOWLEDGE DOCUMENT for an AI study assistant.
The student has requested help with: "{query}"

Your job: create a comprehensive, well-structured knowledge document that covers
everything the AI agent needs to know to help this student study this specific topic.

## Relevant Course(s)
{course_info}

## Matching Concepts from Knowledge Graph
{concepts_block}

## Concept Connections (Prerequisite Map)
{connections_block}

## Related Assignments & Deadlines
{assignments_block}

## Relevant Lecture Notes
{notes_block}

## Your Task
Create a focused knowledge document with these sections:

1. **Topic Overview** — What this topic is, why it matters, and where it fits in the course
2. **Core Concepts** — Define each matching concept clearly with examples
3. **Prerequisites** — What the student should already know (from connections)
4. **Key Relationships** — How these concepts connect to each other and to other courses
5. **Assignment Context** — Which upcoming assignments/exams test this material
6. **Study Priority** — Based on mastery levels and deadlines, what to focus on first
7. **Practice Recommendations** — Specific things the student should practice

Write as a knowledge base document, NOT a chat response.
Be specific to the student's actual course data. Reference real assignment names and deadlines.
This document will be uploaded as context for an AI agent that helps this student study."""
