import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence, type Variants } from 'framer-motion';
import { MdArrowBack, MdArrowForward } from 'react-icons/md';
import { projects } from '../../data/projects';
import './Work.css';

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Work() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [dir, setDir] = useState<1 | -1>(1);

  const go = (d: 1 | -1) => {
    if (animating) return;
    setDir(d);
    setAnimating(true);
    setTimeout(() => {
      setCurrent((c) => (c + d + projects.length) % projects.length);
      setAnimating(false);
    }, 350);
  };

  const p = projects[current];

  return (
    <section className="work" id="work">
      <div className="section-wrap">
        <motion.div
          ref={ref}
          variants={container}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
        >
          {/* Header */}
          <motion.div variants={item} className="work-header">
            <span className="work-num">02</span>
            <div>
              <span className="work-prompt">{'>'} OPTION 2 SELECTED — SEARCHING RECORDS...</span>
              <h2 className="work-title-h">PROJECT RESULTS</h2>
            </div>
            <div className="work-count">
              <span className="work-count-cur">{String(current + 1).padStart(2, '0')}</span>
              <span className="work-count-sep"> / </span>
              <span>{String(projects.length).padStart(2, '0')}</span>
            </div>
          </motion.div>

          {/* Slide */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              className="work-slide"
              initial={{ opacity: 0, x: dir * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -dir * 40 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <div className="work-info">
                <div className="work-meta">
                  <span className="work-record-id">RESULT-{p.id}</span>
                  <span className="work-category">{p.category}</span>
                </div>
                <div className="work-tools">{p.tools}</div>
                <h3 className="work-project-title glitch" data-text={p.title}>{p.title}</h3>
                <p className="work-desc">{p.description}</p>
              </div>

              {/* Visual */}
              <div className="work-visual neon-border">
                <div className="work-visual-grid" />
                <div className="work-visual-center">
                  <div className="work-visual-id">{p.id}</div>
                  <div className="work-visual-name">{p.title.split(' ').slice(0, 2).join(' ')}</div>
                  <div className="work-visual-nodes">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="work-node" style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                </div>
                <div className="work-visual-scanline" />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <motion.div variants={item} className="work-controls">
            <button type="button" className="work-ctrl" onClick={() => go(-1)} aria-label="Previous">
              <MdArrowBack />
            </button>
            <div className="work-dots">
              {projects.map((_, i) => (
                <button
                  key={i} type="button"
                  className={`work-dot${i === current ? ' work-dot--active' : ''}`}
                  onClick={() => { if (!animating) { setDir(i > current ? 1 : -1); setAnimating(true); setTimeout(() => { setCurrent(i); setAnimating(false); }, 350); } }}
                  aria-label={`Project ${i + 1}`}
                />
              ))}
            </div>
            <button type="button" className="work-ctrl" onClick={() => go(1)} aria-label="Next">
              <MdArrowForward />
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
