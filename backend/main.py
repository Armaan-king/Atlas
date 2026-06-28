"""Atlas Intelligence FastAPI application."""

from contextlib import asynccontextmanager
import logging

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
log = logging.getLogger("main")

from routers import career, catalog, chat, data, generate, graph, knowledge, parse


@asynccontextmanager
async def lifespan(app: FastAPI):
    """FastAPI lifespan hook."""
    log.info("Starting Atlas backend with OpenAI as the active model provider.")
    yield
    log.info("Shutting down Atlas backend.")

app = FastAPI(title="Atlas Intelligence API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    from routers import voice

    app.include_router(voice.router, prefix="/api")
except ImportError:
    log.warning("Voice router not found. Skipping.")

app.include_router(chat.router, prefix="/api")
app.include_router(generate.router, prefix="/api")
app.include_router(parse.router, prefix="/api")
app.include_router(graph.router, prefix="/api")
app.include_router(data.router, prefix="/api")
app.include_router(knowledge.router, prefix="/api")
app.include_router(catalog.router, prefix="/api")
app.include_router(career.router, prefix="/api")

try:
    from routers import mastery

    app.include_router(mastery.router, prefix="/api")
except ImportError:
    log.warning("Mastery router not found. Skipping.")

try:
    from routers import zo

    app.include_router(zo.router, prefix="/api")
    log.info("ZO email agent router registered")
except ImportError:
    log.warning("ZO router not found. Skipping.")

try:
    from routers import exa

    app.include_router(exa.router, prefix="/api")
    log.info("Exa router registered")
except ImportError:
    log.warning("Exa router not found. Skipping.")


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "provider": "openai",
        "agent_layer_ready": False,
        "agent_url": None,
    }
