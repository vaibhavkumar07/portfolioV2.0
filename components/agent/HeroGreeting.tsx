"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GREETING } from "@/lib/data/kb";

const WORDS = GREETING.split(" ");
const SESSION_KEY = "hero-greeted";

type Mark = { t: number; word: string };

const bare = (s: string) => s.toLowerCase().replace(/[^a-z0-9']/g, "");

/**
 * Map the synthesizer's word boundaries onto the words actually on screen.
 *
 * They are not the same list: the server speaks `pronounce(text)`, so "IVR"
 * becomes three spoken tokens, and punctuation like the em-dash is displayed
 * but never spoken. So walk both sequences and pair them up by content,
 * letting unmatched display words inherit the previous timestamp.
 *
 * Returns one start-time per displayed word, or null if the two sequences are
 * too far apart to trust — in which case the caller paces evenly instead.
 */
function alignMarks(words: string[], marks: Mark[]): number[] | null {
  if (!marks.length) return null;

  const times = new Array<number>(words.length).fill(0);
  let mi = 0;
  let matched = 0;

  for (let wi = 0; wi < words.length; wi++) {
    const w = bare(words[wi]);
    times[wi] = wi > 0 ? times[wi - 1] : 0;
    if (!w) continue;

    // A displayed word may correspond to several spoken tokens ("IVR" →
    // "I" "V" "R"); take the first, then consume the rest that it covers.
    let consumed = "";
    const start = mi;
    while (mi < marks.length && consumed.length < w.length) {
      consumed += bare(marks[mi].word);
      mi++;
      if (w.startsWith(consumed) || consumed.startsWith(w)) continue;
      break;
    }

    if (consumed && (w.startsWith(consumed) || consumed.startsWith(w))) {
      times[wi] = marks[start].t;
      matched++;
    } else {
      mi = start; // no match — leave this word on the previous timestamp
    }
  }

  // Below half matched the alignment is guesswork; even pacing looks better
  // than confidently highlighting the wrong word.
  return matched >= Math.max(2, Math.floor(words.length * 0.5)) ? times : null;
}

type Phase = "loading" | "armed" | "playing" | "done";

/**
 * The arrival moment: the agent introduces itself out loud instead of waiting
 * to be found two clicks deep.
 *
 * Autoplay policy is the whole design constraint here. Browsers only allow
 * audio after a user gesture, and `play()` has to be called *synchronously*
 * inside that gesture's handler — an `await` before it loses the activation.
 * So the audio is fetched on mount and parked on the element, and the first
 * click/keypress anywhere just presses play.
 *
 * Fires once per tab (sessionStorage), never when the visitor is already on
 * their way into the full agent, and can be stopped mid-sentence.
 */
export default function HeroGreeting({
  analyserRef,
  suppressed,
  onCaptionVisible,
  className = "absolute inset-x-4 bottom-4 z-10",
}: {
  /** Receives the greeting's AnalyserNode so the portrait reacts to it. */
  analyserRef: React.RefObject<AnalyserNode | null>;
  /** True once the full agent takes over — the greeting must not talk over it. */
  suppressed: boolean;
  /** Lets a host yield its own slot while the caption occupies it. */
  onCaptionVisible?: (visible: boolean) => void;
  /** Placement of the caption; the host owns where it sits. */
  className?: string;
}) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [spoken, setSpoken] = useState(0);
  /* On mobile the stage starts below the fold. A voice with no visible speaker
     is worse than no voice, so the greeting waits until he is on screen. */
  const [inView, setInView] = useState(false);
  const captionRef = useRef<HTMLDivElement>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const urlRef = useRef<string | null>(null);
  const phaseRef = useRef<Phase>("loading");
  /** Per-word start times from the synthesizer; null = fall back to pacing. */
  const timesRef = useRef<number[] | null>(null);

  useEffect(() => {
    phaseRef.current = phase;
    onCaptionVisible?.(phase !== "done" && !suppressed);
  }, [phase, suppressed, onCaptionVisible]);

  const finish = useCallback(() => {
    const a = audioRef.current;
    if (a) {
      a.pause();
      a.removeAttribute("src");
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    void ctxRef.current?.close().catch(() => {});
    analyserRef.current = null;
    setPhase("done");
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* private mode — greeting simply repeats next load */
    }
  }, [analyserRef]);

  // ── Prefetch the audio so the gesture handler can play synchronously ──
  useEffect(() => {
    let alive = true;

    (async () => {
      // Read inside the async body, not the effect body: sessionStorage is
      // client-only, so this cannot be a lazy useState initializer without a
      // hydration mismatch, and a synchronous setState here would cascade.
      let greeted = false;
      try {
        greeted = !!sessionStorage.getItem(SESSION_KEY);
      } catch {
        /* private mode — treat as not yet greeted */
      }
      if (greeted) {
        if (alive) setPhase("done");
        return;
      }

      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // Ask for word boundaries so the caption can highlight the word being
          // spoken rather than an even-paced approximation of it.
          body: JSON.stringify({ text: GREETING, marks: true }),
        });
        if (!res.ok) throw new Error("tts");
        const { audio, marks } = (await res.json()) as { audio: string; marks: Mark[] };
        if (!alive) return;

        const bytes = Uint8Array.from(atob(audio), (c) => c.charCodeAt(0));
        const url = URL.createObjectURL(new Blob([bytes], { type: "audio/mpeg" }));
        urlRef.current = url;
        if (audioRef.current) audioRef.current.src = url;
        timesRef.current = alignMarks(WORDS, marks ?? []);
        setPhase("armed");
      } catch {
        // No voice available — the caption alone still introduces him.
        if (alive) setPhase("armed");
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // The caption is pinned inside the stage, so its visibility is the stage's.
  useEffect(() => {
    const el = captionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [phase]);

  // ── First gesture anywhere → speak ──
  useEffect(() => {
    if (phase !== "armed" || suppressed || !inView) return;

    const onGesture = (e: Event) => {
      // Clicking into the real agent means they want the conversation, not the
      // canned intro. Stand down rather than talk over it.
      const target = e.target as HTMLElement | null;
      if (target?.closest?.("[data-agent-entry]")) {
        finish();
        return;
      }

      const a = audioRef.current;
      if (!a || !a.src) {
        finish();
        return;
      }

      // Everything below must stay synchronous to keep the user activation.
      try {
        const ctx = new AudioContext();
        const an = ctx.createAnalyser();
        an.fftSize = 256;
        an.smoothingTimeConstant = 0.6;
        ctx.createMediaElementSource(a).connect(an);
        an.connect(ctx.destination);
        analyserRef.current = an;
        ctxRef.current = ctx;
        void ctx.resume().catch(() => {});
      } catch {
        /* the glow is an enhancement — audio still plays without it */
      }

      a.play().then(
        () => setPhase("playing"),
        () => finish(),
      );
    };

    window.addEventListener("pointerdown", onGesture, { once: true });
    window.addEventListener("keydown", onGesture, { once: true });
    return () => {
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
    };
  }, [phase, suppressed, inView, finish, analyserRef]);

  // The full agent opened mid-sentence — stop immediately.
  useEffect(() => {
    if (suppressed && phaseRef.current !== "done") finish();
  }, [suppressed, finish]);

  // ── Caption tracks playback position ──
  useEffect(() => {
    if (phase !== "playing") return;
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const a = audioRef.current;
      if (!a?.duration || !isFinite(a.duration)) return;

      const times = timesRef.current;
      if (times) {
        // Exact: highlight every word whose spoken onset has passed.
        let n = 0;
        while (n < times.length && times[n] <= a.currentTime) n++;
        setSpoken(n);
        return;
      }

      // Fallback when the boundaries were missing or could not be aligned:
      // pace evenly across the clip. Approximate, and visibly so on long text.
      setSpoken(Math.min(WORDS.length, Math.ceil((a.currentTime / a.duration) * WORDS.length)));
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  useEffect(() => () => finish(), [finish]);

  if (phase === "done" || suppressed) return <audio ref={audioRef} hidden />;

  return (
    <>
      <audio ref={audioRef} hidden onEnded={finish} onError={finish} />

      {/* Never stacked over the portrait's centre — covering his mouth defeats
          the point of watching him speak. */}
      <div ref={captionRef} className={`pointer-events-none ${className}`}>
        <div className="glass-strong rounded-2xl px-4 py-3">
          <div className="label-xs mb-2 flex items-center gap-2 text-[var(--cyan)]">
            <span
              className={`h-1.5 w-1.5 rounded-full bg-[var(--live)] ${
                phase === "playing" ? "animate-pulse motion-reduce:animate-none" : ""
              }`}
            />
            {phase === "playing" ? "Speaking" : "Click anywhere to hear me"}
          </div>
          <p className="text-left text-sm leading-relaxed">
            {WORDS.map((w, i) => (
              <span
                key={i}
                className={
                  phase === "playing" && i < spoken
                    ? "text-foreground transition-colors duration-200"
                    : "text-muted-foreground transition-colors duration-200"
                }
              >
                {w}{" "}
              </span>
            ))}
          </p>
        </div>
      </div>

      {phase === "playing" && (
        <button
          type="button"
          onClick={finish}
          aria-label="Stop the greeting"
          className="focus-ring glass-strong label-xs absolute right-3 top-3 z-20 min-h-9 rounded-xl px-3 text-[var(--amber)] transition hover:brightness-125 sm:right-4 sm:top-4"
        >
          ■ Stop
        </button>
      )}
    </>
  );
}
