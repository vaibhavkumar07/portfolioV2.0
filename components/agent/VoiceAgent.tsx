"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { GREETING, SUGGESTED } from "@/lib/data/kb";

type Msg = { role: "user" | "assistant"; content: string };

// Minimal typings for the Web Speech API (not in lib.dom for all targets).
type SpeechRec = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  start: () => void;
  stop: () => void;
};

export default function VoiceAgent({
  variant = "panel",
}: {
  /** "takeover" hides the photo/waveform row (modal chat). */
  variant?: "panel" | "takeover";
} = {}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [sttSupported, setSttSupported] = useState(false);
  const [note, setNote] = useState("");

  const recRef = useRef<SpeechRec | null>(null);
  const recCtorRef = useRef<(new () => SpeechRec) | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRec;
      webkitSpeechRecognition?: new () => SpeechRec;
    };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (Ctor) {
      recCtorRef.current = Ctor;
      // Browser capability detection must run post-hydration (SSR renders
      // without the mic button), so a one-shot setState here is intentional.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSttSupported(true);
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  // ── Neural voice via /api/tts (free Edge neural). Fetch sentences in
  //    parallel, play them in order so it sounds natural and starts early. ──
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioQ = useRef<Promise<string | null>[]>([]);
  const workingRef = useRef(false);

  const fetchTTS = useCallback(async (text: string): Promise<string | null> => {
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) return null;
      const buf = await res.arrayBuffer();
      return URL.createObjectURL(new Blob([buf], { type: "audio/mpeg" }));
    } catch {
      return null;
    }
  }, []);

  const pump = useCallback(async () => {
    if (workingRef.current) return;
    workingRef.current = true;
    setSpeaking(true);
    const a = audioRef.current;
    while (audioQ.current.length) {
      const url = await audioQ.current.shift();
      if (!url || !a) continue;
      await new Promise<void>((resolve) => {
        a.src = url;
        a.onended = () => { URL.revokeObjectURL(url); resolve(); };
        a.onerror = () => resolve();
        a.play().catch(() => resolve());
      });
    }
    workingRef.current = false;
    setSpeaking(false);
  }, []);

  const speakChunk = useCallback(
    (text: string) => {
      if (!voiceOn || !text) return;
      audioQ.current.push(fetchTTS(text));
      pump();
    },
    [voiceOn, fetchTTS, pump],
  );

  const stopAudio = useCallback(() => {
    audioQ.current = [];
    const a = audioRef.current;
    if (a) { a.pause(); a.removeAttribute("src"); }
    workingRef.current = false;
    setSpeaking(false);
  }, []);

  const send = useCallback(
    async (text: string) => {
      const q = text.trim();
      if (!q || busy) return;
      setInput("");
      const next: Msg[] = [...messagesRef.current, { role: "user", content: q }];
      setMessages(next);
      setBusy(true);
      const FALLBACK = "I couldn't reach my brain just now — but I'd love to talk. Email me at yadavvaibhavkumar7@gmail.com.";
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: next }),
        });
        if (!res.ok || !res.body) {
          const msg =
            res.status === 429
              ? "I'm getting a lot of questions right now — give me a few seconds and ask again."
              : FALLBACK;
          setMessages([...next, { role: "assistant", content: msg }]);
          return;
        }
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let acc = "";
        let spoken = 0;
        stopAudio();
        setMessages([...next, { role: "assistant", content: "" }]);
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += dec.decode(value, { stream: true });
          setMessages([...next, { role: "assistant", content: acc }]);
          // Speak complete sentences as they arrive (voice starts early).
          let m;
           
          while ((m = /[.!?]\s/.exec(acc.slice(spoken)))) {
            const end = spoken + m.index + 1;
            speakChunk(acc.slice(spoken, end).trim());
            spoken = end;
          }
        }
        const tail = acc.slice(spoken).trim();
        if (tail) speakChunk(tail);
        // Empty/blank stream → still give the visitor a useful reply.
        if (!acc.trim()) setMessages([...next, { role: "assistant", content: FALLBACK }]);
      } catch {
        setMessages([...next, { role: "assistant", content: FALLBACK }]);
      } finally {
        setBusy(false);
      }
    },
    [busy, speakChunk, stopAudio],
  );

  // keep a ref of messages so send() always appends to latest
  const messagesRef = useRef<Msg[]>([]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // latest send() for the STT callback (set up once on mount)
  const sendRef = useRef(send);
  useEffect(() => {
    sendRef.current = send;
  }, [send]);

  // Suggested questions not asked yet — resurfaced as follow-up chips.
  const askedSet = new Set(messages.filter((m) => m.role === "user").map((m) => m.content));
  const remaining = SUGGESTED.filter((s) => !askedSet.has(s));

  const ensureRec = (): SpeechRec | null => {
    if (recRef.current) return recRef.current;
    const Ctor = recCtorRef.current;
    if (!Ctor) return null;
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    rec.onstart = () => { setListening(true); setNote(""); };
    rec.onresult = (e) => {
      let interim = "";
      let final = "";
      for (let i = 0; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) final += r[0].transcript;
        else interim += r[0].transcript;
      }
      if (interim) setInput(interim);
      if (final) { setInput(""); setNote(""); sendRef.current(final); }
    };
    rec.onend = () => setListening(false);
    rec.onerror = (e) => {
      setListening(false);
      const code = e?.error || "unknown";
      if (code === "aborted") return;
      if (code === "no-speech") setNote("Didn't hear anything — tap the mic and speak right away.");
      else if (code === "not-allowed" || code === "service-not-allowed")
        setNote("Mic blocked for this site — click the camera/lock icon in the address bar → allow microphone, then retry.");
      else if (code === "network")
        setNote("Speech service unreachable. Chrome routes voice to Google — check your network/VPN, or just type.");
      else if (code === "audio-capture")
        setNote("No microphone found — check your input device, or just type.");
      else setNote(`Voice input error (${code}) — you can type instead.`);
    };
    recRef.current = rec;
    return rec;
  };

  const toggleMic = () => {
    const rec = ensureRec();
    if (!rec) return;
    if (listening) {
      rec.stop();
      setListening(false);
    } else {
      stopAudio();
      setSpeaking(false);
      try {
        rec.start();
        setListening(true);
      } catch {
        setListening(false);
      }
    }
  };

  return (
    <div className="glass relative flex h-full flex-col overflow-hidden rounded-3xl">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${speaking ? "bg-[var(--amber)]" : "bg-[var(--live)]"}`}
            style={{ boxShadow: "0 0 8px currentColor" }}
          />
          <span className="label-xs text-muted-foreground">
            {speaking ? "Agent speaking" : busy ? "Thinking…" : "Line open"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {speaking && (
            <button
              onClick={stopAudio}
              aria-label="Stop the agent's voice"
              className="focus-ring label-xs min-h-8 rounded-lg border border-[var(--amber)]/40 px-2.5 text-[var(--amber)] transition hover:bg-[var(--amber)]/10"
            >
              ■ Stop
            </button>
          )}
          <button
            onClick={() => {
              setVoiceOn((v) => !v);
              stopAudio();
              setSpeaking(false);
            }}
            aria-pressed={voiceOn}
            aria-label={voiceOn ? "Turn voice replies off" : "Turn voice replies on"}
            className="focus-ring label-xs min-h-8 rounded-lg px-2 text-muted-foreground hover:text-foreground"
          >
            Voice {voiceOn ? "on" : "off"}
          </button>
        </div>
      </div>

      {/* Avatar + waveform (panel layout only) */}
      {variant === "panel" && (
        <div className="relative flex items-center gap-4 border-b border-border px-4 py-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-border">
            <Image src="/profile1.jpeg" alt="Vaibhavkumar Yadav" fill className="object-cover object-[50%_18%]" sizes="64px" />
            <span
              className={`absolute inset-0 transition-opacity ${speaking ? "opacity-100" : "opacity-0"}`}
              style={{ boxShadow: "inset 0 0 0 2px var(--amber)" }}
            />
          </div>
          <div aria-hidden="true" className="min-w-0 flex-1">
            <Waveform active={speaking || listening} />
          </div>
        </div>
      )}

      {/* Transcript */}
      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed text-foreground/90">{GREETING}</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Tap the mic and talk, or type below.
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="focus-ring mono min-h-9 rounded-full border border-border px-3 py-1.5 text-[0.72rem] text-foreground/80 transition hover:border-[var(--cyan)] hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: reduce ? 0.15 : 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={m.role === "user" ? "text-right" : ""}
          >
            <span className="mono mb-1 block text-[0.6rem] tracking-[0.18em] text-muted-foreground">
              {m.role === "user" ? "YOU" : "VAIBHAV"}
            </span>
            <p
              className={`inline-block max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-[var(--cyan)]/12 text-foreground"
                  : "bg-secondary/60 text-foreground"
              }`}
            >
              {m.content || (busy ? <span className="inline-flex gap-1 align-middle">{[0, 1, 2].map((d) => (<span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-current opacity-60" style={{ animationDelay: `${d * 0.15}s` }} />))}</span> : "")}
            </p>
          </motion.div>
        ))}

        {/* Follow-up suggestions once the conversation is going */}
        {messages.length > 0 && !busy && remaining.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="flex flex-wrap gap-1.5 pt-1"
          >
            {remaining.slice(0, 2).map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="focus-ring mono rounded-full border border-border/70 px-2.5 py-1 text-[0.64rem] text-muted-foreground transition hover:border-[var(--cyan)] hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {note && (
        <p className="mono border-t border-border px-4 py-1.5 text-[0.66rem] leading-snug text-[var(--amber)]">{note}</p>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="focus-within:border-[var(--cyan)]/45 m-3 flex items-center gap-2 rounded-2xl border border-border bg-background/40 p-1.5 transition-colors"
      >
        {sttSupported && (
          <button
            type="button"
            onClick={toggleMic}
            aria-label={listening ? "Stop listening" : "Talk"}
            className={`focus-ring relative grid h-11 w-11 shrink-0 place-items-center rounded-xl border transition ${
              listening
                ? "border-[var(--amber)] glow-amber text-[var(--amber)]"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {listening && (
              <span
                aria-hidden="true"
                className="absolute inset-0 animate-ping rounded-xl border border-[var(--amber)]/60 motion-reduce:hidden"
              />
            )}
            <MicIcon />
          </button>
        )}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={listening ? "Listening…" : "Ask about my work…"}
          aria-label="Ask the portfolio agent"
          className="focus-ring min-w-0 flex-1 rounded-xl bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="focus-ring label-xs min-h-11 shrink-0 rounded-xl bg-[var(--cyan)] px-4 font-medium text-[var(--primary-foreground)] transition enabled:hover:brightness-110 disabled:opacity-35"
        >
          SEND
        </button>
      </form>

      <audio ref={audioRef} hidden />
    </div>
  );
}

function Waveform({ active }: { active: boolean }) {
  const bars = 28;
  return (
    <div className="flex h-10 flex-1 items-center gap-[3px]">
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className="wf-bar w-full rounded-full bg-[var(--cyan)]/70"
          style={{
            height: active ? undefined : "3px",
            animation: active
              ? `wf 0.9s ease-in-out ${(i % 7) * 0.08}s infinite`
              : "none",
          }}
        />
      ))}
      <style>{`@keyframes wf{0%,100%{height:4px;opacity:.5}50%{height:34px;opacity:1}}
@media (prefers-reduced-motion: reduce){.wf-bar{animation:none !important;height:6px !important}}`}</style>
    </div>
  );
}

function MicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  );
}
