from __future__ import annotations
from typing import Any

PCI_TERMS = [
    "credit card", "card number", "cvv", "expiration date", "billing address",
    "bank account", "routing number", "social security", "ssn", "payment info",
]

COMPLIANCE_TERMS = [
    "cancel", "cancellation", "refund", "lawsuit", "attorney", "legal action",
    "dispute", "chargeback", "do not call", "remove me",
]


def score_transcript(
    transcript_json: dict[str, Any],
    duration_seconds: float | None,
) -> dict[str, Any]:
    segments = transcript_json.get("segments", [])
    words_all = []
    for seg in segments:
        words_all.extend(seg.get("words", []))

    word_count = len(words_all)
    transcript_text = " ".join(
        seg.get("text", "").strip() for seg in segments
    ).strip()

    confidences = [w["score"] for w in words_all if "score" in w]
    mean_word_confidence = (
        sum(confidences) / len(confidences) if confidences else None
    )

    logprobs = [seg.get("avg_logprob") for seg in segments if "avg_logprob" in seg]
    avg_logprob = sum(logprobs) / len(logprobs) if logprobs else None

    audio_quality_score = _compute_audio_quality(mean_word_confidence, avg_logprob)

    flags: list[str] = []
    status = _route(
        transcript_text=transcript_text,
        word_count=word_count,
        mean_word_confidence=mean_word_confidence,
        avg_logprob=avg_logprob,
        duration_seconds=duration_seconds,
        flags=flags,
    )

    return {
        "transcript_text": transcript_text,
        "word_count": word_count,
        "mean_word_confidence": mean_word_confidence,
        "avg_logprob": avg_logprob,
        "audio_quality_score": audio_quality_score,
        "qa_flags": flags,
        "status": status,
    }


def _compute_audio_quality(
    mean_word_confidence: float | None,
    avg_logprob: float | None,
) -> float | None:
    if mean_word_confidence is None and avg_logprob is None:
        return None
    score = 0.0
    weight = 0.0
    if mean_word_confidence is not None:
        score += mean_word_confidence * 60
        weight += 60
    if avg_logprob is not None:
        clamped = max(-2.0, min(0.0, avg_logprob))
        score += ((clamped + 2.0) / 2.0) * 40
        weight += 40
    return round((score / weight) * 100, 1) if weight else None


def _route(
    transcript_text: str,
    word_count: int,
    mean_word_confidence: float | None,
    avg_logprob: float | None,
    duration_seconds: float | None,
    flags: list[str],
) -> str:
    text_lower = transcript_text.lower()

    if word_count == 0 or not transcript_text:
        flags.append("empty_transcript")
        if mean_word_confidence is not None and mean_word_confidence < 0.40:
            return "poor_audio"
        return "failed"

    if mean_word_confidence is not None and mean_word_confidence < 0.60:
        flags.append("low_word_confidence")
        return "poor_audio"

    if avg_logprob is not None and avg_logprob < -1.0:
        flags.append("low_avg_logprob")
        return "needs_review"

    if duration_seconds is not None and duration_seconds < 20:
        flags.append("short_duration")
        return "needs_review"

    for term in PCI_TERMS:
        if term in text_lower:
            flags.append(f"pci_term:{term}")
            return "compliance_review"

    for term in COMPLIANCE_TERMS:
        if term in text_lower:
            flags.append(f"compliance_term:{term}")
            return "needs_review"

    return "passed"
