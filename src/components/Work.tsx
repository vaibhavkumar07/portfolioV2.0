import { useState, useCallback } from "react";
import { MdArrowBack, MdArrowForward, MdArrowOutward } from "react-icons/md";
import { projects } from "../data";
import WorkImage from "./WorkImage";
import { useScrollReveal } from "../hooks/useScrollReveal";
import "./styles/Work.css";

const Work = () => {
  const sectionRef = useScrollReveal<HTMLElement>(0.08);
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const go = useCallback(
    (dir: 1 | -1) => {
      if (animating) return;
      setAnimating(true);
      setTimeout(() => {
        setCurrent((c) => (c + dir + projects.length) % projects.length);
        setAnimating(false);
      }, 400);
    },
    [animating]
  );

  const project = projects[current];

  return (
    <section ref={sectionRef} className="work-section section-container scene-reveal" id="work">
      <span className="ghost-num" aria-hidden="true">04</span>
      <div className="ivr-section-header">
        <span className="ivr-section-num">04</span>
        <span className="ivr-section-title">PROJECT RESULTS</span>
        <span className="ivr-section-line" />
      </div>

      <div className="work-result-header">
        <p className="ivr-prompt">
          Search complete. Found {projects.length} projects.
        </p>
        <div className="work-result-count">
          <span className="work-result-idx">{String(current + 1).padStart(2, "0")}</span>
          <span className="work-result-sep"> / </span>
          <span>{String(projects.length).padStart(2, "0")}</span>
        </div>
      </div>

      <div className={`work-carousel${animating ? " work-fade" : ""}`}>
        <div className="work-slide">
          <div className="work-slide-info">
            <div className="work-slide-meta">
              <span className="work-result-num">RESULT-{String(current + 1).padStart(3, "0")}</span>
              <span className="work-category">{project.category}</span>
            </div>
            <div className="work-tools-line">{project.tools}</div>
            <h3 className="work-title glitch-hover" data-text={project.title}>{project.title}</h3>
            <a
              href={project.link}
              target="_blank"
              rel="noreferrer"
              className="work-link"
              data-cursor="icons"
            >
              View Project <MdArrowOutward />
            </a>
          </div>
          <div className="corner-accent">
            <WorkImage src={project.image} alt={project.title} />
          </div>
        </div>

        <div className="work-controls">
          <button type="button" onClick={() => go(-1)} aria-label="Previous" className="work-ctrl-btn">
            <MdArrowBack />
          </button>
          <div className="work-dots">
            {projects.map((_, i) => (
              <button
                type="button"
                key={i}
                className={`work-dot${i === current ? " work-dot-active" : ""}`}
                onClick={() => {
                  if (!animating) {
                    setAnimating(true);
                    setTimeout(() => { setCurrent(i); setAnimating(false); }, 400);
                  }
                }}
                aria-label={`Project ${i + 1}`}
              />
            ))}
          </div>
          <button type="button" onClick={() => go(1)} aria-label="Next" className="work-ctrl-btn">
            <MdArrowForward />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Work;
