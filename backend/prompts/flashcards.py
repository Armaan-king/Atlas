"""
Prompt template for generating flashcards as structured JSON.
"""


def build_flashcards_prompt(
    topic: str,
    course_id: str,
    course_name: str,
    course_topics: list[str],
    additional_context: str | None = None,
    count: int = 10,
) -> str:
    """Build a prompt for generating flashcards."""

    context_block = ""
    if additional_context:
        context_block = f"""
## Additional Context Provided by Student
{additional_context}
"""

    return f"""Generate exactly {count} flashcards for studying the following topic.

## Request Details
- **Topic**: {topic}
- **Course**: {course_id.upper()} — {course_name}
- **Course covers**: {', '.join(course_topics)}
{context_block}
## Output Format
Return a JSON object with a "cards" array. Each card has:
- "front": The question or prompt (keep concise, 1-2 sentences max)
- "back": The answer or explanation (clear and complete, 1-3 sentences)
- "course_id": "{course_id}"

## Guidelines
- Cover the most important aspects of the topic
- Mix different question types: definitions, applications, comparisons
- For SC (computing) modules: include code snippets on the front when testing syntax/concepts
- For MH (math) modules: include small computation problems
- For BU (business) modules: include terminology and applied analytics questions
- For HE (economics) modules: include concept application and graph interpretation questions
- Order cards from foundational to advanced concepts
- Make "front" specific enough that there's one clear correct answer

## Example Output Format
{{
  "cards": [
    {{
      "front": "What is the time complexity of binary search?",
      "back": "O(log n) — it halves the search space with each comparison.",
      "course_id": "{course_id}"
    }}
  ]
}}
"""
