import { useScrollReveal } from "../hooks/useScrollReveal";
import "./styles/About.css";

const About = () => {
  const sectionRef = useScrollReveal<HTMLElement>(0.08);

  return (
    <section ref={sectionRef} className="about-section section-container scene-reveal" id="about">
      <span className="ghost-num" aria-hidden="true">01</span>
      <div className="ivr-section-header">
        <span className="ivr-section-num">01</span>
        <span className="ivr-section-title">DEVELOPER PROFILE</span>
        <span className="ivr-section-line" />
      </div>

      <div className="about-grid">
        <div className="about-bio scene-reveal-left">
          <p className="ivr-prompt">Retrieving developer profile...</p>
          <p className="ivr-prompt">Profile confirmed. Displaying.</p>

          <p className="about-text">
            Genesys Cloud CX Developer and Contact Center Architect with{" "}
            <strong>7+ years at Infosys</strong>, designing and delivering
            intelligent cloud-based contact center solutions for Healthcare and
            E-commerce. Package Consultant 2 and Genesys Cloud SME based in
            Richardson, TX.
          </p>
          <p className="about-text">
            Deep expertise in Architect (IVR/Bot Flows), AI Studio, Genesys
            Cloud SDK, and Data Actions. Integrates Azure TTS/STT, OpenAI,
            Google Dialogflow, Observe.AI, and Moveworks to deliver
            AI-aware customer experiences at scale. Holder of an IoT patent
            and 7 Infosys awards including Tech Maestro and RISE MVP.
          </p>

          <div className="about-tags">
            {[
              "Genesys Cloud CX", "Architect & IVR", "AI Studio",
              "Azure TTS/STT", "OpenAI / ChatGPT", "Dialogflow",
              "CX as Code", "Healthcare & E-commerce",
            ].map((tag) => (
              <span key={tag} className="about-tag">{tag}</span>
            ))}
          </div>
        </div>

        <div className="about-records scene-reveal-right">
          <div className="about-records-header">
            <span className="ivr-prompt">Fetching record details...</span>
          </div>
          {[
            { key: "LOCATION",  val: "Richardson, Texas, USA" },
            { key: "COMPANY",   val: "Infosys Limited" },
            { key: "ROLE",      val: "Package Consultant 2 — Genesys Cloud SME" },
            { key: "PATENT",    val: "Smart Home Automation using Virtue of IoT" },
            { key: "AWARDS",    val: "7 Infosys Awards incl. Tech Maestro · RISE MVP" },
            { key: "CERTS",     val: "11 Certifications" },
          ].map(({ key, val }) => (
            <div key={key} className="about-record-row">
              <span className="about-record-key">{key}</span>
              <span className="about-record-val">{val}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
