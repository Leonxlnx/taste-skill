from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://breaker19:breaker19secret@localhost:5432/breaker19"
    REDIS_URL: str = "redis://localhost:6379"
    AUDIO_UPLOAD_DIR: str = "/data/audio"
    SECRET_KEY: str = "changeme-in-production"
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"


settings = Settings()
