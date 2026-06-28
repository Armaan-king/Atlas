"""
Graph Analysis Prompt
===================
OpenAI's role in the pipeline: take the 3D knowledge graph state (nodes, edges, mastery)
and produce a rich, well-structured knowledge document that can be reused by
the rest of the Atlas study pipeline as a knowledge source.
"""

from models.schemas import ConceptNode, ConceptEdge

def build_graph_analysis_prompt(
    nodes: list[ConceptNode],
    edges: list[ConceptEdge],
    mastery: dict[str, int]
) -> str:
    """
    Build an OpenAI prompt that generates a knowledge document
    from the student's knowledge graph state.
    """
    
    # Format nodes with mastery
    node_lines = []
    for node in nodes:
        m = mastery.get(node.id, 0) # Default to 0 mastery
        node_lines.append(f"- {node.label} (Course: {node.course_id.upper()}, Mastery: {m}%)")
        node_lines.append(f"  Description: {node.description}")
        
    nodes_raw = "\n".join(node_lines) if node_lines else "No concepts found."
    
    # Format edges
    edge_lines = []
    for edge in edges:
        source_node = next((n for n in nodes if n.id == edge.source), None)
        target_node = next((n for n in nodes if n.id == edge.target), None)
        if source_node and target_node:
            edge_lines.append(f"- {source_node.label} [{edge.relationship}] {target_node.label}")
    
    edges_raw = "\n".join(edge_lines) if edge_lines else "No connections found."

    return f"""You are analyzing a student's Knowledge Graph state to create an essential knowledge document for an AI study assistant.
This document will be uploaded to an AI agent (Atlas) to give it "memory" of the student's mastery levels and conceptual understanding.

## Student's Knowledge Engine Data

### Core Concepts & Mastery Levels
Each concept includes the student's current mastery percentage (0-100%).
{nodes_raw}

### Foundational Connections
How the concepts connect to each other across the student's curriculum:
{edges_raw}

## Your Task
Transform this structured graph data into a clear, comprehensive knowledge document with these sections:

1. **Overall Conceptual Mastery** — A brief summary of the student's strongest and weakest academic areas.
2. **Concept Breakdown** — Detail the concepts, explicitly framing them by their mastery. Format like `[Concept Label (Course, Mastery%)]`.
3. **Critical Weaknesses** — Highlight concepts below 60% mastery that need immediate remediation.
4. **Important Connections** — Describe the most important relationships in plain English so the AI understands prerequisite dependencies.

Write this as a knowledge document, not a chat response.
Be specific and instructional so the receiving AI knows exactly what to focus on when the student asks for help.
"""
