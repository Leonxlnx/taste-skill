import uuid
from datetime import datetime
from sqlalchemy import String, Float, Integer, Text, DateTime, JSON, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
import enum

from app.db.session import Base


class CallStatus(str, enum.Enum):
    incoming = "incoming"
    transcribing = "transcribing"
    qa_scoring = "qa_scoring"
    passed = "passed"
    needs_review = "needs_review"
    poor_audio = "poor_audio"
    compliance_review = "compliance_review"
    coaching_needed = "coaching_needed"
    failed = "failed"
    complete = "complete"


class Call(Base):
    __tablename__ = "calls"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    filename: Mapped[str] = mapped_column(String(512), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(512), nullable=False)
    status: Mapped[CallStatus] = mapped_column(
        SAEnum(CallStatus, name="callstatus"), default=CallStatus.incoming, nullable=False
    )
    duration_seconds: Mapped[float | None] = mapped_column(Float, nullable=True)
    agent_name: Mapped[str | None] = mapped_column(String(256), nullable=True)
    call_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    transcript_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    transcript_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    mean_word_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    avg_logprob: Mapped[float | None] = mapped_column(Float, nullable=True)
    audio_quality_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    word_count: Mapped[int | None] = mapped_column(Integer, nullable=True)

    qa_flags: Mapped[list | None] = mapped_column(JSON, nullable=True)
    qa_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    reviewer_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
