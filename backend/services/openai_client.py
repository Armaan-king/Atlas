"""
OpenAI service helpers used across Atlas.

OpenAI is the primary model provider for:
  - knowledge-document generation
  - chat responses
  - structured JSON study artifacts
"""

import json
import os
from typing import Any

from openai import AsyncOpenAI

MODEL = os.getenv("OPENAI_MODEL", "gpt-5.4")
REASONING_EFFORT = os.getenv("OPENAI_REASONING_EFFORT", "low")
TEXT_VERBOSITY = os.getenv("OPENAI_TEXT_VERBOSITY", "low")

_client: AsyncOpenAI | None = None


def get_client() -> AsyncOpenAI:
    """Get a configured OpenAI client."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key == "your_key_here":
        raise RuntimeError("OPENAI_API_KEY not set. Add it to backend/.env")

    global _client
    if _client is None:
        _client = AsyncOpenAI(api_key=api_key)
    return _client


def _strip_markdown_fences(text: str) -> str:
    if not text.startswith("```"):
        return text
    lines = text.splitlines()
    lines = [line for line in lines if not line.strip().startswith("```")]
    return "\n".join(lines).strip()


def _response_text(response) -> str:
    text = getattr(response, "output_text", "") or ""
    if text:
        return text.strip()
    raise RuntimeError("OpenAI returned an empty response.")


async def build_knowledge_document(prompt: str) -> str:
    """Generate a reusable knowledge document from raw student context."""
    client = get_client()
    response = await client.responses.create(
        model=MODEL,
        instructions=(
            "You are creating a durable knowledge document for an AI study assistant. "
            "Be thorough, specific, and well-organized. Use clear headings."
        ),
        input=prompt,
        reasoning={"effort": REASONING_EFFORT},
        text={"verbosity": TEXT_VERBOSITY},
        max_output_tokens=4096,
    )
    return _response_text(response)


async def generate_json_fallback(prompt: str, system_instruction: str = "") -> Any:
    """Generate structured JSON directly from OpenAI."""
    client = get_client()
    full_prompt = (
        prompt
        + "\n\nIMPORTANT: Respond with valid JSON only. No markdown fences and no explanation."
    )

    response = await client.responses.create(
        model=MODEL,
        instructions=system_instruction or "You are an AI that outputs valid JSON only.",
        input=full_prompt,
        reasoning={"effort": REASONING_EFFORT},
        text={
            "verbosity": TEXT_VERBOSITY,
            "format": {"type": "json_object"},
        },
        max_output_tokens=4096,
    )

    text = _strip_markdown_fences(_response_text(response))
    return json.loads(text)


async def generate_text_fallback(prompt: str, system_instruction: str = "") -> str:
    """Generate a plain-text response directly from OpenAI."""
    client = get_client()
    response = await client.responses.create(
        model=MODEL,
        instructions=system_instruction or "You are a helpful academic AI assistant.",
        input=prompt,
        reasoning={"effort": REASONING_EFFORT},
        text={"verbosity": TEXT_VERBOSITY},
        max_output_tokens=4096,
    )
    return _response_text(response)
