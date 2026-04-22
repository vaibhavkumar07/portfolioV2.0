import { MdArrowOutward, MdCopyright } from "react-icons/md";
import { socials } from "../data";
import { useScrollReveal } from "../hooks/useScrollReveal";
import "./styles/Contact.css";

const Contact = () => {
  const sectionRef = useScrollReveal<HTMLElement>(0.08);
  return (
    <section ref={sectionRef} className="contact-section section-container scene-reveal" id="contact">
      <span className="ghost-num" aria-hidden="true">05</span>
      <div className="ivr-section-header">
        <span className="ivr-section-num">05</span>
        <span className="ivr-section-title">CONTACT OPTIONS</span>
        <span className="ivr-section-line" />
      </div>

      <p className="ivr-prompt contact-prompt">
        Connecting you to developer. Please choose a contact channel.
      </p>

      <div className="contact-grid">
        <div className="contact-main">
          <div className="contact-id-card">
            <div className="contact-id-header">
              <span className="contact-id-label">DEVELOPER CONTACT CARD</span>
              <span className="contact-status"><span className="status-dot-live" />AVAILABLE</span>
            </div>
            <h2 className="contact-name">Vaibhavkumar Yadav</h2>
            <p className="contact-role">IVR Developer · Genesys Cloud SME · Infosys Limited</p>

            <div className="contact-channels">
              {[
                { label: "EMAIL",    val: socials.email,        href: `mailto:${socials.email}` },
                { label: "PHONE",    val: "+1 945-542-0116",    href: "tel:+19455420116" },
                { label: "LOCATION", val: "Richardson, TX, USA", href: null },
              ].map(({ label, val, href }) => (
                <div key={label} className="contact-channel-row">
                  <span className="contact-ch-key">{label}</span>
                  {href ? (
                    <a href={href} className="contact-ch-val" data-cursor="disable">{val}</a>
                  ) : (
                    <span className="contact-ch-val">{val}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <p className="contact-cta">
            Open to Genesys Cloud projects, contact center modernization,
            AI bot development, CX architecture consulting, and full-time opportunities.
          </p>
        </div>

        <div className="contact-links-panel">
          <div className="contact-links-header">
            <span className="ivr-prompt">Available channels:</span>
          </div>
          <div className="contact-links">
            <a href={socials.linkedin} target="_blank" rel="noreferrer" className="contact-link-btn" data-cursor="disable">
              <span className="clbtn-key">[LI]</span>
              <span>LinkedIn</span>
              <MdArrowOutward className="clbtn-icon" />
            </a>
            <a href="https://vaibhavkumar07.github.io/portfolio" target="_blank" rel="noreferrer" className="contact-link-btn" data-cursor="disable">
              <span className="clbtn-key">[GH]</span>
              <span>Portfolio v1</span>
              <MdArrowOutward className="clbtn-icon" />
            </a>
            <a href={`mailto:${socials.email}`} className="contact-link-btn" data-cursor="disable">
              <span className="clbtn-key">[EM]</span>
              <span>Email</span>
              <MdArrowOutward className="clbtn-icon" />
            </a>
          </div>

          <div className="contact-end-call">
            <div className="contact-end-line" />
            <div className="contact-end-btn-wrap">
              <button type="button" className="contact-end-btn btn-ring-pulse magnetic-lift" onClick={() => {
                const el = document.getElementById("landing");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                else window.scrollTo({ top: 0, behavior: "smooth" });
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 9c-1.6-1.6-3.7-2.5-6-2.5v-2c2.8 0 5.4 1.1 7.3 3l-1.3 1.5zm2.4 2.4c-.5-.5-1-.9-1.6-1.2l-1.5 1.5c.6.3 1.2.7 1.7 1.2l1.4-1.5zm4.3 4.3l-2.8-2.8c-.4-.4-1-.4-1.4 0l-1.7 1.7c-1.4-.7-2.7-1.8-3.8-3.2-.3-.3-.4-.7-.1-1l1.5-1.7c.4-.4.4-1 0-1.4L8.3 7.3c-.4-.4-1-.4-1.4 0l-1.4 1.4C4.8 9.4 4.5 10.2 5 11c1.3 3 4 5.6 7 6.8.7.3 1.5 0 2.1-.5l1.4-1.3c.4-.4.4-1.1.2-1.3z" fill="currentColor"/>
                </svg>
                END CALL
              </button>
              <span className="contact-end-hint">Return to start</span>
            </div>
          </div>
        </div>
      </div>

      <div className="contact-footer">
        <span>Designed & developed by Vaibhavkumar Yadav · IVR Developer & Genesys Cloud Architect</span>
        <span>
          <MdCopyright /> 2026
        </span>
      </div>
    </section>
  );
};

export default Contact;
