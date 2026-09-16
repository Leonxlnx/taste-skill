from __future__ import annotations
import uuid
from datetime import datetime
from typing import Any
from pydantic import BaseModel, ConfigDict

from app.models.call import CallStatus


class CallBase(BaseModel):
    original_filename: str
    agent_name: str | None = None
    call_date: datetime | None = None


class CallCreate(CallBase):
    filename: str


class CallUpdate(BaseModel):
    status: CallStatus | None = None
    reviewer_notes: str | None = None
    qa_notes: str | None = None
    agent_name: str | None = None


class CallRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    filename: str
    original_filename: str
    status: CallStatus
    duration_seconds: float | None
    agent_name: str | None
    call_date: datetime | None
    transcript_text: str | None
    transcript_json: Any | None
    mean_word_confidence: float | None
    avg_logprob: float | None
    audio_quality_score: float | None
    word_count: int | None
    qa_flags: list | None
    qa_notes: str | None
    reviewer_notes: str | None
    created_at: datetime
    updated_at: datetime


class CallList(BaseModel):
    items: list[CallRead]
    total: int
    page: int
    page_size: int
