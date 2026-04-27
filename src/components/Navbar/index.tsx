import { motion, AnimatePresence } from 'framer-motion';
import { MdMic, MdMicOff, MdPause, MdPerson, MdClose, MdOpenInNew } from 'react-icons/md';
import { useState, useRef, useEffect } from 'react';
import { formatElapsed } from '../../hooks/useCallState';
import './Navbar.css';

interface Props {
  elapsed: number;
  onEnd: () => void;
  onNav: (id: string) => void;
}

const SECTIONS = [
  { id: 'hero',    label: 'HOME',    key: '0' },
  { id: 'about',   label: 'ABOUT',   key: '1' },
  { id: 'work',    label: 'WORK',    key: '2' },
  { id: 'skills',  label: 'SKILLS',  key: '3' },
  { id: 'contact', label: 'CONTACT', key: '4' },
];

export default function Navbar({ elapsed, onEnd, onNav }: Props) {
  const [muted, setMuted] = useState(false);
  const [held, setHeld] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [profileOpen]);

  return (
    <motion.header
      className="navbar"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 22 }}
    >
      {/* Left — call status */}
      <div className="navbar-left">
        <div className="navbar-dot" />
        <div className="navbar-info">
          <span className="navbar-status">CONNECTED</span>
          <span className="navbar-timer">{formatElapsed(elapsed)}</span>
        </div>
      </div>

      {/* Center — section nav */}
      <nav className="navbar-nav">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            className="navbar-link"
            onClick={() => onNav(s.id)}
          >
            <span className="navbar-key">{s.key}</span>
            {s.label}
          </button>
        ))}
      </nav>

      {/* Right — call controls */}
      <div className="navbar-controls">
        <button
          type="button"
          className={`navbar-ctrl${muted ? ' navbar-ctrl--active' : ''}`}
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? 'Unmute' : 'Mute'}
          title={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? <MdMicOff size={16} /> : <MdMic size={16} />}
        </button>
        <button
          type="button"
          className={`navbar-ctrl${held ? ' navbar-ctrl--hold' : ''}`}
          onClick={() => setHeld((h) => !h)}
          aria-label={held ? 'Resume' : 'Hold'}
          title={held ? 'Resume' : 'Hold'}
        >
          <MdPause size={16} />
        </button>
        <div className="navbar-profile-wrap" ref={profileRef}>
          <button
            type="button"
            className={`navbar-ctrl${profileOpen ? ' navbar-ctrl--active' : ''}`}
            aria-label="Profile"
            title="Profile"
            onClick={() => setProfileOpen((o) => !o)}
          >
            <MdPerson size={16} />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                className="profile-card"
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <button className="profile-card-close" onClick={() => setProfileOpen(false)} aria-label="Close">
                  <MdClose size={14} />
                </button>
                <img src="/profile.jpeg" alt="Vaibhavkumar Yadav" className="profile-card-avatar" />
                <div className="profile-card-name">Vaibhavkumar Yadav</div>
                <div className="profile-card-role">Package Consultant 2</div>
                <div className="profile-card-company">Infosys Limited · Richardson, TX</div>
                <div className="profile-card-divider" />
                <a
                  href="https://www.linkedin.com/in/vaibhavkumar-yadav-633552233/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="profile-card-link"
                >
                  <MdOpenInNew size={12} /> LinkedIn Profile
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          type="button"
          className="navbar-endcall"
          onClick={onEnd}
          aria-label="End Call"
        >
          <span>END CALL</span>
        </button>
      </div>
    </motion.header>
  );
}
