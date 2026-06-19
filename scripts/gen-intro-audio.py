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

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "public", "intro")

# Greeting clips (time-of-day). Each is self-contained: greeting + identity.
GREETINGS = {
    "morning": "Good morning, and thanks for picking up. I'm Vaibhav, "
               "a Genesys Cloud I-V-R developer based in Richardson, Texas. "
               "Welcome to my workspace. Let me walk you through what I do.",
    "afternoon": "Good afternoon, and thanks for picking up. I'm Vaibhav, "
                 "a Genesys Cloud I-V-R developer based in Richardson, Texas. "
                 "Welcome to my workspace. Let me walk you through what I do.",
    "evening": "Good evening, and thanks for taking my call. I'm Vaibhav, "
               "a Genesys Cloud I-V-R developer based in Richardson, Texas. "
               "Welcome to my workspace. Let me walk you through what I do.",
}

# Body segments. `section` is the DOM id revealed while the clip plays.
SEGMENTS = [
    {
        "id": "about",
        "section": "about",
        "text": "For seven plus years at Infosys, I've designed enterprise "
                "contact center solutions that handle millions of calls for "
                "healthcare and e-commerce clients, building I-V-R and bot flows "
                "in Genesys Architect and A-I Studio.",
    },
    {
        "id": "work",
        "section": "work",
        "text": "Here are a few projects I'm proud of. A cloud contact center "
                "modernization with OpenAI powered journeys, a full Genesys "
                "configuration tool, and omnichannel voice bots on Dialogflow "
                "and Cisco.",
    },
    {
        "id": "skills",
        "section": "skills",
        "text": "My toolkit spans the Genesys platform, A-I services like Azure "
                "Speech and OpenAI, and solid engineering in Java, Python, and "
                "React, backed by ten certifications and an I-o-T patent.",
    },
    {
        "id": "contact",
        "section": "contact",
        "text": "If this fits what you're building, let's talk. Press the "
                "contact option, or just stay on the line. Thanks for connecting.",
    },
]

# Caption text (clean, no TTS spelling hints like "I-V-R").
CAPTIONS = {
    "morning": "Good morning, and thanks for picking up. I'm Vaibhav, a Genesys "
               "Cloud IVR developer based in Richardson, Texas. Welcome to my "
               "workspace — let me walk you through what I do.",
    "afternoon": "Good afternoon, and thanks for picking up. I'm Vaibhav, a Genesys "
                 "Cloud IVR developer based in Richardson, Texas. Welcome to my "
                 "workspace — let me walk you through what I do.",
    "evening": "Good evening, and thanks for taking my call. I'm Vaibhav, a Genesys "
               "Cloud IVR developer based in Richardson, Texas. Welcome to my "
               "workspace — let me walk you through what I do.",
    "about": "For 7+ years at Infosys I've designed enterprise contact-center "
             "solutions handling millions of calls for healthcare and e-commerce "
             "clients — IVR and bot flows in Genesys Architect and AI Studio.",
    "work": "Projects I'm proud of: a cloud contact-center modernization with "
            "OpenAI-powered journeys, a full Genesys configuration tool, and "
            "omnichannel voice bots on Dialogflow and Cisco.",
    "skills": "My toolkit spans the Genesys platform, AI services like Azure Speech "
              "and OpenAI, and engineering in Java, Python, and React — backed by "
              "10 certifications and an IoT patent.",
    "contact": "If this fits what you're building, let's talk. Press the contact "
               "option, or just stay on the line. Thanks for connecting.",
}


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
