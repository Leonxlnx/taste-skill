from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.db.session import get_db
from app.models.call import Call

router = APIRouter()


@router.get("/")
async def get_stats(db: AsyncSession = Depends(get_db)):
    rows = (
        await db.execute(
            select(Call.status, func.count().label("count")).group_by(Call.status)
        )
    ).all()

    by_status = {r.status: r.count for r in rows}
    total = sum(by_status.values())

    avg_quality = (
        await db.execute(
            select(func.avg(Call.audio_quality_score)).where(
                Call.audio_quality_score.isnot(None)
            )
        )
    ).scalar_one_or_none()

    return {
        "total": total,
        "by_status": by_status,
        "avg_audio_quality_score": round(avg_quality, 1) if avg_quality else None,
    }
