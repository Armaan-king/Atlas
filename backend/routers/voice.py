from __future__ import annotations

from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import Response
from pydantic import BaseModel

from services.elevenlabs_tts import text_to_speech, get_client

router = APIRouter()


class VoiceRequest(BaseModel):
    text: str
    voice_id: str | None = None


@router.post("/voice")
async def tts_endpoint(req: VoiceRequest):
    try:
        audio_bytes = text_to_speech(req.text, req.voice_id)
        return Response(content=audio_bytes, media_type="audio/mpeg")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ElevenLabs error: {str(e)}")


@router.post("/transcribe")
async def stt_endpoint(file: UploadFile = File(...)):
    from io import BytesIO

    try:
        audio_bytes = await file.read()
        if len(audio_bytes) < 100:
            raise HTTPException(status_code=400, detail="Audio too short")

        client = get_client()
        audio_file = BytesIO(audio_bytes)
        audio_file.name = file.filename or "recording.webm"
        transcription = client.speech_to_text.convert(
            file=audio_file,
            model_id="scribe_v2",
            language_code="eng",
        )
        return {"text": transcription.text}
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ElevenLabs STT error: {str(e)}")
