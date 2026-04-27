import { Suspense, useEffect, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { MdArrowDownward, MdVerified, MdOpenInNew } from 'react-icons/md';
import { lazy } from 'react';
import './Hero.css';

const Scene = lazy(() => import('../Scene'));

const ROLES = [
  'Genesys Cloud IVR Developer',
  'Contact Center Architect',
  'AI-Powered CX Engineer',
];

function RotatingRole() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % ROLES.length), 2800);
    return () => clearInterval(t);
  }, []);
  return (
    <motion.span
      key={idx}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4 }}
      className="hero-role"
    >
      {ROLES[idx]}
    </motion.span>
  );
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="section-wrap hero-inner">
        {/* Left — content */}
        <motion.div
          className="hero-content"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item} className="hero-eyebrow">
            <span className="hero-call-badge">
              <span className="hero-call-dot" />
              CALL CONNECTED
            </span>
          </motion.div>

          <motion.div variants={item} className="hero-prompt">
            <span className="hero-prompt-tag">{'>'} CALLER IDENTIFIED</span>
          </motion.div>

          <motion.h1 variants={item} className="hero-name glitch" data-text="Vaibhavkumar Yadav">
            Vaibhavkumar<br />Yadav
          </motion.h1>

          <motion.div variants={item} className="hero-role-wrap">
            <RotatingRole />
          </motion.div>

          <motion.p variants={item} className="hero-bio">
            7+ years building enterprise-grade IVR and contact center solutions on Genesys Cloud CX.
            SME in Architect flows, AI Studio, Azure TTS/STT, OpenAI integration, and omnichannel
            routing for healthcare and e-commerce at scale.
          </motion.p>

          <motion.div variants={item} className="hero-badges">
            <span className="g-badge"><MdVerified size={10} /> Infosys Certified</span>
            <span className="g-badge">Infosys Limited · Richardson, TX</span>
            <span className="hero-badge-accent">yadavvaibhavkumar7@gmail.com</span>
            <a href="https://www.linkedin.com/in/vaibhavkumar-yadav-633552233/" target="_blank" rel="noopener noreferrer" className="g-badge hero-linkedin">
              <MdOpenInNew size={10} /> LinkedIn
            </a>
          </motion.div>

          <motion.div variants={item} className="hero-stats">
            {[['7+', 'Years Exp'], ['7', 'Infosys Awards'], ['10', 'Certifications']].map(([n, l]) => (
              <div key={l} className="hero-stat">
                <span className="hero-stat-num">{n}</span>
                <span className="hero-stat-label">{l}</span>
              </div>
            ))}
          </motion.div>

          <motion.a variants={item} href="#contact" className="hero-cta">
            TRANSFER TO CONTACT
            <MdArrowDownward />
          </motion.a>
        </motion.div>

        {/* Right — 3D Scene */}
        <div className="hero-scene">
          <Suspense fallback={<div className="hero-scene-placeholder">LOADING TOPOLOGY...</div>}>
            <Scene />
          </Suspense>
          <div className="hero-scene-label">GENESYS NETWORK TOPOLOGY</div>
        </div>
      </div>

      {/* Scroll hint */}
      <motion.div
        className="hero-scroll"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity }}
      >
        <MdArrowDownward size={16} />
        <span>SCROLL TO NAVIGATE</span>
      </motion.div>
    </section>
  );
}
