import { useRef, useEffect, useState } from 'react';
import { motion, useInView, type Variants } from 'framer-motion';
import { useSpotlight } from '../../hooks/useSpotlight';
import './About.css';

const BIO_LINES = [
  "I design and build enterprise contact center solutions on Genesys Cloud CX that handle millions of calls for healthcare and e-commerce clients.",
  "My work spans IVR/bot flows in Genesys Architect, AI Studio, and SDK — integrating Azure Cognitive Services for TTS/STT and OpenAI/ChatGPT for personalized customer journeys.",
  "I architect predictive routing, post-call surveys, AI scoring, and Power Automate workflows, ensuring PII/PHI/PCI compliance for regulated industries.",
  "Package Consultant 2 — Genesys Cloud SME at Infosys Limited, Richardson TX. Holder of an IoT patent and 7 Infosys awards including Tech Maestro and RISE MVP.",
];

function TypedLine({ text, delay }: { text: string; delay: number }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  useEffect(() => {
    if (inView) { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }
  }, [inView, delay]);

  return (
    <p ref={ref} className={`about-line${visible ? ' about-line--visible' : ''}`}>
      {visible ? text : ' '}
    </p>
  );
}

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

export default function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const spotlight = useSpotlight();

  return (
    <section className="about" id="about">
      <div className="section-wrap">
        <motion.div
          ref={ref}
          variants={container}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
        >
          {/* Header */}
          <motion.div variants={item} className="about-header">
            <span className="about-num">01</span>
            <div className="about-header-line">
              <span className="about-prompt">{'>'} OPTION 1 SELECTED</span>
              <h2 className="about-title text-shimmer">ABOUT ME</h2>
            </div>
          </motion.div>

          <div className="about-grid">
            {/* Bio */}
            <motion.div variants={item} className="about-bio">
              <div className="about-ivr-prompt">
                <span className="about-ivr-tag">IVR://CALLER_PROFILE</span>
              </div>
              {BIO_LINES.map((line, i) => (
                <TypedLine key={i} text={line} delay={i * 200} />
              ))}
            </motion.div>

            {/* Info panel */}
            <motion.div
              variants={item}
              className="about-panel spotlight-card"
              onMouseMove={spotlight.onMouseMove}
            >
              <div className="about-panel-header">CALLER DETAILS</div>
              {[
                ['NAME',     'Vaibhavkumar Yadav'],
                ['LOCATION', 'Richardson, TX, USA'],
                ['COMPANY',  'Infosys Limited'],
                ['ROLE',     'Package Consultant 2 — Genesys SME'],
                ['EMAIL',    'yadavvaibhavkumar7@gmail.com'],
                ['EXP',      '7+ Years'],
              ].map(([k, v]) => (
                <div key={k} className="about-row">
                  <span className="about-row-key">{k}</span>
                  <span className="about-row-val">{v}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Experience timeline */}
          <motion.div variants={item} className="about-timeline">
            <div className="about-timeline-header">CALL HISTORY</div>
            {[
              { period: 'Oct 2025 – Present · 7 mos', role: 'Package Consultant 2', co: 'Infosys Limited · United States · On-site', desc: 'Genesys Cloud and Generative AI' },
              { period: 'Jan 2025 – Sep 2025 · 9 mos', role: 'Consultant', co: 'Infosys Limited · United States · On-site', desc: 'Genesys Cloud' },
              { period: 'May 2023 – Dec 2024 · 1 yr 8 mos', role: 'Technology Analyst', co: 'Infosys Limited · United States · On-site', desc: 'Genesys Cloud' },
              { period: 'Oct 2021 – Apr 2023 · 1 yr 7 mos', role: 'Technology Analyst', co: 'Infosys Limited · Pune District, Maharashtra, India', desc: 'Genesys Cloud' },
              { period: 'Jul 2020 – Sep 2021 · 1 yr 3 mos', role: 'Senior System Engineer', co: 'Infosys Limited · Bengaluru, Karnataka, India', desc: '' },
              { period: 'May 2018 – Jun 2020 · 2 yrs 2 mos', role: 'System Engineer', co: 'Infosys Limited · Bengaluru, Karnataka, India', desc: '' },
            ].map((e, i) => (
              <div key={i} className="about-event">
                <div className="about-event-dot" />
                <div className="about-event-body">
                  <div className="about-event-period">{e.period}</div>
                  <div className="about-event-role">{e.role}</div>
                  <div className="about-event-co">{e.co}</div>
                  <p className="about-event-desc">{e.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
