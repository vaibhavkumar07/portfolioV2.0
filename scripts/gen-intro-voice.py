#!/usr/bin/env python3
"""
Generate the Intro Presenter narration with NVIDIA Magpie TTS (multilingual).
Emits one WAV per step into public/intro/ plus timeline.json. WAV (PCM) plays
natively in every browser, including headless Chromium.

Setup:
    pip install nvidia-riva-client
    # NVIDIA_TTS_API_KEY in .env (gitignored)

Run:
    set -a && . ./.env && set +a && python3 scripts/gen-intro-voice.py
    # optional: --voice Magpie-Multilingual.EN-US.Mia
"""
import argparse
import json
import os

import lameenc
import riva.client
from intro_script import GREETINGS, SEGMENTS, CAPTIONS

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "public", "intro")
FUNCTION_ID = "877104f7-e885-42b9-8de8-f6e4c6303969"  # ai-magpie-tts-multilingual
SAMPLE_RATE = 44100


def get_service():
    key = os.environ.get("NVIDIA_TTS_API_KEY")
    if not key:
        raise SystemExit("Missing NVIDIA_TTS_API_KEY (source .env first)")
    auth = riva.client.Auth(
        uri="grpc.nvcf.nvidia.com:443", use_ssl=True,
        metadata_args=[["function-id", FUNCTION_ID], ["authorization", f"Bearer {key}"]],
    )
    return riva.client.SpeechSynthesisService(auth)


def pcm_to_mp3(pcm: bytes) -> bytes:
    enc = lameenc.Encoder()
    enc.set_bit_rate(96)
    enc.set_in_sample_rate(SAMPLE_RATE)
    enc.set_channels(1)
    enc.set_quality(2)
    return enc.encode(pcm) + enc.flush()


def synth(tts, text, voice, path):
    resp = tts.synthesize(
        text=text, voice_name=voice, language_code="en-US",
        sample_rate_hz=SAMPLE_RATE, encoding=riva.client.AudioEncoding.LINEAR_PCM,
    )
    mp3 = pcm_to_mp3(resp.audio)
    with open(path, "wb") as f:
        f.write(mp3)
    print(f"  wrote {os.path.relpath(path, ROOT)} ({len(mp3)//1024} KB)")


def main(voice):
    os.makedirs(OUT_DIR, exist_ok=True)
    tts = get_service()
    print(f"Voice: {voice}\nOutput: {os.path.relpath(OUT_DIR, ROOT)}/")

    greetings = {}
    for key, text in GREETINGS.items():
        fname = f"greet-{key}.mp3"
        synth(tts, text, voice, os.path.join(OUT_DIR, fname))
        greetings[key] = {"file": fname, "section": "hero", "text": CAPTIONS[key]}

    segments = []
    for seg in SEGMENTS:
        fname = f"seg-{seg['id']}.mp3"
        synth(tts, seg["text"], voice, os.path.join(OUT_DIR, fname))
        segments.append({"id": seg["id"], "file": fname, "section": seg["section"], "text": CAPTIONS[seg["id"]]})

    manifest = {"voice": voice, "greetings": greetings, "segments": segments}
    with open(os.path.join(OUT_DIR, "timeline.json"), "w") as f:
        json.dump(manifest, f, indent=2)
    print("  wrote public/intro/timeline.json\nDone.")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice", default="Magpie-Multilingual.EN-US.Ray")
    main(ap.parse_args().voice)
