import { useState, useEffect, useRef, useCallback } from 'react';
import type { CallState } from '../types';

export function formatElapsed(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

export function useCallStateMachine() {
  const [state, setState] = useState<CallState>('ringing');
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Accept the call → play the narrated intro first (timer starts after intro).
  const accept = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setState('intro');
    setElapsed(0);
  }, []);

  // Intro finished (or skipped) → reveal the live portfolio and start the timer.
  const finishIntro = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setState('active');
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
  }, []);

  const end = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setState('ended');
  }, []);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  return { state, elapsed, accept, finishIntro, end };
}
