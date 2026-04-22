import { useState, useEffect } from "react";
import { useLoading } from "../context/LoadingContext";
import "./styles/Navbar.css";

const Navbar = () => {
  const { isLoading } = useLoading();
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (isLoading) return;
    const iv = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(iv);
  }, [isLoading]);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header>
      <div className="nav-status">
        <span className="nav-dot" />
        <div className="nav-waveform">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="nav-wave-bar" style={{ animationDelay: `${i * 0.12}s` }} />
          ))}
        </div>
        <span className="nav-connected">CONNECTED</span>
        <span className="nav-timer">{fmt(seconds)}</span>
      </div>

      <div className="nav-logo">VKY</div>

      <nav>
        <button type="button" className="nav-link" onClick={() => scrollTo("about")}>
          <span className="nav-key">[01]</span>PROFILE
        </button>
        <button type="button" className="nav-link" onClick={() => scrollTo("career")}>
          <span className="nav-key">[02]</span>CAREER
        </button>
        <button type="button" className="nav-link" onClick={() => scrollTo("work")}>
          <span className="nav-key">[03]</span>PROJECTS
        </button>
        <button type="button" className="nav-link" onClick={() => scrollTo("contact")}>
          <span className="nav-key">[04]</span>CONTACT
        </button>
      </nav>

      <div className="nav-fade" />
    </header>
  );
};

export default Navbar;
