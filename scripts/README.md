# Intro Presenter — asset pipeline

The narrated intro (shown right after "Accept call") plays per-segment audio and
reveals the matching portfolio section. Assets live in `public/intro/`.

## 1. Audio (shipped, free, no API key)

Generated with [edge-tts](https://github.com/rany2/edge-tts) (Microsoft neural voices):

```bash
pip install edge-tts
python3 scripts/gen-intro-audio.py --voice en-US-GuyNeural
```

Outputs to `public/intro/`:
- `greet-morning.mp3`, `greet-afternoon.mp3`, `greet-evening.mp3` — time-of-day greeting
- `seg-about.mp3`, `seg-work.mp3`, `seg-skills.mp3`, `seg-contact.mp3` — body
- `timeline.json` — manifest (file → section → caption) the player consumes

Edit the script text or `--voice` in `scripts/gen-intro-audio.py` and re-run.
Other free voices: `en-US-EricNeural`, `en-IN-PrabhatNeural` (Indian English).
List all: `edge-tts --list-voices`.

The player ([src/hooks/useNarrationSync.ts](../src/hooks/useNarrationSync.ts))
advances the section on each clip's `ended` event — exact sync, no timestamps.
If audio fails to load it falls back to timed captions automatically.

## 2. Talking-avatar video (optional upgrade, free + local)

Current build uses a static animated avatar (`public/profile.jpeg`) + speaking
rings. To make it a lip-synced talking head with **no paid service**:

1. Provide a frontal, well-lit photo of you **seated at your workspace**
   (upper body, desk visible, mouth closed) — replaces the headshot as the source.
2. Generate audio (step 1 above).
3. Lip-sync the photo to each MP3 with open-source [Wav2Lip](https://github.com/Rudrabha/Wav2Lip)
   (or [SadTalker](https://github.com/OpenTalker/SadTalker)) — runs locally on CPU/GPU:
   ```bash
   python inference.py --checkpoint_path wav2lip_gan.pth \
     --face workspace.jpg --audio public/intro/greet-morning.mp3 \
     --outfile public/intro/greet-morning.mp4
   # repeat for each greeting + segment clip
   ```
4. Compress for web with ffmpeg (`brew install ffmpeg`):
   ```bash
   ffmpeg -i in.mp4 -vcodec libx264 -crf 28 -preset slow -movflags +faststart out.mp4
   ```
5. Swap the `<img>` in [src/components/Intro/index.tsx](../src/components/Intro/index.tsx)
   for a `<video>` that loads `intro/<id>.mp4`; the manifest already carries `file`
   per step (point it at the `.mp4` instead of `.mp3`).

That's it — same sync logic, video instead of a static avatar.
