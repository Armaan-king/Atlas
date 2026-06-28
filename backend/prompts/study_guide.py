"""
Prompt template for generating structured markdown study guides.
"""


def build_study_guide_prompt(
    topic: str,
    course_id: str,
    course_name: str,
    course_topics: list[str],
    additional_context: str | None = None,
) -> str:
    """Build a prompt for generating a comprehensive study guide."""

    context_block = ""
    if additional_context:
        context_block = f"""
## Additional Context Provided by Student
{additional_context}
"""

    return f"""Create a comprehensive study guide for the following topic.

## Request Details
- **Topic**: {topic}
- **Course**: {course_id.upper()} — {course_name}
- **Course covers**: {', '.join(course_topics)}
{context_block}
## Output Requirements
Generate a well-structured markdown study guide that includes:

1. **Overview** — A brief 2-3 sentence introduction to the topic
2. **Key Concepts** — The most important ideas, each with a clear explanation
3. **Detailed Breakdown** — Deeper explanations with examples
   - For SC (computing) modules: include code examples in the relevant language
   - For MH (math) modules: include worked problems with step-by-step solutions using LaTeX
   - For BU (business) modules: include applied analytics examples and key terminology
   - For HE (economics) modules: include real-world examples and graphical descriptions
4. **Common Mistakes** — Pitfalls students typically encounter
5. **Practice Problems** — 3-5 practice questions with answers
6. **Connections** — How this topic relates to other topics in the course

Use proper markdown formatting with headers (##, ###), bold, lists, and code blocks where appropriate.
Make the guide thorough enough to study from, but concise enough to review in 15-20 minutes.
"""
