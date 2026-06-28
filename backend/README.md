# Atlas — Backend

FastAPI service that powers Atlas Intelligence: chat, knowledge synthesis, study-artifact
generation, the course catalog, and the ZO / Exa / ElevenLabs agent integrations.

- **Framework:** FastAPI + Uvicorn
- **Model provider:** OpenAI (chat, knowledge, study tools)
- **Voice:** ElevenLabs TTS
- **Default URL:** `http://127.0.0.1:8000` (API routes are mounted under `/api`)

## Prerequisites

- Python 3.10+
- An OpenAI API key (required for the AI features)
- *(optional)* ElevenLabs, ZO, and NTU catalog credentials

## Setup

From the `backend/` directory:

```bash
# 1. Create and activate a virtual environment
python -m venv .venv

#    Windows (PowerShell)
.venv\Scripts\Activate.ps1
#    macOS / Linux
source .venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Create your environment file
#    Windows
copy .env.example .env
#    macOS / Linux
cp .env.example .env
```

Then open `.env` and fill in your keys:

| Variable | Required | Purpose |
| --- | --- | --- |
| `OPENAI_API_KEY` | ✅ | Chat, knowledge synthesis, study artifacts |
| `OPENAI_MODEL` | ✅ | Model name (default `gpt-5.4`) |
| `ELEVENLABS_API_KEY` | optional | Voice / text-to-speech features |
| `EMAIL_SUMMARY_SHARED_SECRET` | optional | ZO daily-digest endpoint auth |
| `NTU_CATALOG_URL` | optional | Live NTU module catalog; falls back to built-in mock data if unset |

> The app loads `.env` automatically via `python-dotenv`. Missing optional keys just disable
> the corresponding feature (the router logs a warning and is skipped).

## Run

```bash
python run.py
```

This starts Uvicorn on `http://127.0.0.1:8000`.

- Health check: <http://127.0.0.1:8000/api/health>
- Interactive API docs (Swagger): <http://127.0.0.1:8000/docs>

For auto-reload during development you can instead run:

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

## Notes

- CORS is preconfigured for the frontend dev server (`http://localhost:5173` /
  `http://127.0.0.1:5173`).
- Academic data in this demo is mock/sample data — there is no live LMS connector yet.
