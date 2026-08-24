from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes import calls, uploads, stats

app = FastAPI(title="Breaker19 API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(calls.router, prefix="/api/calls", tags=["calls"])
app.include_router(uploads.router, prefix="/api/uploads", tags=["uploads"])
app.include_router(stats.router, prefix="/api/stats", tags=["stats"])


@app.get("/health")
def health():
    return {"status": "ok"}
