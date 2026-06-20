#!/usr/bin/env python3
"""
Render real lip-synced talking-head clips for the Intro Presenter with SadTalker.

For each voice mp3 in public/intro/, animates presenter.jpg → public/intro/<id>.mp4
(face animates, workspace background kept via --preprocess full), then patches
timeline.json to add a `video` field per step. The React player auto-switches to
video when those fields exist.

Prereqs (already set up by the session):
  - SadTalker cloned in tools/SadTalker with checkpoints/ + gfpgan/weights/
  - torch, basicsr (patched), face_alignment, etc. installed
  - imageio-ffmpeg provides the ffmpeg binary

Run:
    python3 scripts/sadtalker_intro.py [--size 256] [--enhancer none]

CPU-only render is slow (minutes per clip). Heavy but real.
"""
import argparse
import functools
import json
import os
import runpy
import shutil
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INTRO = os.path.join(ROOT, "public", "intro")
SAD = os.path.join(ROOT, "tools", "SadTalker")
IMG = os.path.join(INTRO, "presenter.jpg")


def ensure_ffmpeg_on_path():
    import imageio_ffmpeg
    binp = imageio_ffmpeg.get_ffmpeg_exe()
    bindir = os.path.join(ROOT, "tools", "bin")
    os.makedirs(bindir, exist_ok=True)
    link = os.path.join(bindir, "ffmpeg")
    if not os.path.exists(link):
        os.symlink(binp, link)
    os.environ["PATH"] = bindir + os.pathsep + os.environ.get("PATH", "")


def _replace_in_file(path, replacements):
    if not os.path.exists(path):
        return
    with open(path) as f:
        src = f.read()
    out = src
    for old, new in replacements:
        if old in out:
            out = out.replace(old, new)
    if out != src:
        with open(path, "w") as f:
            f.write(out)
        print(f"  patched {os.path.relpath(path, ROOT)}")


def patch_sadtalker_source():
    """Idempotent source patches for numpy>=2 / torchvision>=0.17 compatibility.
    Safe to run on a fresh SadTalker clone."""
    # basicsr (installed): functional_tensor was removed from torchvision
    try:
        import basicsr, importlib  # noqa: F401
        deg = os.path.join(os.path.dirname(basicsr.__file__), "data", "degradations.py")
        _replace_in_file(deg, [(
            "from torchvision.transforms.functional_tensor import rgb_to_grayscale",
            "from torchvision.transforms.functional import rgb_to_grayscale",
        )])
    except Exception:
        pass

    # numpy>=2: float(array) and inhomogeneous arrays now raise
    fp = os.path.join(SAD, "src", "face3d", "util", "preprocess.py")
    _replace_in_file(fp, [
        (
            "    w = (w0*s).astype(np.int32)\n"
            "    h = (h0*s).astype(np.int32)\n"
            "    left = (w/2 - target_size/2 + float((t[0] - w0/2)*s)).astype(np.int32)\n"
            "    right = left + target_size\n"
            "    up = (h/2 - target_size/2 + float((h0/2 - t[1])*s)).astype(np.int32)\n"
            "    below = up + target_size",
            "    s = float(np.asarray(s).reshape(-1)[0])\n"
            "    t0 = float(np.asarray(t[0]).reshape(-1)[0])\n"
            "    t1 = float(np.asarray(t[1]).reshape(-1)[0])\n"
            "    w = int(w0*s)\n"
            "    h = int(h0*s)\n"
            "    left = int(w/2 - target_size/2 + (t0 - w0/2)*s)\n"
            "    right = int(left + target_size)\n"
            "    up = int(h/2 - target_size/2 + (h0/2 - t1)*s)\n"
            "    below = int(up + target_size)",
        ),
        (
            "    trans_params = np.array([w0, h0, s, t[0], t[1]])",
            "    trans_params = np.array([w0, h0,\n"
            "                             float(np.asarray(s).reshape(-1)[0]),\n"
            "                             float(np.asarray(t[0]).reshape(-1)[0]),\n"
            "                             float(np.asarray(t[1]).reshape(-1)[0])])",
        ),
    ])
    up = os.path.join(SAD, "src", "utils", "preprocess.py")
    _replace_in_file(up, [(
        "trans_params = np.array([float(item) for item in np.hsplit(trans_params, 5)]).astype(np.float32)",
        "trans_params = np.asarray(trans_params).reshape(-1).astype(np.float32)",
    )])


