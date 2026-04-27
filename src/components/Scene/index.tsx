import { useMemo } from 'react';
import { motion } from 'framer-motion';

const NODES = [
  { x: 50,  y: 18,  color: '#0EA5E9', r: 5 },
  { x: 78,  y: 34,  color: '#FF4F1F', r: 4 },
  { x: 22,  y: 34,  color: '#0EA5E9', r: 4 },
  { x: 68,  y: 54,  color: '#00C853', r: 5 },
  { x: 32,  y: 54,  color: '#FF4F1F', r: 4 },
  { x: 85,  y: 72,  color: '#0EA5E9', r: 3 },
  { x: 15,  y: 72,  color: '#0EA5E9', r: 3 },
  { x: 57,  y: 78,  color: '#00C853', r: 4 },
  { x: 43,  y: 78,  color: '#FF4F1F', r: 4 },
  { x: 92,  y: 50,  color: '#0EA5E9', r: 3 },
  { x:  8,  y: 50,  color: '#0EA5E9', r: 3 },
  { x: 50,  y: 50,  color: '#FF4F1F', r: 6 },
];

const EDGES = [
  [0,1],[0,2],[0,11],[1,3],[2,4],[3,5],[4,6],[3,7],
  [4,8],[5,9],[6,10],[7,8],[1,9],[11,3],[11,4],[11,7],[11,8],
];

export default function Scene() {
  const pulseD = useMemo(() => NODES.map((_, i) => `${2.4 + i * 0.22}s`), []);
  const floatD = useMemo(() => NODES.map((_, i) => `${3.0 + i * 0.28}s`), []);
  const begins  = useMemo(() => NODES.map((_, i) => `${i * 0.18}s`), []);

  return (
    <motion.div
      style={{ width: '100%', height: '100%', perspective: 600 }}
      animate={{ rotateY: [0, 7, 0, -7, 0] }}
      transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        style={{ display: 'block', overflow: 'visible' }}
      >
        <defs>
          <filter id="sc-glow-b" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="sc-glow-o" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Edges */}
        {EDGES.map(([a, b], i) => (
          <line
            key={i}
            x1={NODES[a].x} y1={NODES[a].y}
            x2={NODES[b].x} y2={NODES[b].y}
            stroke="rgba(14,165,233,0.22)"
            strokeWidth="0.45"
          />
        ))}

        {/* Nodes */}
        {NODES.map((n, i) => (
          <g key={i}>
            {/* Pulse ring */}
            <circle cx={n.x} cy={n.y} r={n.r} fill="none" stroke={n.color} strokeWidth="0.4" opacity="0">
              <animate attributeName="r"       values={`${n.r};${n.r + 6};${n.r}`}   dur={pulseD[i]} repeatCount="indefinite" begin={begins[i]} />
              <animate attributeName="opacity" values="0.4;0;0.4"                     dur={pulseD[i]} repeatCount="indefinite" begin={begins[i]} />
            </circle>

            {/* Node core */}
            <circle
              cx={n.x} cy={n.y} r={n.r}
              fill={n.color}
              opacity="0.88"
              filter={n.color === '#0EA5E9' ? 'url(#sc-glow-b)' : 'url(#sc-glow-o)'}
            >
              <animate attributeName="cy"      values={`${n.y};${n.y-1.8};${n.y}`}   dur={floatD[i]} repeatCount="indefinite" begin={begins[i]} />
              <animate attributeName="opacity" values="0.88;1;0.88"                   dur={pulseD[i]} repeatCount="indefinite" begin={begins[i]} />
            </circle>
          </g>
        ))}
      </svg>
    </motion.div>
  );
}
