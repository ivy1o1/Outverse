
import logging
from functools import lru_cache

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic_settings import BaseSettings, SettingsConfigDict

from app import gemma
from app.schemas import (
    AnalyzeReflectionRequest,
    AnalyzeReflectionResponse,
    GenerateMissionsRequest,
    GenerateMissionsResponse,
    make_mission,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AppSettings(BaseSettings):
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


@lru_cache
def get_app_settings() -> AppSettings:
    return AppSettings()


app = FastAPI(
    title="Outverse API",
    version="0.1.0",
    description="Observation missions and reflection analysis.",
)

origins = [
    origin.strip()
    for origin in get_app_settings().cors_origins.split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_configured": bool(gemma.get_settings().gemini_api_key),
    }


@app.post(
    "/api/v1/missions/generate",
    response_model=GenerateMissionsResponse,
)
def create_missions(
    request: GenerateMissionsRequest,
) -> GenerateMissionsResponse:
    try:
        drafts = gemma.generate_missions(request.pillar)
        missions = [
            make_mission(draft, request.pillar)
            for draft in drafts
        ]
        return GenerateMissionsResponse(missions=missions)

    except Exception as exc:
        logger.exception("Mission generation failed")
        raise HTTPException(
            status_code=503,
            detail="Mission generation is temporarily unavailable. Please try again.",
        ) from exc


@app.post(
    "/api/v1/reflections/analyze",
    response_model=AnalyzeReflectionResponse,
)
def create_reflection(
    request: AnalyzeReflectionRequest,
) -> AnalyzeReflectionResponse:
    try:
        reflection = gemma.analyze_reflection(request)
        return AnalyzeReflectionResponse(reflection=reflection)

    except Exception as exc:
        logger.exception("Reflection analysis failed")
        raise HTTPException(
            status_code=503,
            detail="Reflection analysis is temporarily unavailable. Your notes have not been changed.",
        ) from exc
