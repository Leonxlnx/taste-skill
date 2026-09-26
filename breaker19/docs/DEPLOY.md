# Breaker19 - DigitalOcean Deployment

## Prerequisites

- DigitalOcean GPU Droplet at `146.190.240.94`
- Docker + Docker Compose installed
- WhisperX installed at `/opt/riptide-voice` (verified working)
- Ports 80, 3000, 8000 open in firewall

## Quick Deploy

### 1. Clone the repo on the droplet

```bash
ssh root@146.190.240.94
cd /opt
git clone <repo-url> breaker19
cd breaker19/breaker19
```

### 2. Configure environment

```bash
cp .env.example .env
nano .env
```

Set at minimum:
- `POSTGRES_PASSWORD` - strong password
- `SECRET_KEY` - random 32-char string
- `HF_TOKEN` - HuggingFace token for WhisperX diarization
- `WHISPERX_DEVICE=cuda` for GPU transcription

### 3. Build and start

```bash
docker compose up -d --build
```

### 4. Run DB migrations

```bash
docker compose exec backend alembic upgrade head
```

### 5. Verify

```bash
curl http://146.190.240.94:8000/health
# {"status":"ok"}
```

Frontend: `http://146.190.240.94:3000`

## Architecture

```
Browser -> Next.js :3000 -> FastAPI :8000 -> Postgres
                                           -> Redis -> WhisperX Worker (GPU)
```

## Audio Preprocessing

The worker automatically normalizes audio before transcription:

```bash
ffmpeg -y -i "$INPUT" -ac 1 -ar 16000 \
  -af "volume=30dB,dynaudnorm=f=75:g=25,highpass=f=120,lowpass=f=3800" \
  "$OUTPUT"
```

## QA Routing Rules

| Condition | Status |
|-----------|--------|
| mean word confidence < 0.60 | `poor_audio` |
| avg_logprob < -1.0 | `needs_review` |
| duration < 20 seconds | `needs_review` |
| empty transcript | `failed` or `poor_audio` |
| PCI/payment terms detected | `compliance_review` |
| cancellation/legal language | `needs_review` |
| All checks pass | `passed` |

## Worker Models

- `base` - fast, lower accuracy
- `small` - balanced
- `medium` - better accuracy
- `large-v2` - best accuracy, more VRAM

## Updating

```bash
git pull && docker compose up -d --build
docker compose exec backend alembic upgrade head
```

## Logs

```bash
docker compose logs -f worker    # transcription
docker compose logs -f backend   # API
docker compose logs -f frontend  # UI
```
