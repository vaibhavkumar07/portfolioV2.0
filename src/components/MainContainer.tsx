import { useState, useEffect, lazy, Suspense, type ReactNode } from "react";
import Navbar from "./Navbar";
import Landing from "./Landing";
import About from "./About";
import WhatIDo from "./WhatIDo";
import Career from "./Career";
import Work from "./Work";
import Contact from "./Contact";
import Cursor from "./Cursor";
import SocialIcons from "./SocialIcons";
import Loading from "./Loading";
import Marquee from "./Marquee";
import { ErrorBoundary } from "./ErrorBoundary";
import { useLoading } from "../context/LoadingContext";
import { setSplitText } from "./utils/splitText";

const TechStack = lazy(() =>
  import("./TechStack").catch(() => ({ default: () => <></> }))
);

interface Props {
  children: ReactNode;
}

const MainContainer = ({ children }: Props) => {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);
  const { isLoading } = useLoading();

  useEffect(() => {
    const onResize = () => {
      setIsDesktop(window.innerWidth > 1024);
      setSplitText();
    };
    window.addEventListener("resize", onResize);
    if (!isLoading) setSplitText();
    return () => window.removeEventListener("resize", onResize);
  }, [isLoading]);

  return (
    <>
      {isLoading && <Loading />}
      <main>
        <Cursor />
        <Navbar />
        <SocialIcons />
        <Landing>{children}</Landing>
        <div className="divider-glow" />
        <Marquee />
        <About />
        <WhatIDo />
        <div className="divider-glow" />
        <Marquee reverse />
        <Career />
        {isDesktop && (
          <ErrorBoundary fallback={null}>
            <Suspense fallback={<div style={{ height: "60vh" }} />}>
              <TechStack />
            </Suspense>
          </ErrorBoundary>
        )}
        <Work />
        <Contact />
      </main>
    </>
  );
};

export default MainContainer;
