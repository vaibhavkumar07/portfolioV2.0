"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Short enough to synthesize fast and to read as an opener, not a monologue. */
export const GREETING =
  "Hey — I'm Vaibhav. I build the voice behind enterprise phone calls. Ask me anything about my work.";

const WORDS = GREETING.split(" ");
const SESSION_KEY = "hero-greeted";

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
}: {
  /** Receives the greeting's AnalyserNode so the portrait reacts to it. */
  analyserRef: React.RefObject<AnalyserNode | null>;
  /** True once the full agent takes over — the greeting must not talk over it. */
  suppressed: boolean;
  /** Lets the hero yield the bottom bar's slot while the caption occupies it. */
  onCaptionVisible?: (visible: boolean) => void;
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
          body: JSON.stringify({ text: GREETING }),
        });
        if (!res.ok) throw new Error("tts");
        const buf = await res.arrayBuffer();
        if (!alive) return;
        const url = URL.createObjectURL(new Blob([buf], { type: "audio/mpeg" }));
        urlRef.current = url;
        if (audioRef.current) audioRef.current.src = url;
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
      // Edge TTS gives no phoneme timings (only word/sentence boundaries, which
      // this route does not request), so words are paced evenly across the
      // clip. Close enough to read as synced; nothing here claims to be exact.
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

      {/* Sits in the bottom bar's slot rather than above it — stacked over the
          portrait it covered his mouth, which is the one thing worth watching. */}
      <div ref={captionRef} className="pointer-events-none absolute inset-x-4 bottom-4 z-10">
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