def patch_numpy():
    """Restore numpy<2 aliases SadTalker relies on (np.float, np.int, etc.)."""
    import numpy as np
    for name, typ in [("float", float), ("int", int), ("bool", bool),
                      ("object", object), ("str", str), ("complex", complex)]:
        if not hasattr(np, name):
            setattr(np, name, typ)
    if not hasattr(np, "VisibleDeprecationWarning"):
        np.VisibleDeprecationWarning = np.exceptions.VisibleDeprecationWarning


def patch_torch_load():
    import torch
    if getattr(torch.load, "_patched", False):
        return
    orig = torch.load

    @functools.wraps(orig)
    def loader(*a, **k):
        k.setdefault("weights_only", False)
        return orig(*a, **k)

    loader._patched = True
    torch.load = loader


def render(audio_path, out_mp4, size, enhancer):
    tmp = os.path.join(SAD, "_out")
    if os.path.isdir(tmp):
        shutil.rmtree(tmp)
    import torch
    argv = [
        "inference.py",
        "--driven_audio", audio_path,
        "--source_image", IMG,
        "--result_dir", tmp,
        "--preprocess", "full",
        "--still",
        "--size", str(size),
        "--expression_scale", "1.2",
    ]
    if not torch.cuda.is_available():
        argv.append("--cpu")  # GPU (Colab) renders ~100x faster; omit there
    if enhancer and enhancer != "none":
        argv += ["--enhancer", enhancer]
    sys.argv = argv
    cwd = os.getcwd()
    os.chdir(SAD)
    if SAD not in sys.path:
        sys.path.insert(0, SAD)
    try:
        runpy.run_path(os.path.join(SAD, "inference.py"), run_name="__main__")
    finally:
        os.chdir(cwd)
    # SadTalker writes a single .mp4 under result_dir (timestamped)
    found = None
    for dirpath, _, files in os.walk(tmp):
        for f in files:
            if f.endswith(".mp4") and "enhanced" not in f or f.endswith("enhanced.mp4"):
                found = os.path.join(dirpath, f)
    mp4s = [os.path.join(dp, f) for dp, _, fs in os.walk(tmp) for f in fs if f.endswith(".mp4")]
    if not mp4s:
        raise RuntimeError(f"no mp4 produced in {tmp}")
    found = sorted(mp4s, key=os.path.getmtime)[-1]
    shutil.copyfile(found, out_mp4)
    shutil.rmtree(tmp, ignore_errors=True)
    print(f"  -> {os.path.relpath(out_mp4, ROOT)} ({os.path.getsize(out_mp4)//1024} KB)")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--size", type=int, default=256)
    ap.add_argument("--enhancer", default="none")
    ap.add_argument("--only", default=None, help="render a single id (e.g. about) for smoke test")
    args = ap.parse_args()

    ensure_ffmpeg_on_path()
    patch_sadtalker_source()
    patch_numpy()
    patch_torch_load()

    manifest = json.load(open(os.path.join(INTRO, "timeline.json")))
    jobs = []
    for key, g in manifest["greetings"].items():
        jobs.append((f"greet-{key}", g))
    for seg in manifest["segments"]:
        jobs.append((f"seg-{seg['id']}", seg))

    for name, entry in jobs:
        if args.only and args.only not in name:
            continue
        mp3 = os.path.join(INTRO, entry["file"])
        out = os.path.join(INTRO, f"{name}.mp4")
        print(f"[{name}] {entry['file']} -> {name}.mp4")
        render(mp3, out, args.size, args.enhancer)
        entry["video"] = f"{name}.mp4"

    if not args.only:
        json.dump(manifest, open(os.path.join(INTRO, "timeline.json"), "w"), indent=2)
        print("patched timeline.json with video fields")


if __name__ == "__main__":
    main()
