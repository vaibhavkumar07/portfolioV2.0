import { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  MdPlayArrow, MdPause, MdVolumeUp, MdVolumeOff, MdReplay, MdSkipNext,
} from 'react-icons/md';
import { useNarrationSync } from '../../hooks/useNarrationSync';
import './Intro.css';

const BASE = import.meta.env.BASE_URL;

export default function IntroPresenter({ onFinish }: { onFinish: () => void }) {
  const reduce = useReducedMotion();
  const {
    audioRef, item, index, total, playing, muted, captionOnly, progress,
    onEnded, onTimeUpdate, controls,
  } = useNarrationSync(onFinish);

  // Keyboard shortcuts: Space = play/pause, M = mute, S/Esc = skip.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ') { e.preventDefault(); controls.togglePlay(); }
      else if (e.key.toLowerCase() === 'm') controls.toggleMute();
      else if (e.key.toLowerCase() === 's' || e.key === 'Escape') controls.skip();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [controls]);

  const docked = index >= 1; // after the greeting, dock and let sections take over
  const speaking = playing && !reduce;

  return (
    <motion.div
      className="intro"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      role="dialog"
      aria-label="Intro briefing"
    >
      <div className={`intro-backdrop${docked ? ' intro-backdrop--docked' : ''}`} />

      {/* Avatar — center card during greeting, docks to corner for the walkthrough */}
      <div
        className={`intro-avatar ${docked ? 'intro-avatar--docked' : 'intro-avatar--center'}`}
        data-reduce={reduce ? 'true' : 'false'}
      >
        <div className="intro-avatar-media">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`intro-ring${speaking ? ' intro-ring--on' : ''}`}
              style={{ animationDelay: `${i * 0.5}s` }}
            />
          ))}
          <img src={`${BASE}profile.jpeg`} alt="Vaibhavkumar Yadav" className="intro-avatar-img" />
          <span className="intro-live">
            <span className="intro-live-dot" /> {captionOnly ? 'BRIEFING' : 'ON AIR'}
          </span>
        </div>

        {!docked && (
          <div className="intro-identity">
            <div className="intro-status">
              <span className="intro-status-dot" /> CALL CONNECTED · BRIEFING
            </div>
            <h1 className="intro-name">Vaibhavkumar Yadav</h1>
            <p className="intro-role">Genesys Cloud IVR Developer</p>
          </div>
        )}

        {/* Equalizer — small "speaking" cue */}
        <div className="intro-eq" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={`intro-eq-bar${speaking ? ' intro-eq-bar--on' : ''}`}
              style={{ animationDelay: `${i * 0.12}s` }}
            />
          ))}
        </div>
      </div>

      {docked && item && (
        <div className="intro-section-chip">{'>'} NOW SHOWING — {item.section.toUpperCase()}</div>
      )}

      {/* Caption — always visible (carries the message when muted) */}
      <p className="intro-caption" aria-live="polite">{item?.text}</p>

      {/* Controls + progress */}
      <div className="intro-controls">
        <div className="intro-progress">
          <div className="intro-progress-bar" style={{ width: `${progress * 100}%` }} />
        </div>
        <div className="intro-buttons">
          <button type="button" className="intro-btn" onClick={controls.togglePlay}
            aria-label={playing ? 'Pause' : 'Play'} title={playing ? 'Pause (space)' : 'Play (space)'}>
            {playing ? <MdPause size={18} /> : <MdPlayArrow size={18} />}
          </button>
          <button type="button" className="intro-btn" onClick={controls.toggleMute}
            aria-label={muted ? 'Unmute' : 'Mute'} title={muted ? 'Unmute (m)' : 'Mute (m)'}>
            {muted ? <MdVolumeOff size={18} /> : <MdVolumeUp size={18} />}
          </button>
          <button type="button" className="intro-btn" onClick={controls.replay}
            aria-label="Replay" title="Replay from start">
            <MdReplay size={18} />
          </button>
          <span className="intro-step">{Math.min(index + 1, total)} / {total}</span>
          <button type="button" className="intro-skip" onClick={controls.skip}
            aria-label="Skip intro" title="Skip (s)">
            SKIP <MdSkipNext size={16} />
          </button>
        </div>
      </div>

      <audio ref={audioRef} onEnded={onEnded} onTimeUpdate={onTimeUpdate} hidden preload="auto" />
    </motion.div>
  );
}
