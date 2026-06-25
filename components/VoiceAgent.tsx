"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { SUGGESTED } from "@/lib/kb";

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

export default function VoiceAgent() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [sttSupported, setSttSupported] = useState(false);
  const [note, setNote] = useState("");

  const recRef = useRef<SpeechRec | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRec;
      webkitSpeechRecognition?: new () => SpeechRec;
    };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (Ctor) {
      setSttSupported(true);
      const rec = new Ctor();
      rec.lang = "en-US";
      rec.interimResults = true; // live words as you speak (less "no-speech")
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
        if (final) { setInput(""); setNote(""); send(final); }
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: next }),
        });
        if (!res.ok || !res.body) throw new Error(await res.text());
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
          // eslint-disable-next-line no-cond-assign
          while ((m = /[.!?]\s/.exec(acc.slice(spoken)))) {
            const end = spoken + m.index + 1;
            speakChunk(acc.slice(spoken, end).trim());
            spoken = end;
          }
        }
        const tail = acc.slice(spoken).trim();
        if (tail) speakChunk(tail);
      } catch {
        setMessages([
          ...next,
          { role: "assistant", content: "Connection hiccup — reach me at yadavvaibhavkumar7@gmail.com." },
        ]);
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

  const toggleMic = () => {
    const rec = recRef.current;
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
    <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card/60 backdrop-blur-sm">
      {/* Console header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${speaking ? "bg-[var(--brand-orange)]" : "bg-[var(--brand-green)]"}`}
            style={{ boxShadow: "0 0 8px currentColor" }}
          />
          <span className="mono text-[0.68rem] tracking-[0.18em] text-muted-foreground">
            {speaking ? "AGENT SPEAKING" : busy ? "THINKING…" : "LINE OPEN"}
          </span>
        </div>
        <button
          onClick={() => {
            setVoiceOn((v) => !v);
            stopAudio();
            setSpeaking(false);
          }}
          className="mono text-[0.68rem] tracking-[0.14em] text-muted-foreground hover:text-foreground"
        >
          VOICE {voiceOn ? "ON" : "OFF"}
        </button>
      </div>

      {/* Avatar + waveform */}
      <div className="relative flex items-center gap-4 border-b border-border px-4 py-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border">
          <Image src="/profile.jpeg" alt="Vaibhavkumar Yadav" fill className="object-cover" sizes="64px" />
          <span
            className={`absolute inset-0 transition-opacity ${speaking ? "opacity-100" : "opacity-0"}`}
            style={{ boxShadow: "inset 0 0 0 2px var(--brand-orange)" }}
          />
        </div>
        <Waveform active={speaking || listening} />
      </div>

      {/* Transcript */}
      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Ask me anything about my work — IVR, voice AI, projects, or whether I&apos;m
              open to hire. Tap the mic and talk, or type below.
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="mono rounded-full border border-border px-3 py-1.5 text-[0.72rem] text-foreground/80 transition hover:border-[var(--brand-sky)] hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : ""}>
            <span className="mono mb-1 block text-[0.6rem] tracking-[0.18em] text-muted-foreground">
              {m.role === "user" ? "YOU" : "VAIBHAV"}
            </span>
            <p
              className={`inline-block max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-[var(--brand-sky)]/12 text-foreground"
                  : "bg-secondary/60 text-foreground"
              }`}
            >
              {m.content || (busy ? <span className="inline-flex gap-1 align-middle">{[0, 1, 2].map((d) => (<span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-current opacity-60" style={{ animationDelay: `${d * 0.15}s` }} />))}</span> : "")}
            </p>
          </div>
        ))}
      </div>

      {note && (
        <p className="mono border-t border-border px-4 py-1.5 text-[0.66rem] leading-snug text-[var(--brand-orange)]">{note}</p>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-border p-3"
      >
        {sttSupported && (
          <button
            type="button"
            onClick={toggleMic}
            aria-label={listening ? "Stop listening" : "Talk"}
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg border transition ${
              listening
                ? "border-[var(--brand-orange)] glow-orange text-[var(--brand-orange)]"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <MicIcon />
          </button>
        )}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={listening ? "Listening…" : "Ask about my work…"}
          className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="mono shrink-0 rounded-lg border border-[var(--brand-sky)]/40 bg-[var(--brand-sky)]/10 px-3 py-2 text-[0.72rem] tracking-[0.12em] text-[var(--brand-sky)] transition enabled:hover:bg-[var(--brand-sky)]/20 disabled:opacity-40"
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
          className="w-full rounded-full bg-[var(--brand-sky)]/70"
          style={{
            height: active ? undefined : "3px",
            animation: active
              ? `wf 0.9s ease-in-out ${(i % 7) * 0.08}s infinite`
              : "none",
          }}
        />
      ))}
      <style>{`@keyframes wf{0%,100%{height:4px;opacity:.5}50%{height:34px;opacity:1}}`}</style>
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
