import { useEffect } from "react";
import { career } from "../data";
import { setAllTimeline } from "./utils/GsapScroll";
import { useScrollReveal } from "../hooks/useScrollReveal";
import "./styles/Career.css";

const Career = () => {
  const sectionRef = useScrollReveal<HTMLElement>(0.06);
  useEffect(() => {
    setAllTimeline();
  }, []);

  return (
    <section ref={sectionRef} className="career-section section-container scene-reveal" id="career">
      <span className="ghost-num" aria-hidden="true">03</span>
      <div className="ivr-section-header">
        <span className="ivr-section-num">03</span>
        <span className="ivr-section-title">CAREER HISTORY</span>
        <span className="ivr-section-line" />
      </div>

      <p className="ivr-prompt career-prompt">
        Retrieving {career.length} records from career history...
      </p>

      <div className="career-container">
        <div className="career-timeline-track">
          <div className="career-timeline-line" />
        </div>

        <div className="career-boxes scene-stagger">
          {career.map((item, i) => (
            <div key={i} className="career-entry scene-reveal">
              <div className="career-entry-dot">
                <div className="career-dot-inner" />
              </div>

              <div className="career-entry-card">
                <div className="career-entry-meta">
                  <span className="career-entry-index">REC-{String(i + 1).padStart(3, "0")}</span>
                  <span className="career-entry-period">{item.period}</span>
                </div>
                <div className="career-entry-header">
                  <h4 className="career-role">{item.role}</h4>
                  <h5 className="career-company">{item.company}</h5>
                </div>
                <p className="career-desc para">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Career;
