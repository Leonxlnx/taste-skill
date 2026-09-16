import os
import uuid
import aiofiles
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
import redis.asyncio as aioredis

from app.db.session import get_db
from app.models.call import Call, CallStatus
from app.core.config import settings

router = APIRouter()

ALLOWED_EXTENSIONS = {".mp3", ".wav", ".m4a", ".ogg", ".flac"}
MAX_FILE_SIZE = 500 * 1024 * 1024


def get_redis():
    return aioredis.from_url(settings.REDIS_URL, decode_responses=True)


@router.post("/", response_model=dict)
async def upload_audio(
    file: UploadFile = File(...),
    agent_name: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"File type {ext} not supported.")

    call_id = uuid.uuid4()
    filename = f"{call_id}{ext}"
    dest_path = os.path.join(settings.AUDIO_UPLOAD_DIR, filename)
    os.makedirs(settings.AUDIO_UPLOAD_DIR, exist_ok=True)

    size = 0
    async with aiofiles.open(dest_path, "wb") as f:
        while chunk := await file.read(1024 * 1024):
            size += len(chunk)
            if size > MAX_FILE_SIZE:
                await f.close()
                os.unlink(dest_path)
                raise HTTPException(413, "File too large (max 500 MB).")
            await f.write(chunk)

    call = Call(
        id=call_id,
        filename=filename,
        original_filename=file.filename or filename,
        status=CallStatus.incoming,
        agent_name=agent_name,
    )
    db.add(call)
    await db.commit()
    await db.refresh(call)

    redis = get_redis()
    await redis.rpush("transcription_queue", str(call_id))
    await redis.aclose()

    return {"id": str(call_id), "status": call.status, "filename": filename}
