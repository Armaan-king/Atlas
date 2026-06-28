import os
from elevenlabs import ElevenLabs

# Custom ElevenLabs voice — Jarvis
DEFAULT_VOICE_ID = "zN2vGZUoKKhGGKtNFtr8"
MAX_TEXT_LENGTH = 500


def get_client() -> ElevenLabs:
    api_key = os.getenv("ELEVENLABS_API_KEY")
    if not api_key or api_key == "your_key_here":
        raise RuntimeError("ELEVENLABS_API_KEY not configured")
    return ElevenLabs(api_key=api_key)


def text_to_speech(text: str, voice_id: str | None = None) -> bytes:
    """Convert text to speech audio bytes (mp3).

    Truncates to MAX_TEXT_LENGTH to preserve API quota.
    """
    text = text.strip()
    if not text:
        raise ValueError("Text cannot be empty")

    if len(text) > MAX_TEXT_LENGTH:
        text = text[:MAX_TEXT_LENGTH]

    client = get_client()
    audio_iterator = client.text_to_speech.convert(
        voice_id=voice_id or DEFAULT_VOICE_ID,
        text=text,
        model_id="eleven_turbo_v2_5",
    )
    return b"".join(audio_iterator)
