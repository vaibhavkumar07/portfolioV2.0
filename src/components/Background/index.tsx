import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useMouseParallax } from '../../hooks/useParallax';
import './Background.css';

export default function Background() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const { x, y } = useMouseParallax();

  const layer1X = useTransform(x, [-1, 1], ['-3%', '3%']);
  const layer1Y = useTransform(y, [-1, 1], ['-3%', '3%']);
  const layer2X = useTransform(x, [-1, 1], ['-6%', '6%']);
  const layer2Y = useTransform(y, [-1, 1], ['-6%', '6%']);
  const layer3X = useTransform(x, [-1, 1], ['6%', '-6%']);
  const layer3Y = useTransform(y, [-1, 1], ['6%', '-6%']);

  const glowOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.4, 0.7, 0.5, 0.3]);

  return (
    <div ref={ref} className="bg-root" aria-hidden="true">
      {/* Deep base */}
      <div className="bg-base" />

      {/* Grid — moves with mouse slow */}
      <motion.div
        className="bg-grid"
        style={{ x: layer1X, y: layer1Y }}
      />

      {/* Orb 1 — Genesys orange, top-right */}
      <motion.div
        className="bg-orb bg-orb--orange"
        style={{ x: layer2X, y: layer2Y, opacity: glowOpacity }}
      />

      {/* Orb 2 — accent blue, bottom-left */}
      <motion.div
        className="bg-orb bg-orb--blue"
        style={{ x: layer3X, y: layer3Y, opacity: glowOpacity }}
      />

      {/* Network lines SVG layer */}
      <motion.div className="bg-network" style={{ x: layer1X, y: layer1Y }}>
        <svg width="100%" height="100%" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="node-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Network topology lines */}
          {[
            [120,180,480,320],[480,320,840,160],[840,160,1200,280],[1200,280,1380,420],
            [480,320,360,580],[840,160,720,400],[720,400,900,600],[360,580,600,720],
            [600,720,900,600],[900,600,1100,740],[1100,740,1300,620],[120,180,240,480],
            [240,480,360,580],[720,400,600,720],[1200,280,1100,500],[1100,500,1100,740],
          ].map(([x1,y1,x2,y2], i) => (
            <line
              key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="rgba(14,165,233,0.08)" strokeWidth="1"
            />
          ))}
          {/* Nodes */}
          {[
            [120,180],[480,320],[840,160],[1200,280],[360,580],[720,400],
            [900,600],[600,720],[1100,740],[1300,620],[240,480],[1100,500],[1380,420],
          ].map(([cx,cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="3" fill="rgba(14,165,233,0.4)" />
          ))}
        </svg>
      </motion.div>

      {/* Vignette */}
      <div className="bg-vignette" />

      {/* Animated scan line sweep */}
      <motion.div
        className="bg-sweep"
        animate={{ y: ['-100%', '200%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear', repeatDelay: 4 }}
      />
    </div>
  );
}
