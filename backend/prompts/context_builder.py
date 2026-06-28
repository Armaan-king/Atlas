"""
Context builder prompts for OpenAI-backed study flows.

This module builds the structured prompt blocks the app uses for:
  - chat context
  - study generation
  - concept extraction
  - knowledge-document construction
"""


def build_knowledge_document_prompt(
    courses: list[dict],
    assignments: list[dict],
    notes: list[dict],
) -> str:
    """Build a prompt that turns raw student data into a knowledge document."""
    courses_raw = "\n".join(
        f"- {course['id'].upper()}: {course['name']} | Topics: {', '.join(course.get('topics', []))}"
        for course in courses
    ) or "No courses found."

    assignments_raw = "\n".join(
        f"- [{assignment['course_id'].upper()}] {assignment['title']} | Due: {assignment['due_date']} | Type: {assignment['type']}"
        for assignment in sorted(assignments, key=lambda item: item.get("due_date", ""))
    ) or "No assignments found."

    notes_raw = "\n\n".join(
        f"=== {note['title']} ({note['course_id'].upper()}) ===\n{note['content'][:500]}"
        for note in notes
    ) or "No notes available."

    return f"""You are creating a knowledge document for an AI study assistant.
This document will be used as a durable reference for helping an NTU Singapore student.
Write a comprehensive, well-structured document that another AI can reuse later.

## Raw Student Data

### Enrolled Courses
{courses_raw}

### Assignments & Deadlines
{assignments_raw}

### Lecture Notes (excerpts)
{notes_raw}

## Your Task
Transform the above raw data into a clear knowledge document with these sections:

1. **Student Profile** - Brief summary of the student's semester and workload
2. **Course Overviews** - For each course: name, key topics, and current stage of the semester
3. **Upcoming Deadlines** - Sorted by urgency, including type
4. **Key Concepts by Course** - Important academic concepts from the notes
5. **Study Priorities** - What the student should focus on right now
6. **Cross-Course Connections** - Concepts that connect multiple courses

Write this as a knowledge document, not a chat reply.
Be specific and use the actual course and assignment names from the data.
"""


def build_openai_chat_prompt(
    user_question: str,
    context_block: str | None = None,
    conversation_history: list[dict] | None = None,
    module_statuses: dict[str, list[dict]] | None = None,
    triage_statuses: dict[str, str] | None = None,
    system_status: dict[str, str] | None = None,
    active_remediation: dict | None = None,
    upcoming_deadlines: list[dict] | None = None,
    graph_context: list[dict] | None = None,
    graph_connections: list[dict] | None = None,
) -> str:
    """Build the final OpenAI chat prompt."""
    parts: list[str] = []

    def format_modules(items: list[dict]) -> str:
        return ", ".join(
            f"{item.get('course_code', item.get('id', '')).upper()} ({item.get('name', 'Unknown module')})"
            for item in items
        )

    if context_block:
        parts.append(f"[CONTEXT UPDATE]\n{context_block}\n[END CONTEXT]\n")

    dashboard_state: list[str] = []
    if module_statuses:
        current_modules = module_statuses.get("current") or []
        taken_modules = module_statuses.get("taken") or []
        planned_modules = module_statuses.get("planned") or []
        if current_modules:
            dashboard_state.append(
                "Current modules (primary workload): " + format_modules(current_modules)
            )
        if taken_modules:
            dashboard_state.append(
                "Taken modules (history/prerequisite context): " + format_modules(taken_modules)
            )
        if planned_modules:
            dashboard_state.append(
                "Planned modules (future/secondary unless explicitly asked): "
                + format_modules(planned_modules)
            )
    if triage_statuses:
        criticals = [item for item, status in triage_statuses.items() if status == "danger"]
        if criticals:
            dashboard_state.append(f"At-risk assignments: {', '.join(criticals)} - danger")
    if system_status:
        dashboard_state.append(
            "System status: "
            + ", ".join(f"{key}={value}" for key, value in system_status.items())
        )
    if active_remediation:
        dashboard_state.append(f"Active remediation: {active_remediation.get('topic', 'Unknown')}")
    if upcoming_deadlines:
        deadline_lines = []
        for deadline in upcoming_deadlines:
            days = deadline.get("days_left", "?")
            title = deadline.get("title", "Unknown")
            course = deadline.get("course_code", deadline.get("course_id", ""))
            category = deadline.get("category", "")
            triage = deadline.get("triage")
            status = deadline.get("status", "")
            flag = " AT RISK" if triage == "danger" else (" submitted" if status == "submitted" or triage == "submitted" else "")
            when = "overdue" if isinstance(days, (int, float)) and days < 0 else f"{days}d"
            deadline_lines.append(f"  [{course}] {title} ({category}, {when}){flag}")
        dashboard_state.append("Upcoming assignments/exams:\n" + "\n".join(deadline_lines))

    if graph_context:
        from collections import defaultdict

        by_course: dict[str, list[dict]] = defaultdict(list)
        for concept in graph_context:
            by_course[concept.get("course_id", "unknown")].append(concept)

        graph_lines = []
        for course_id, concepts in sorted(by_course.items()):
            concepts_sorted = sorted(concepts, key=lambda item: item.get("mastery", 0))
            items = ", ".join(f"{concept['label']}({concept.get('mastery', 0)}%)" for concept in concepts_sorted)
            course_status = concepts_sorted[0].get("status")
            suffix = f" [{course_status}]" if course_status else ""
            graph_lines.append(f"  {course_id.upper()}{suffix}: {items}")

        weak = [
            concept
            for concept in graph_context
            if concept.get("mastery", 100) < 50 and concept.get("status") != "planned"
        ]
        weak_sorted = sorted(weak, key=lambda item: item.get("mastery", 0))
        if weak_sorted:
            weak_str = ", ".join(
                f"{concept['label']} ({concept['course_id'].upper()}, {concept.get('mastery', 0)}%, {concept.get('status', 'current')})"
                for concept in weak_sorted[:6]
            )
            dashboard_state.append(f"Low mastery concepts in active/history modules: {weak_str}")

        dashboard_state.append("Knowledge graph mastery by course:\n" + "\n".join(graph_lines))

    if graph_connections:
        cross = [connection for connection in graph_connections if connection.get("cross_course")]
        intra = [connection for connection in graph_connections if not connection.get("cross_course")]
        conn_lines = []
        if cross:
            conn_lines.append("  Cross-course links:")
            for connection in cross:
                conn_lines.append(
                    f"    {connection['source_label']} ({connection['source_course'].upper()}) "
                    f"-> [{connection['relationship']}] -> "
                    f"{connection['target_label']} ({connection['target_course'].upper()})"
                )
        if intra:
            conn_lines.append("  Within-course links:")
            for connection in intra:
                conn_lines.append(
                    f"    {connection['source_label']} -> [{connection['relationship']}] -> "
                    f"{connection['target_label']} ({connection['source_course'].upper()})"
                )
        dashboard_state.append("Concept relationships:\n" + "\n".join(conn_lines))

    if dashboard_state:
        parts.append("[STUDENT DASHBOARD STATE]\n" + "\n".join(dashboard_state) + "\n[END STATE]\n")

    if conversation_history:
        history_lines = []
        for message in conversation_history[-8:]:
            role = "Student" if message.get("role") == "user" else "Atlas"
            history_lines.append(f"{role}: {message.get('content', '')}")
        if history_lines:
            parts.append("Previous conversation:\n" + "\n".join(history_lines) + "\n")

    parts.append(f"Student question: {user_question}")
    return "\n\n".join(parts)
