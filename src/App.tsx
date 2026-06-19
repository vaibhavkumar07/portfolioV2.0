import { AnimatePresence, motion } from 'framer-motion';
import { lazy, Suspense } from 'react';
import { useCallStateMachine } from './hooks/useCallState';
import Background from './components/Background';
import Splash from './components/Splash';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Work from './components/Work';
import Skills from './components/Skills';
import Contact from './components/Contact';
import './index.css';

const IntroPresenter = lazy(() => import('./components/Intro'));

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function App() {
  const { state, elapsed, accept, finishIntro, end } = useCallStateMachine();

  // Sections are mounted during the intro too, so the presenter can scroll/reveal them.
  const showMain = state === 'intro' || state === 'active';

  return (
    <>
      <Background />

      <AnimatePresence>
        {state === 'ringing' && (
          <Splash key="splash" onAccept={accept} onDecline={end} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMain && (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{ position: 'relative', zIndex: 1 }}
          >
            {state === 'active' && <Navbar elapsed={elapsed} onEnd={end} onNav={scrollTo} />}
            <main>
              <Hero />
              <About />
              <Work />
              <Skills />
              <Contact onEnd={end} />
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      <Suspense fallback={null}>
        <AnimatePresence>
          {state === 'intro' && (
            <IntroPresenter key="intro" onFinish={finishIntro} />
          )}
        </AnimatePresence>
      </Suspense>

      <AnimatePresence>
        {state === 'ended' && (
          <motion.div
            key="ended"
            className="ended-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 20 }}
              className="ended-card"
            >
              <div className="ended-icon" />
              <h2 className="ended-title">CALL ENDED</h2>
              <p className="ended-duration">Duration: {String(Math.floor(elapsed / 60)).padStart(2,'0')}:{String(elapsed % 60).padStart(2,'0')}</p>
              <p className="ended-msg">Thank you for connecting. Looking forward to speaking with you.</p>
              <button type="button" className="ended-redial" onClick={accept}>
                REDIAL
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
