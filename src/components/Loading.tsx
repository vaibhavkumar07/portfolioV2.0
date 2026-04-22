import { useState, useRef } from "react";
import { useLoading } from "../context/LoadingContext";
import "./styles/Loading.css";

const Loading = () => {
  const [phase, setPhase] = useState<"ringing" | "connecting">("ringing");
  const [percent, setPercent] = useState(0);
  const [exiting, setExiting] = useState(false);
  const { setIsLoading } = useLoading();
  const doneRef = useRef(false);

  const handleAccept = () => {
    setPhase("connecting");
    let current = 0;
    const iv = setInterval(() => {
      current += Math.random() * 14 + 6;
      if (current >= 100) {
        current = 100;
        clearInterval(iv);
        if (!doneRef.current) {
          doneRef.current = true;
          setPercent(100);
          setTimeout(() => {
            setExiting(true);
            import("./utils/initialFX").then(({ initialFX }) => initialFX()).catch(() => {});
            setTimeout(() => setIsLoading(false), 700);
          }, 350);
        }
        return;
      }
      setPercent(Math.floor(current));
    }, 45);
  };

  return (
    <div className={`ivr-call-screen${exiting ? " call-screen-exit" : ""}`}>
      {phase === "ringing" ? (
        <div className="call-card">
          <div className="call-rings-wrap">
            <div className="call-ring cr1" />
            <div className="call-ring cr2" />
            <div className="call-ring cr3" />
            <div className="call-avatar">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" fill="currentColor"/>
              </svg>
            </div>
          </div>

          <div className="call-incoming-label">INCOMING CALL</div>
          <div className="call-name">VAIBHAVKUMAR YADAV</div>
          <div className="call-role">IVR Developer · Genesys Cloud</div>

          <div className="call-meta-row">
            <span className="call-meta-tag">GENESYS CLOUD CX</span>
            <span className="call-meta-dot">·</span>
            <span className="call-meta-tag">INFOSYS LIMITED</span>
          </div>

          <div className="call-actions">
            <div className="call-btn-wrap">
              <button
                className="call-btn call-decline"
                aria-label="Decline"
                onClick={() => {}}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="currentColor"/>
                </svg>
              </button>
              <span className="call-btn-label">Decline</span>
            </div>
            <div className="call-btn-wrap">
              <button
                className="call-btn call-accept"
                aria-label="Accept"
                onClick={handleAccept}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" fill="currentColor"/>
                </svg>
              </button>
              <span className="call-btn-label">Accept</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="call-connecting">
          <div className="call-connecting-waveform">
            {[1,2,3,4,5,6,7].map((i) => (
              <div key={i} className="cwave-bar" style={{ animationDelay: `${i * 0.09}s` }} />
            ))}
          </div>
          <div className="call-connecting-label">CONNECTING...</div>
          <div className="call-connecting-sub">Establishing secure session with VKY Portfolio</div>
          <div className="call-bar-wrap">
            <div className="call-bar" style={{ width: `${percent}%` }} />
          </div>
          <div className="call-pct">{percent}<span>%</span></div>
        </div>
      )}

      <div className="call-screen-footer">
        <span>VKY · PORTFOLIO</span>
        <span>GENESYS CLOUD CX</span>
      </div>
    </div>
  );
};

export default Loading;
