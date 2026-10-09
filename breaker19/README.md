# Breaker19

AI-powered call center quality assurance. Upload call recordings -> automatic
transcription via WhisperX -> quality scoring -> QA routing.

## Stack

| Layer | Tech |
|-------|------|
| Backend API | FastAPI + SQLAlchemy (async) |
| Database | PostgreSQL 16 |
| Queue | Redis |
| Transcription | WhisperX (Faster-Whisper) |
| Frontend | Next.js 14 + Tailwind CSS |
| Containers | Docker Compose |

## Statuses

`incoming` -> `transcribing` -> `qa_scoring` -> one of:

- `passed` -- clean call, all checks pass
- `needs_review` -- low confidence, short duration, or compliance language
- `poor_audio` -- mean word confidence < 60%
- `compliance_review` -- PCI/payment terms detected
- `coaching_needed` -- manually flagged for coaching
- `failed` -- empty transcript or processing error
- `complete` -- reviewed and closed

## Development

```bash
# Start all services
docker compose up -d

# Run migrations
docker compose exec backend alembic upgrade head

# Watch worker logs
docker compose logs -f worker
```

See [docs/DEPLOY.md](docs/DEPLOY.md) for production deployment on DigitalOcean.
