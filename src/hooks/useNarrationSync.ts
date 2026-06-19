import { useCallback, useEffect, useRef, useState } from 'react';

/** One step in the narration queue (greeting or a body segment). */
export interface IntroItem {
  id: string;
  section: string;     // DOM id revealed while this step plays
  text: string;        // caption
  file?: string;       // voice mp3 under public/intro/ (edge-tts or MiniMax)
  video?: string;      // talking-avatar mp4 under public/intro/ (Hedra/Hailuo)
}

interface Manifest {
  voice: string;
  greetings: Record<'morning' | 'afternoon' | 'evening', Omit<IntroItem, 'id'>>;
  segments: IntroItem[];
}

const BASE = import.meta.env.BASE_URL;
const CAPTION_FALLBACK_MS = 6000; // per-step time when no media can play

function partOfDay(h: number): 'morning' | 'afternoon' | 'evening' {
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Drives the narrated intro: loads the manifest, builds a time-of-day queue,
 * plays each clip sequentially, and reveals the matching section on each step.
 * A step plays a talking-avatar `video` if present, else a voice `file` (mp3)
 * alongside the coded avatar. Media `ended` advances the queue — exact section
 * sync, no timestamp math. Falls back to timed captions if nothing can play.
 */
export function useNarrationSync(onFinish: () => void) {
  const mediaRef = useRef<HTMLMediaElement>(null);
  const [queue, setQueue] = useState<IntroItem[]>([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [clipFraction, setClipFraction] = useState(0);
  const [captionOnly, setCaptionOnly] = useState(false);

  const finishedRef = useRef(false);
  const fallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinish();
  }, [onFinish]);

  // Build the queue from the manifest (with embedded fallback).
  useEffect(() => {
    let cancelled = false;
    fetch(`${BASE}intro/timeline.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('no manifest'))))
      .then((m: Manifest) => {
        if (cancelled) return;
        const g = m.greetings[partOfDay(new Date().getHours())];
        setQueue([{ id: 'greeting', ...g }, ...m.segments]);
      })
      .catch(() => {
        if (cancelled) return;
        // Caption-only fallback if the manifest is missing.
        setCaptionOnly(true);
        setQueue([
          { id: 'greeting', section: 'hero', text: 'Welcome — let me walk you through my work.' },
          { id: 'about', section: 'about', text: 'About me.' },
          { id: 'work', section: 'work', text: 'Selected projects.' },
          { id: 'skills', section: 'skills', text: 'Capabilities.' },
          { id: 'contact', section: 'contact', text: "Let's connect." },
        ]);
      });
    return () => { cancelled = true; };
  }, []);

  const advance = useCallback(() => setIndex((i) => i + 1), []);

  const srcFor = (it?: IntroItem) => it?.video ?? it?.file;

  // Guard against an `ended` that fires with no real playback (e.g. a browser
  // that can't decode the media): drop to timed captions instead of skipping.
  const handleEnded = useCallback(() => {
    const el = mediaRef.current;
    if (!captionOnly && el && el.currentTime < 0.25) { setCaptionOnly(true); return; }
    advance();
  }, [captionOnly, advance]);

  const handleError = useCallback(() => setCaptionOnly(true), []);

  // Drive each step: reveal its section, then play media (or run a timed
  // fallback). Side effects live here, not in the setIndex updater, so React
  // StrictMode's double-invoked updaters can't skip or double-fire them.
  useEffect(() => {
    if (queue.length === 0) return;
    if (index >= queue.length) { finish(); return; }
    const item = queue[index];
    const src = srcFor(item);
    setClipFraction(0);
    scrollToSection(item.section);

    if (captionOnly || !src) {
      if (!playing) return;
      fallbackTimer.current = setTimeout(advance, CAPTION_FALLBACK_MS);
      return () => { if (fallbackTimer.current) clearTimeout(fallbackTimer.current); };
    }

    const el = mediaRef.current;
    if (!el) return;
    el.src = `${BASE}intro/${src}`;
    el.muted = muted;
    el.play().then(() => setPlaying(true)).catch(() => {
      // Autoplay blocked → retry muted; if that fails, drop to caption timing.
      el.muted = true;
      setMuted(true);
      el.play().catch(() => setCaptionOnly(true));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue, index, captionOnly]);

  // Controls
  const togglePlay = useCallback(() => {
    const el = mediaRef.current;
    setPlaying((p) => {
      const next = !p;
      if (captionOnly || !srcFor(queue[index])) {
        if (!next && fallbackTimer.current) clearTimeout(fallbackTimer.current);
        else if (next) fallbackTimer.current = setTimeout(advance, CAPTION_FALLBACK_MS);
      } else if (el) {
        if (next) el.play().catch(() => {}); else el.pause();
      }
      return next;
    });
  }, [captionOnly, queue, index, advance]);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      if (mediaRef.current) mediaRef.current.muted = !m;
      return !m;
    });
  }, []);

  const replay = useCallback(() => {
    setClipFraction(0);
    setIndex(0);
    scrollToSection(queue[0]?.section ?? 'hero');
    setPlaying(true);
  }, [queue]);

  const onTimeUpdate = useCallback(() => {
    const el = mediaRef.current;
    if (el && el.duration) setClipFraction(el.currentTime / el.duration);
  }, []);

  const item = queue[index];
  const progress = queue.length ? (index + clipFraction) / queue.length : 0;

  return {
    mediaRef,
    item,
    index,
    total: queue.length,
    playing,
    muted,
    captionOnly,
    hasVideo: !!item?.video,
    progress,
    onEnded: handleEnded,
    onError: handleError,
    onTimeUpdate,
    controls: { togglePlay, toggleMute, replay, skip: finish },
  };
}
