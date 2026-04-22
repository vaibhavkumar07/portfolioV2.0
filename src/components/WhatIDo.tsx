import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useScrollReveal } from "../hooks/useScrollReveal";
import "./styles/WhatIDo.css";

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    id: "ivr",
    code: "SVC-001",
    heading: "IVR DESIGN & DEVELOPMENT",
    description:
      "End-to-end IVR application development on Genesys Cloud and PureConnect. From initial call flow architecture to production deployment — DTMF menus, ASR grammars, TTS prompts, and self-service treatments that handle real call volume.",
    skills: ["Genesys Architect", "DTMF", "ASR / NLU", "TTS", "Inbound Flows", "Queue Routing", "Self-Service IVR"],
  },
  {
    id: "cti",
    code: "SVC-002",
    heading: "CTI & SYSTEM INTEGRATION",
    description:
      "Connecting the contact center to the rest of the enterprise. REST data actions, CRM screen pops, real-time statistics APIs, and omnichannel routing logic that ties Genesys to Salesforce, ServiceNow, or any backend system.",
    skills: ["REST APIs", "Salesforce CTI", "ServiceNow", "Data Actions", "Omnichannel", "Reporting APIs", "Python / SQL"],
  },
  {
    id: "ai",
    code: "SVC-003",
    heading: "AI STUDIO & BOT FLOWS",
    description:
      "Designing and deploying conversational AI bots within Genesys AI Studio and Architect bot flows. NLU intent mapping, slot filling, escalation paths, Azure Cognitive Services integration, and OpenAI-powered journey summaries.",
    skills: ["AI Studio", "Bot Flows", "Azure TTS/STT", "OpenAI", "Dialogflow", "NLU / Intents", "Observe.AI"],
  },
];

const WhatIDo = () => {
  const sectionRef = useScrollReveal<HTMLElement>(0.08);
  const containerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const isTouchDevice = ScrollTrigger.isTouch === 1;
    setIsTouch(isTouchDevice);
    if (!isTouchDevice) return;
    const handlers: Array<{ el: HTMLDivElement; fn: EventListener }> = [];
    containerRefs.current.forEach((el) => {
      if (!el) return;
      el.classList.remove("what-noTouch");
      const fn: EventListener = () => {
        el.classList.toggle("what-active");
        containerRefs.current.forEach((s) => {
          if (s && s !== el) s.classList.remove("what-active");
        });
      };
      el.addEventListener("click", fn);
      handlers.push({ el, fn });
    });
    return () => { handlers.forEach(({ el, fn }) => el.removeEventListener("click", fn)); };
  }, []);

  return (
    <section ref={sectionRef} className="what-section section-container scene-reveal" id="what-i-do">
      <span className="ghost-num" aria-hidden="true">02</span>
      <div className="ivr-section-header">
        <span className="ivr-section-num">02</span>
        <span className="ivr-section-title">SERVICES AVAILABLE</span>
        <span className="ivr-section-line" />
      </div>

      <p className="ivr-prompt what-prompt">Listing available developer services...</p>

      <div className="what-grid">
        {services.map((s, i) => (
          <div
            key={s.id}
            ref={(el) => { containerRefs.current[i] = el; }}
            className="what-card what-noTouch"
          >
            <div className="what-card-front">
              <div className="what-card-header">
                <span className="what-code">{s.code}</span>
                <div className="what-number">0{i + 1}</div>
              </div>
              <h3>{s.heading}</h3>
              <div className="what-hover-hint">{isTouch ? "tap to expand" : "hover to expand"}</div>
              <svg className="what-corner" viewBox="0 0 40 40">
                <path d="M0 40 L0 0 L40 0" stroke="var(--accent)" strokeWidth="1.5" fill="none" />
              </svg>
            </div>
            <div className="what-card-back">
              <p className="para">{s.description}</p>
              <div className="what-skills">
                {s.skills.map((sk) => (
                  <span key={sk} className="what-skill-tag">{sk}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhatIDo;
