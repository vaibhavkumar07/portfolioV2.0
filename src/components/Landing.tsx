import { useState, useEffect, useRef, type PropsWithChildren } from "react";
import "./styles/Landing.css";

function useCounter(target: number, duration = 1600, startDelay = 900) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setCount(Math.floor(eased * target));
        if (p < 1) requestAnimationFrame(tick);
        else setCount(target);
      };
      requestAnimationFrame(tick);
    }, startDelay);
    return () => clearTimeout(t);
  }, [target, duration, startDelay]);
  return count;
}

const MENU = [
  { key: "1", label: "Developer Profile",  id: "about"   },
  { key: "2", label: "Experience & Career", id: "career"  },
  { key: "3", label: "Projects",            id: "work"    },
  { key: "4", label: "Contact Options",     id: "contact" },
];

const LINES = [
  "Call connected. Welcome.",
  "You have reached the portfolio of",
  "VAIBHAVKUMAR YADAV,",
  "IVR Developer & Genesys Cloud Specialist.",
  "——",
  "Please select from the following options:",
];

const Landing = ({ children }: PropsWithChildren) => {
  const [visibleLines, setVisibleLines] = useState(0);
  const [showMenu, setShowMenu]         = useState(false);
  const [activeKey, setActiveKey]       = useState<string | null>(null);
  const identityRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const years   = useCounter(7,  1600, 1000);
  const certs   = useCounter(11, 1800, 1100);
  const awards  = useCounter(7,  1600, 1200);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (identityRef.current) identityRef.current.style.transform = `translateY(${y * 0.18}px)`;
      if (terminalRef.current) terminalRef.current.style.transform = `translateY(${y * 0.1}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (visibleLines >= LINES.length) {
      const t = setTimeout(() => setShowMenu(true), 400);
      return () => clearTimeout(t);
    }
    const delay = visibleLines === 0 ? 600 : visibleLines < 4 ? 500 : 200;
    const t = setTimeout(() => setVisibleLines((v) => v + 1), delay);
    return () => clearTimeout(t);
  }, [visibleLines]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleKey = (key: string, id: string) => {
    setActiveKey(key);
    setTimeout(() => { setActiveKey(null); scrollTo(id); }, 220);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const item = MENU.find((m) => m.key === e.key);
      if (item) handleKey(item.key, item.id);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <section className="landing-section ivr-grid-bg" id="landing">
      <div className="landing-glow" />

      <div className="landing-inner">
        {/* LEFT: name display */}
        <div ref={identityRef} className="landing-identity">
          <div className="landing-id-label">DEVELOPER ID</div>
          <h1 className="landing-name">
            <span>VAIBHAV</span>
            <span>KUMAR</span>
            <span>YADAV</span>
          </h1>
          <div className="landing-badges">
            <span className="landing-badge float-bob float-bob-delay1">IVR DEVELOPER</span>
            <span className="landing-badge accent float-bob float-bob-delay2">GENESYS CLOUD SME</span>
          </div>
          <div className="landing-stats">
            <div className="lstat">
              <span className="lstat-n">{years}<span className="lstat-plus">+</span></span>
              <span className="lstat-l">Years</span>
            </div>
            <div className="lstat-sep" />
            <div className="lstat">
              <span className="lstat-n">{certs}</span>
              <span className="lstat-l">Certs</span>
            </div>
            <div className="lstat-sep" />
            <div className="lstat">
              <span className="lstat-n">{awards}</span>
              <span className="lstat-l">Awards</span>
            </div>
          </div>
        </div>

        {/* RIGHT: IVR terminal */}
        <div className="landing-terminal-wrap float-bob-slow">
          <div ref={terminalRef} className="landing-terminal">
            <div className="terminal-topbar">
              <span className="terminal-dot td1" />
              <span className="terminal-dot td2" />
              <span className="terminal-dot td3" />
              <span className="terminal-title">VKY · IVR SESSION</span>
            </div>
            <div className="terminal-body">
              {LINES.slice(0, visibleLines).map((line, i) => (
                <div
                  key={i}
                  className={`terminal-line${line === "——" ? " terminal-divider" : i >= 1 && i <= 3 ? " terminal-highlight" : ""}`}
                >
                  {line === "——" ? <span className="terminal-dash-line" /> : (
                    <>
                      {i === 0 && <span className="terminal-prompt">&gt; </span>}
                      {line}
                      {i === visibleLines - 1 && visibleLines < LINES.length && (
                        <span className="terminal-cursor" />
                      )}
                    </>
                  )}
                </div>
              ))}

              {showMenu && (
                <div className="terminal-menu">
                  {MENU.map((item) => (
                    <button
                      type="button"
                      key={item.key}
                      className={`terminal-menu-item${activeKey === item.key ? " tmenu-active" : ""}`}
                      onClick={() => handleKey(item.key, item.id)}
                    >
                      <span className="tmenu-key">[ {item.key} ]</span>
                      <span className="tmenu-label">{item.label}</span>
                      <span className="tmenu-arrow">›</span>
                    </button>
                  ))}
                  <div className="terminal-hint">Press key or click to navigate</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Character model (3D or fallback) */}
      <div className="character-model">{children}</div>
      <div className="character-rim" />

      <div className="landing-scroll">
        <span>scroll</span>
        <div className="scroll-line" />
      </div>
    </section>
  );
};

export default Landing;
