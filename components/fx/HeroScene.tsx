"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import type { Group } from "three";

/**
 * IVR flow-node constellation: glowing call-flow nodes joined by faint edges,
 * echoing the Playground flow builder. Slow drift + subtle pointer parallax.
 * Loaded lazily (ssr: false) and only on fine-pointer desktop without
 * reduced motion — see Hero3D.tsx for the gate and the CSS fallback.
 */

const NODES: { pos: [number, number, number]; color: string; size: number }[] = [
  { pos: [0, 0, 0], color: "#ff4f1f", size: 0.16 },
  { pos: [-1.7, 0.9, -0.4], color: "#0ea5e9", size: 0.11 },
  { pos: [1.5, 1.15, -0.6], color: "#0ea5e9", size: 0.1 },
  { pos: [1.85, -0.75, -0.2], color: "#22c55e", size: 0.09 },
  { pos: [-1.95, -0.85, -0.5], color: "#0ea5e9", size: 0.1 },
  { pos: [0.4, 1.85, -0.9], color: "#ff4f1f", size: 0.08 },
  { pos: [-0.6, -1.75, -0.7], color: "#0ea5e9", size: 0.08 },
];

const LINKS: [number, number][] = [
  [0, 1], [0, 2], [0, 3], [0, 4], [1, 5], [2, 5], [4, 6], [3, 6],
];

function Constellation() {
  const group = useRef<Group>(null);
  const pointer = useRef({ x: 0, y: 0 });

  // The canvas sits in a pointer-events-none layer, so R3F never receives
  // pointer events — track the window cursor instead.
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame((state, delta) => {
    if (!group.current) return;
    const g = group.current;
    g.rotation.y += delta * 0.08;
    g.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.08;
    g.rotation.x += (pointer.current.y * 0.12 - g.rotation.x) * 0.04;
    g.rotation.z += (pointer.current.x * -0.06 - g.rotation.z) * 0.04;
  });

  return (
    <group ref={group}>
      {LINKS.map(([a, b], i) => (
        <Line
          key={i}
          points={[NODES[a].pos, NODES[b].pos]}
          color="#3a5a82"
          transparent
          opacity={0.35}
          lineWidth={1}
        />
      ))}
      {NODES.map((n, i) => (
        <mesh key={i} position={n.pos}>
          <sphereGeometry args={[n.size, 24, 24]} />
          <meshStandardMaterial
            color={n.color}
            emissive={n.color}
            emissiveIntensity={1.6}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
    >
      <ambientLight intensity={0.5} />
      <Constellation />
    </Canvas>
  );
}
