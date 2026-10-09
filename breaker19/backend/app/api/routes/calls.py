import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.db.session import get_db
from app.models.call import Call, CallStatus
from app.schemas.call import CallRead, CallList, CallUpdate

router = APIRouter()


@router.get("/", response_model=CallList)
async def list_calls(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    status: CallStatus | None = None,
    agent_name: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    q = select(Call)
    count_q = select(func.count()).select_from(Call)

    if status:
        q = q.where(Call.status == status)
        count_q = count_q.where(Call.status == status)
    if agent_name:
        q = q.where(Call.agent_name.ilike(f"%{agent_name}%"))
        count_q = count_q.where(Call.agent_name.ilike(f"%{agent_name}%"))

    total = (await db.execute(count_q)).scalar_one()
    items = (
        await db.execute(
            q.order_by(Call.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
    ).scalars().all()

    return CallList(items=list(items), total=total, page=page, page_size=page_size)


@router.get("/{call_id}", response_model=CallRead)
async def get_call(call_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    call = await db.get(Call, call_id)
    if not call:
        raise HTTPException(404, "Call not found.")
    return call


@router.patch("/{call_id}", response_model=CallRead)
async def update_call(
    call_id: uuid.UUID,
    body: CallUpdate,
    db: AsyncSession = Depends(get_db),
):
    call = await db.get(Call, call_id)
    if not call:
        raise HTTPException(404, "Call not found.")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(call, field, value)

    await db.commit()
    await db.refresh(call)
    return call


@router.delete("/{call_id}", status_code=204)
async def delete_call(call_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    call = await db.get(Call, call_id)
    if not call:
        raise HTTPException(404, "Call not found.")
    await db.delete(call)
    await db.commit()
