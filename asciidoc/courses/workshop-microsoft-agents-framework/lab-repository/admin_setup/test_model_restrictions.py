#!/usr/bin/env python3
"""
Test OpenAI API Key Model Restrictions

Verifies that the workshop API key is restricted to only the allowed models
(gpt-5-mini, text-embedding-3-small) and that expensive/large models are blocked.

Usage:
    python admin_setup/test_model_restrictions.py
"""

import io
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI

# Load .env from repo root
load_dotenv(Path(__file__).resolve().parent.parent / ".env", override=True)

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

# ---------------------------------------------------------------------------
# Models to test: (model, endpoint_type)
#
# endpoint_type is one of:
#   "chat"      - Responses API (client.responses.create)
#   "embedding" - Embeddings API (client.embeddings.create)
#   "image"     - Images API (client.images.generate)
#   "tts"       - Audio Speech API (client.audio.speech.create)
#   "stt"       - Audio Transcriptions API (client.audio.transcriptions.create)
# ---------------------------------------------------------------------------

SHOULD_WORK = [
    ("gpt-5-mini", "chat"),
    ("text-embedding-3-small", "embedding"),
]

SHOULD_FAIL = [
    # Big flagship models
    ("gpt-5.4", "chat"),
    ("gpt-5.4-pro", "chat"),
    ("gpt-5.2", "chat"),
    ("gpt-5.2-pro", "chat"),
    ("gpt-5.1", "chat"),
    ("gpt-5", "chat"),
    # Codex models
    ("gpt-5.3-codex", "chat"),
    ("gpt-5.2-codex", "chat"),
    ("gpt-5.1-codex", "chat"),
    ("gpt-5-codex", "chat"),
    ("codex-mini-latest", "chat"),
    # Reasoning models
    ("o3-pro", "chat"),
    ("o3", "chat"),
    ("o4-mini", "chat"),
    # Previous gen
    ("gpt-4o", "chat"),
    ("gpt-4.1", "chat"),
    ("gpt-5-nano", "chat"),
    # Image generation
    ("dall-e-2", "image"),
    ("gpt-image-1", "image"),
    # Audio models
    ("tts-1-1106", "tts"),
    ("whisper-1", "stt"),
    # Computer use
    ("computer-use-preview", "chat"),
]

# ---------------------------------------------------------------------------
# Test functions per endpoint type
# ---------------------------------------------------------------------------


def test_chat(model: str) -> tuple[bool, str]:
    """Attempt a minimal Responses API call."""
    try:
        resp = client.responses.create(
            model=model,
            input="Say hi in exactly one word.",
            max_output_tokens=100,
        )
        return True, f"response: {resp.output_text[:40]}"
    except Exception as e:
        return False, str(e)[:120]


def test_embedding(model: str) -> tuple[bool, str]:
    """Attempt a minimal embedding call."""
    try:
        resp = client.embeddings.create(
            model=model,
            input="test",
        )
        dims = len(resp.data[0].embedding)
        return True, f"dims={dims}"
    except Exception as e:
        return False, str(e)[:120]


def test_image(model: str) -> tuple[bool, str]:
    """Attempt a minimal image generation call."""
    try:
        resp = client.images.generate(
            model=model,
            prompt="a single white pixel",
            size="256x256" if model == "dall-e-2" else "1024x1024",
        )
        return True, f"image generated"
    except Exception as e:
        return False, str(e)[:120]


def test_tts(model: str) -> tuple[bool, str]:
    """Attempt a minimal text-to-speech call."""
    try:
        resp = client.audio.speech.create(
            model=model,
            voice="alloy",
            input="hi",
        )
        return True, f"audio generated"
    except Exception as e:
        return False, str(e)[:120]


def test_stt(model: str) -> tuple[bool, str]:
    """Attempt a minimal speech-to-text call with a tiny WAV."""
    try:
        # Minimal valid WAV: 44-byte header + 800 bytes of silence (0.1s mono 8kHz 8bit)
        silence = b'\x80' * 800
        data_size = len(silence)
        file_size = 36 + data_size
        wav = (
            b'RIFF' + file_size.to_bytes(4, 'little') + b'WAVE'
            + b'fmt ' + (16).to_bytes(4, 'little')
            + (1).to_bytes(2, 'little')       # PCM
            + (1).to_bytes(2, 'little')       # mono
            + (8000).to_bytes(4, 'little')    # sample rate
            + (8000).to_bytes(4, 'little')    # byte rate
            + (1).to_bytes(2, 'little')       # block align
            + (8).to_bytes(2, 'little')       # bits per sample
            + b'data' + data_size.to_bytes(4, 'little')
            + silence
        )
        audio_file = io.BytesIO(wav)
        audio_file.name = "test.wav"
        resp = client.audio.transcriptions.create(
            model=model,
            file=audio_file,
        )
        return True, f"transcription ok"
    except Exception as e:
        return False, str(e)[:120]


TEST_FN = {
    "chat": test_chat,
    "embedding": test_embedding,
    "image": test_image,
    "tts": test_tts,
    "stt": test_stt,
}


def main():
    passed = 0
    failed = 0

    print("=" * 70)
    print("  OpenAI API Key Model Restriction Test")
    print("=" * 70)

    # --- Models that SHOULD work ---
    print("\n  ALLOWED MODELS (should succeed)")
    print("  " + "-" * 66)
    for model, kind in SHOULD_WORK:
        ok, detail = TEST_FN[kind](model)
        status = "PASS" if ok else "FAIL"
        icon = "\u2713" if ok else "\u2717"
        print(f"  {icon} {status}  {model:<30} {detail}")
        if ok:
            passed += 1
        else:
            failed += 1

    # --- Models that SHOULD fail ---
    print("\n  BLOCKED MODELS (should fail)")
    print("  " + "-" * 66)
    for model, kind in SHOULD_FAIL:
        ok, detail = TEST_FN[kind](model)
        # For blocked models, success means the restriction FAILED
        restricted = not ok
        status = "PASS" if restricted else "FAIL"
        icon = "\u2713" if restricted else "\u2717"
        label = "blocked" if restricted else "NOT BLOCKED!"
        print(f"  {icon} {status}  {model:<30} {label}: {detail}")
        if restricted:
            passed += 1
        else:
            failed += 1

    # --- Summary ---
    print(f"\n{'=' * 70}")
    print(f"  Results: {passed} passed, {failed} failed")
    if failed:
        print("  \u26a0  Some restrictions are not working as expected!")
    else:
        print("  All model restrictions verified successfully.")
    print("=" * 70)

    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
