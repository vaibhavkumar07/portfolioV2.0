import { motion } from 'framer-motion';
import { MdCall, MdCallEnd } from 'react-icons/md';
import './Splash.css';

interface Props {
  onAccept: () => void;
  onDecline: () => void;
}

export default function Splash({ onAccept, onDecline }: Props) {
  return (
    <motion.div
      className="splash"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
    >
      {/* Ring pulses */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="splash-ring" style={{ animationDelay: `${i * 0.4}s` }} />
      ))}

      <motion.div
        className="splash-card"
        initial={{ scale: 0.8, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 20 }}
      >
        {/* Status */}
        <div className="splash-status">
          <span className="splash-status-dot" />
          <span>INCOMING CALL</span>
        </div>

        {/* Avatar */}
        <div className="splash-avatar">
          <div className="splash-avatar-ring" />
          <div className="splash-avatar-inner">
            <img src="/profile.jpeg" alt="Vaibhavkumar Yadav" className="splash-avatar-img" />
          </div>
        </div>

        {/* Identity */}
        <div className="splash-identity">
          <h1 className="splash-name">Vaibhavkumar Yadav</h1>
          <p className="splash-role">Genesys Cloud IVR Developer</p>
          <span className="g-badge">Infosys Limited</span>
        </div>

        {/* Call info */}
        <div className="splash-meta">
          <span className="splash-meta-item">+1 · IVR SPECIALIST</span>
          <span className="splash-meta-sep">·</span>
          <span className="splash-meta-item">7+ YRS EXP</span>
        </div>

        {/* Waveform */}
        <div className="splash-wave">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="splash-wave-bar"
              style={{ animationDelay: `${i * 0.06}s`, height: `${8 + Math.sin(i * 0.8) * 14}px` }}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="splash-actions">
          <button type="button" className="splash-btn splash-btn--decline" onClick={onDecline} aria-label="Decline">
            <MdCallEnd size={28} />
          </button>
          <motion.button
            type="button"
            className="splash-btn splash-btn--accept"
            onClick={onAccept}
            aria-label="Accept"
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            <MdCall size={28} />
          </motion.button>
        </div>

        <p className="splash-hint">Slide to answer</p>
      </motion.div>
    </motion.div>
  );
}
