"""initial schema

Revision ID: 0001
Revises:
Create Date: 2024-01-01 00:00:00
"""
from typing import Sequence, Union
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSON
from alembic import op

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        CREATE TYPE callstatus AS ENUM (
            'incoming', 'transcribing', 'qa_scoring', 'passed',
            'needs_review', 'poor_audio', 'compliance_review',
            'coaching_needed', 'failed', 'complete'
        )
        """
    )
    op.create_table(
        "calls",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("filename", sa.String(512), nullable=False),
        sa.Column("original_filename", sa.String(512), nullable=False),
        sa.Column(
            "status",
            sa.Enum(
                "incoming", "transcribing", "qa_scoring", "passed",
                "needs_review", "poor_audio", "compliance_review",
                "coaching_needed", "failed", "complete",
                name="callstatus",
            ),
            nullable=False,
            server_default="incoming",
        ),
        sa.Column("duration_seconds", sa.Float, nullable=True),
        sa.Column("agent_name", sa.String(256), nullable=True),
        sa.Column("call_date", sa.DateTime, nullable=True),
        sa.Column("transcript_text", sa.Text, nullable=True),
        sa.Column("transcript_json", JSON, nullable=True),
        sa.Column("mean_word_confidence", sa.Float, nullable=True),
        sa.Column("avg_logprob", sa.Float, nullable=True),
        sa.Column("audio_quality_score", sa.Float, nullable=True),
        sa.Column("word_count", sa.Integer, nullable=True),
        sa.Column("qa_flags", JSON, nullable=True),
        sa.Column("qa_notes", sa.Text, nullable=True),
        sa.Column("reviewer_notes", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_calls_status", "calls", ["status"])
    op.create_index("ix_calls_agent_name", "calls", ["agent_name"])
    op.create_index("ix_calls_created_at", "calls", ["created_at"])


def downgrade() -> None:
    op.drop_table("calls")
    op.execute("DROP TYPE callstatus")
