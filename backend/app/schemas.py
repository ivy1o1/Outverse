
from datetime import datetime, timezone
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


PillarId = Literal[
    "hidden_patterns",
    "forgotten_stories",
    "invisible_systems",
    "human_traces",
]

Difficulty = Literal["easy", "moderate", "challenging"]


def to_camel(value: str) -> str:
    first, *rest = value.split("_")
    return first + "".join(part.capitalize() for part in rest)


class APIModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        extra="forbid",
    )


class MissionDraft(APIModel):
    question: str = Field(min_length=10, max_length=180)
    objective: str = Field(min_length=10, max_length=500)
    instructions: list[str] = Field(min_length=3, max_length=6)
    duration_minutes: int = Field(ge=2, le=60)
    difficulty: Difficulty
    safety_notes: list[str] = Field(default_factory=list, max_length=5)


class Mission(MissionDraft):
    id: str
    pillar: PillarId
    created_at: str


class GenerateMissionsRequest(APIModel):
    pillar: PillarId


class GenerateMissionsResponse(APIModel):
    missions: list[Mission] = Field(min_length=1, max_length=5)


class MissionContext(APIModel):
    id: str
    pillar: PillarId
    question: str
    objective: str
    instructions: list[str] = Field(max_length=6)


class AnalyzeReflectionRequest(APIModel):
    mission: MissionContext
    notes: str = Field(min_length=12, max_length=8000)


class AnalyzeReflectionResponse(APIModel):
    reflection: str = Field(min_length=20, max_length=3000)


def make_mission(draft: MissionDraft, pillar: PillarId) -> Mission:
    return Mission(
        **draft.model_dump(),
        id=__import__("uuid").uuid4().hex,
        pillar=pillar,
        created_at=datetime.now(timezone.utc).isoformat(),
    )
