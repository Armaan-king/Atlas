"""
Prompt template for extracting knowledge graph concepts and relationships from text.
"""


def build_concept_extract_prompt(
    text: str,
    course_id: str,
    course_name: str = "",
) -> str:
    """Build a prompt for extracting concepts and relationships from text."""

    return f"""Analyze the following text and extract key academic concepts and their relationships
for a knowledge graph visualization.

## Source Text
```
{text[:3000]}
```

## Context
- **Course**: {course_id.upper()}{f' — {course_name}' if course_name else ''}
- This will be used in an interactive knowledge graph for studying

## Output Format
Return a JSON object with:
- "nodes": Array of concept nodes, each with:
  - "id": A unique snake_case identifier (e.g., "binary_search", "dna_replication")
  - "label": Human-readable label (e.g., "Binary Search", "DNA Replication")
  - "course_id": "{course_id}"
  - "description": A 1-2 sentence explanation of the concept
- "edges": Array of relationships between concepts, each with:
  - "source": ID of the source node
  - "target": ID of the target node
  - "relationship": Short description of how they relate (e.g., "is a type of", "requires", "produces")

## Guidelines
- Extract 5-15 distinct concepts (not too granular, not too broad)
- Create meaningful edges that show how concepts connect
- Each concept should have a clear, unique ID
- Descriptions should be helpful for a student reviewing the topic
- Focus on the most important concepts, not every noun in the text
- Relationships should be directional and specific

## Example Output
{{
  "nodes": [
    {{
      "id": "linked_list",
      "label": "Linked List",
      "course_id": "{course_id}",
      "description": "A linear data structure where elements are connected via pointers."
    }},
    {{
      "id": "pointer",
      "label": "Pointer",
      "course_id": "{course_id}",
      "description": "A variable that stores the memory address of another variable."
    }}
  ],
  "edges": [
    {{
      "source": "linked_list",
      "target": "pointer",
      "relationship": "uses"
    }}
  ]
}}
"""
