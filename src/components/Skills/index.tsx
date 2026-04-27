import { useRef } from 'react';
import { motion, useInView, type Variants } from 'framer-motion';
import { skills } from '../../data/skills';
import './Skills.css';

const categories = ['Platform', 'AI/ML', 'Dev', 'Integration'];

const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function SkillBar({ name, level, delay }: { name: string; level: number; delay: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <div ref={ref} className="skill-item">
      <div className="skill-row">
        <span className="skill-name">{name}</span>
        <span className="skill-level">{level}%</span>
      </div>
      <div className="skill-track">
        <motion.div
          className="skill-bar"
          initial={{ width: 0 }}
          animate={inView ? { width: `${level}%` } : { width: 0 }}
          transition={{ duration: 1.0, delay, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export default function Skills() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="skills" id="skills">
      <div className="section-wrap">
        <motion.div
          ref={ref}
          variants={container}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
        >
          <motion.div variants={item} className="skills-header">
            <span className="skills-num">03</span>
            <div>
              <span className="skills-prompt">{'>'} OPTION 3 SELECTED — LOADING SYSTEM PROFILE...</span>
              <h2 className="skills-title">CAPABILITIES</h2>
            </div>
          </motion.div>

          <div className="skills-grid">
            {categories.map((cat) => (
              <motion.div key={cat} variants={item} className="skills-cat neon-border">
                <div className="skills-cat-header">{cat.toUpperCase()}</div>
                <div className="skills-cat-body">
                  {skills
                    .filter((s) => s.category === cat)
                    .map((s, i) => (
                      <SkillBar key={s.name} name={s.name} level={s.level} delay={i * 0.08} />
                    ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Certifications */}
          <motion.div variants={item} className="skills-certs">
            <div className="skills-certs-header">CERTIFICATIONS & QUALIFICATIONS</div>
            <div className="skills-certs-grid">
              {[
                'Infosys Certified Contact Center Platform Professional',
                'Infosys Certified Contact Center Technology Components & Integrations Professional',
                'Infosys Certified Contact Center Professional',
                'Infosys Certified Applied Generative AI Professional',
                'Infosys Certified AI Consumer',
                'Infosys Certified IoT Professional',
                'Infosys Global Agile Developer Certification',
                'Infosys Certified Python Associate',
                'Infosys Certified Java SE8 Developer – 101',
                'AI Strategy Certification — eCornell',
              ].map((c) => (
                <div key={c} className="skills-cert">
                  <div className="skills-cert-dot" />
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
