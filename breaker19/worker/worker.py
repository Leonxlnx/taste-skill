import os
import time
import logging
import subprocess
import tempfile
import json

import redis
import whisperx
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

DATABASE_URL = os.environ["DATABASE_URL"]
REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379")
AUDIO_DIR = os.environ.get("AUDIO_UPLOAD_DIR", "/data/audio")
WHISPERX_MODEL = os.environ.get("WHISPERX_MODEL", "base")
DEVICE = os.environ.get("WHISPERX_DEVICE", "cpu")
HF_TOKEN = os.environ.get("HF_TOKEN", "")
COMPUTE_TYPE = "int8" if DEVICE == "cpu" else "float16"
QUEUE_KEY = "transcription_queue"

log.info("Loading WhisperX model: %s on %s", WHISPERX_MODEL, DEVICE)
asr_model = whisperx.load_model(
    WHISPERX_MODEL, DEVICE, compute_type=COMPUTE_TYPE, language="en"
)
log.info("Model loaded.")

engine = create_engine(DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://"))
rdb = redis.from_url(REDIS_URL, decode_responses=True)


def normalize_audio(input_path: str, output_path: str) -> None:
    cmd = [
        "ffmpeg", "-y",
        "-i", input_path,
        "-ac", "1",
        "-ar", "16000",
        "-af", "volume=30dB,dynaudnorm=f=75:g=25,highpass=f=120,lowpass=f=3800",
        output_path,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg failed: {result.stderr}")


def get_duration(path: str) -> float | None:
    cmd = [
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", path,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    try:
        return float(result.stdout.strip())
    except (ValueError, AttributeError):
        return None


def score_transcript(transcript_json: dict, duration: float | None) -> dict:
    PCI_TERMS = [
        "credit card", "card number", "cvv", "expiration date",
        "billing address", "bank account", "routing number",
        "social security", "ssn", "payment info",
    ]
    COMPLIANCE_TERMS = [
        "cancel", "cancellation", "refund", "lawsuit", "attorney",
        "legal action", "dispute", "chargeback", "do not call", "remove me",
    ]

    segments = transcript_json.get("segments", [])
    words_all = []
    for seg in segments:
        words_all.extend(seg.get("words", []))

    word_count = len(words_all)
    transcript_text = " ".join(seg.get("text", "").strip() for seg in segments).strip()
    text_lower = transcript_text.lower()

    confidences = [w["score"] for w in words_all if "score" in w]
    mean_conf = sum(confidences) / len(confidences) if confidences else None

    logprobs = [seg.get("avg_logprob") for seg in segments if "avg_logprob" in seg]
    avg_logprob = sum(logprobs) / len(logprobs) if logprobs else None

    score = 0.0
    weight = 0.0
    if mean_conf is not None:
        score += mean_conf * 60
        weight += 60
    if avg_logprob is not None:
        clamped = max(-2.0, min(0.0, avg_logprob))
        score += ((clamped + 2.0) / 2.0) * 40
        weight += 40
    aq_score = round((score / weight) * 100, 1) if weight else None

    flags = []
    if word_count == 0 or not transcript_text:
        flags.append("empty_transcript")
        status = "poor_audio" if (mean_conf and mean_conf < 0.40) else "failed"
    elif mean_conf is not None and mean_conf < 0.60:
        flags.append("low_word_confidence")
        status = "poor_audio"
    elif avg_logprob is not None and avg_logprob < -1.0:
        flags.append("low_avg_logprob")
        status = "needs_review"
    elif duration is not None and duration < 20:
        flags.append("short_duration")
        status = "needs_review"
    else:
        status = "passed"
        for term in PCI_TERMS:
            if term in text_lower:
                flags.append(f"pci_term:{term}")
                status = "compliance_review"
                break
        if status == "passed":
            for term in COMPLIANCE_TERMS:
                if term in text_lower:
                    flags.append(f"compliance_term:{term}")
                    status = "needs_review"
                    break

    return {
        "transcript_text": transcript_text,
        "word_count": word_count,
        "mean_word_confidence": mean_conf,
        "avg_logprob": avg_logprob,
        "audio_quality_score": aq_score,
        "qa_flags": flags,
        "status": status,
    }


def process_call(call_id: str) -> None:
    with Session(engine) as session:
        row = session.execute(
            text("SELECT id, filename, status FROM calls WHERE id = :id"),
            {"id": call_id},
        ).fetchone()

        if not row:
            log.warning("Call %s not found in DB", call_id)
            return

        filename = row.filename
        audio_path = os.path.join(AUDIO_DIR, filename)

        if not os.path.exists(audio_path):
            log.error("Audio file not found: %s", audio_path)
            session.execute(
                text("UPDATE calls SET status='failed', updated_at=now() WHERE id=:id"),
                {"id": call_id},
            )
            session.commit()
            return

        session.execute(
            text("UPDATE calls SET status='transcribing', updated_at=now() WHERE id=:id"),
            {"id": call_id},
        )
        session.commit()

        duration = get_duration(audio_path)

        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            clean_path = tmp.name

        try:
            log.info("Normalizing audio for call %s", call_id)
            normalize_audio(audio_path, clean_path)

            log.info("Transcribing call %s", call_id)
            audio = whisperx.load_audio(clean_path)
            result = asr_model.transcribe(audio, batch_size=16)

            try:
                align_model, metadata = whisperx.load_align_model(
                    language_code=result.get("language", "en"), device=DEVICE
                )
                result = whisperx.align(
                    result["segments"], align_model, metadata, audio, DEVICE,
                    return_char_alignments=False,
                )
            except Exception as e:
                log.warning("Alignment failed (non-fatal): %s", e)

            session.execute(
                text("UPDATE calls SET status='qa_scoring', updated_at=now() WHERE id=:id"),
                {"id": call_id},
            )
            session.commit()

            scored = score_transcript(result, duration)

            session.execute(
                text("""
                    UPDATE calls SET
                        status = :status,
                        transcript_text = :transcript_text,
                        transcript_json = :transcript_json,
                        mean_word_confidence = :mean_word_confidence,
                        avg_logprob = :avg_logprob,
                        audio_quality_score = :audio_quality_score,
                        word_count = :word_count,
                        qa_flags = :qa_flags,
                        duration_seconds = :duration_seconds,
                        updated_at = now()
                    WHERE id = :id
                """),
                {
                    "id": call_id,
                    "status": scored["status"],
                    "transcript_text": scored["transcript_text"],
                    "transcript_json": json.dumps(result),
                    "mean_word_confidence": scored["mean_word_confidence"],
                    "avg_logprob": scored["avg_logprob"],
                    "audio_quality_score": scored["audio_quality_score"],
                    "word_count": scored["word_count"],
                    "qa_flags": json.dumps(scored["qa_flags"]),
                    "duration_seconds": duration,
                },
            )
            session.commit()
            log.info("Call %s done - status: %s", call_id, scored["status"])

        finally:
            if os.path.exists(clean_path):
                os.unlink(clean_path)


def main():
    log.info("Worker started. Watching queue: %s", QUEUE_KEY)
    while True:
        try:
            item = rdb.blpop(QUEUE_KEY, timeout=5)
            if item is None:
                continue
            _, call_id = item
            log.info("Processing call: %s", call_id)
            process_call(call_id)
        except Exception as e:
            log.exception("Unexpected error processing call: %s", e)
            time.sleep(2)


if __name__ == "__main__":
    main()
