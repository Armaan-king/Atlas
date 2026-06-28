"""
Prompt template for generating multiple-choice quiz questions as structured JSON.
"""


def build_quiz_prompt(
    topic: str,
    course_id: str,
    course_name: str,
    course_topics: list[str],
    additional_context: str | None = None,
    count: int = 5,
) -> str:
    """Build a prompt for generating quiz questions."""

    context_block = ""
    if additional_context:
        context_block = f"""
## Additional Context Provided by Student
{additional_context}
"""

    return f"""Generate exactly {count} multiple-choice quiz questions for the following topic.

## Request Details
- **Topic**: {topic}
- **Course**: {course_id.upper()} — {course_name}
- **Course covers**: {', '.join(course_topics)}
{context_block}
## Output Format
Return a JSON object with a "questions" array. Each question has:
- "question": The question text (clear and unambiguous)
- "options": Array of exactly 4 answer choices (strings)
- "correct_index": Index of the correct answer (0-3)
- "explanation": Brief explanation of why the correct answer is right (1-2 sentences)

## Guidelines
- Questions should test understanding, not just memorization
- All 4 options should be plausible (no obviously wrong answers)
- Mix difficulty levels: 2 easy, 2 medium, 1 hard
- For SC (computing) modules: include code reading and output prediction questions
- For MH (math) modules: include computation and concept questions
- For BU (business) modules: include scenario-based analytics questions
- For HE (economics) modules: include scenario-based and graph interpretation questions
- Each question must have exactly ONE correct answer
- Avoid "all of the above" or "none of the above" options

## Example Output Format
{{
  "questions": [
    {{
      "question": "What does the 'let' keyword do in OCaml?",
      "options": [
        "Declares a mutable variable",
        "Binds a value to a name (immutable by default)",
        "Creates a new function",
        "Imports a module"
      ],
      "correct_index": 1,
      "explanation": "In OCaml, 'let' creates an immutable binding by default. Use 'let mutable' or 'ref' for mutability."
    }}
  ]
}}
"""
