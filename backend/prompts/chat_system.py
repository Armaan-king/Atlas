"""
System prompt for the Atlas Intelligence chat assistant.
Dynamically injects course data, deadlines, and notes into the system prompt.
"""

from datetime import datetime


def build_chat_system_prompt(
    courses: list[dict],
    assignments: list[dict],
    notes: list[dict],
    course_filter: str | None = None,
    module_statuses: dict[str, list[dict]] | None = None,
    triage_statuses: dict[str, str] | None = None,
    active_remediation: dict | None = None,
) -> str:
    """
    Build the system prompt for the chat endpoint.

    Args:
        courses: List of course dicts from data/courses.py
        assignments: List of assignment dicts from data/assignments.py
        notes: List of note dicts from data/notes.py
        course_filter: Optional course_id to focus on a specific course
    """

    def format_course_line(course: dict) -> str:
        topics_str = f" - Topics: {', '.join(course.get('topics', []))}" if course.get("topics") else ""
        return f"- {course['id'].upper()}: {course['name']}{topics_str}"

    status_lookup: dict[str, str] = {}
    if module_statuses:
        for status, items in module_statuses.items():
            for item in items or []:
                module_id = str(item.get("id", "")).lower()
                if module_id:
                    status_lookup[module_id] = status

    def visible_course(course: dict, allowed_statuses: set[str] | None = None) -> bool:
        if course_filter and course["id"] != course_filter:
            return False
        if allowed_statuses is None or not status_lookup:
            return True
        return status_lookup.get(course["id"], "current") in allowed_statuses

    current_course_lines = [
        format_course_line(course)
        for course in courses
        if visible_course(course, {"current"})
    ]
    taken_course_lines = [
        format_course_line(course)
        for course in courses
        if visible_course(course, {"taken"})
    ]
    planned_course_lines = [
        format_course_line(course)
        for course in courses
        if visible_course(course, {"planned"})
    ]

    if not status_lookup:
        current_course_lines = [
            format_course_line(course)
            for course in courses
            if visible_course(course)
        ]
    else:
        backend_ids = {str(course["id"]).lower() for course in courses}
        for status_name, target_lines in (
            ("current", current_course_lines),
            ("taken", taken_course_lines),
            ("planned", planned_course_lines),
        ):
            for module in module_statuses.get(status_name, []) or []:
                module_id = str(module.get("id", "")).lower()
                if course_filter and module_id != course_filter:
                    continue
                if module_id and module_id not in backend_ids:
                    target_lines.append(
                        f"- {str(module.get('course_code', module_id)).upper()}: {module.get('name', 'Custom module')}"
                    )

    current_courses_block = "\n".join(current_course_lines) if current_course_lines else "No current modules loaded."
    taken_courses_block = "\n".join(taken_course_lines) if taken_course_lines else "No taken modules loaded."
    planned_courses_block = "\n".join(planned_course_lines) if planned_course_lines else "No planned modules loaded."

    # Format upcoming deadlines
    deadline_lines = []
    now = datetime.now()
    for a in assignments:
        if course_filter and a["course_id"] != course_filter:
            continue
        if not course_filter and status_lookup and status_lookup.get(a["course_id"], "current") != "current":
            continue
        deadline_lines.append(
            f"- [{a['course_id'].upper()}] {a.get('name', 'Assignment')} - Due: {a.get('due_at', 'Unknown')} (Type: {a.get('assignment_category', 'Unknown')})"
        )

    deadlines_block = "\n".join(deadline_lines[:10]) if deadline_lines else "No current-module deadlines loaded."

    # Format recent notes
    notes_lines = []
    for n in notes:
        if course_filter and n["course_id"] != course_filter:
            continue
        if not course_filter and status_lookup and status_lookup.get(n["course_id"], "current") != "current":
            continue
        # Truncate long notes for the prompt
        snippet = n["content"][:300] + "..." if len(n["content"]) > 300 else n["content"]
        notes_lines.append(f"### {n['title']} ({n['course_id'].upper()})\n{snippet}")

    notes_block = "\n\n".join(notes_lines[:4]) if notes_lines else "No current-module notes available."

    dashboard_state = []
    if triage_statuses:
        criticals = [c for c, stat in triage_statuses.items() if stat == 'danger']
        if criticals:
            dashboard_state.append(f"At-risk assignments: {', '.join(criticals)} - danger")
    if active_remediation:
        dashboard_state.append(f"Active remediation: {active_remediation.get('topic', 'Unknown')}")
        
    dash_block = ""
    if dashboard_state:
        dash_block = "\n### Student Dashboard State\n" + "\n".join(f"- {d}" for d in dashboard_state)

    focus_note = ""
    if course_filter:
        focus_status = status_lookup.get(course_filter, "current")
        if focus_status == "taken":
            focus_note = (
                f"\nThe student is currently focused on **{course_filter.upper()}**. "
                "This is a taken module, so use it as prerequisite/history context unless the user explicitly wants deep work there.\n"
            )
        elif focus_status == "planned":
            focus_note = (
                f"\nThe student is currently focused on **{course_filter.upper()}**. "
                "This is a planned module, so treat it as future/secondary context unless the user explicitly wants planning or preview help.\n"
            )
        else:
            focus_note = f"\nThe student is currently focused on **{course_filter.upper()}**. Prioritize this current module in your responses.\n"

    return f"""You are **Atlas**, an AI study assistant built for Nanyang Technological University (NTU Singapore) students.
You are knowledgeable, encouraging, and precise. You help students understand concepts,
prepare for exams, and stay organized. Use NTU conventions: modules (not courses), AUs,
tutorials, labs, lectures, and a CGPA on a 5.00 scale.

## Your Personality
- Friendly and encouraging, like a smart upperclassman tutor
- Use clear explanations with examples
- Reference specific course material when relevant
- If you don't know something, say so honestly
- Use markdown formatting for clarity (headers, lists, code blocks, bold)
- Treat current modules as the student's main active workload
- Use taken modules as prerequisite/history context when helpful
- Treat planned modules as secondary future context unless the student explicitly asks about them
{dash_block}

## Current Semester Context

### Current Modules
{current_courses_block}

### Taken Modules For Prerequisite Context
{taken_courses_block}

### Planned Modules For Future Planning
{planned_courses_block}

### Active Deadlines
{deadlines_block}

### Current-Module Notes
{notes_block}
{focus_note}
## Guidelines
- When answering questions, relate them to the student's current modules first unless they explicitly ask about taken or planned modules
- For coding questions (e.g. SC2002, SC2001), provide code examples in the relevant language
- For math (e.g. MH2802, MH1812), use LaTeX notation wrapped in $ or $$ delimiters
- For business analytics (e.g. BU8201), be precise with terminology
- For economics (e.g. HE2001), reference real-world examples
- Keep responses concise but thorough — you're helping someone study, not writing a textbook
- Proactively suggest related topics or next steps after answering

Current date/time: {now.strftime("%A, %B %d, %Y at %I:%M %p")}
"""
