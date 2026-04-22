import "./styles/Marquee.css";

const TERMS = [
  "IVR DEVELOPMENT", "GENESYS CLOUD CX", "ARCHITECT FLOWS",
  "AI STUDIO", "AZURE TTS/STT", "OPENAI INTEGRATION",
  "CX ARCHITECT", "BOT FLOWS", "REST DATA ACTIONS", "CONTACT CENTER",
  "DTMF ROUTING", "ASR / NLU", "OBSERVE.AI", "DIALOGFLOW CX",
  "OMNICHANNEL", "CX AS CODE", "7+ YEARS", "11 CERTIFICATIONS",
];

const Marquee = ({ reverse = false }: { reverse?: boolean }) => (
  <div className={`marquee-band${reverse ? " marquee-reverse" : ""}`} aria-hidden="true">
    <div className="marquee-track">
      {[...TERMS, ...TERMS].map((t, i) => (
        <span key={i} className="marquee-item">
          <span className="marquee-diamond">◆</span>
          {t}
        </span>
      ))}
    </div>
  </div>
);

export default Marquee;
