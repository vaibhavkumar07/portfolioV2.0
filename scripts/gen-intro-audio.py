#!/usr/bin/env python3
"""
Generate the Intro Presenter narration audio with edge-tts (free Microsoft
neural voices, no API key). Emits one MP3 per segment into public/intro/ plus
a timeline.json manifest the React player consumes.

Per-segment files mean exact section sync: the player advances to the next
section on each clip's `ended` event — no timestamp math needed.

Usage:
    python3 scripts/gen-intro-audio.py [--voice en-US-GuyNeural]

Re-run any time you edit the script text or change the voice.
"""
import asyncio
import argparse
import json
import os

import edge_tts
from intro_script import GREETINGS, SEGMENTS, CAPTIONS

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "public", "intro")


async def render(text: str, voice: str, path: str) -> None:
    await edge_tts.Communicate(text, voice).save(path)
    print(f"  wrote {os.path.relpath(path, ROOT)}")


async def main(voice: str) -> None:
    os.makedirs(OUT_DIR, exist_ok=True)
    print(f"Voice: {voice}\nOutput: {os.path.relpath(OUT_DIR, ROOT)}/")

    greetings = {}
    for key, text in GREETINGS.items():
        fname = f"greet-{key}.mp3"
        await render(text, voice, os.path.join(OUT_DIR, fname))
        greetings[key] = {"file": fname, "section": "hero", "text": CAPTIONS[key]}

    segments = []
    for seg in SEGMENTS:
        fname = f"seg-{seg['id']}.mp3"
        await render(seg["text"], voice, os.path.join(OUT_DIR, fname))
        segments.append({
            "id": seg["id"],
            "file": fname,
            "section": seg["section"],
            "text": CAPTIONS[seg["id"]],
        })

    manifest = {"voice": voice, "greetings": greetings, "segments": segments}
    with open(os.path.join(OUT_DIR, "timeline.json"), "w") as f:
        json.dump(manifest, f, indent=2)
    print(f"  wrote {os.path.relpath(os.path.join(OUT_DIR, 'timeline.json'), ROOT)}")
    print("Done.")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice", default="en-US-GuyNeural")
    args = ap.parse_args()
    asyncio.run(main(args.voice))
