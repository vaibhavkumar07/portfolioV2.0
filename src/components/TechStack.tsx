import { useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { Physics, useSphere, usePlane } from "@react-three/cannon";
import * as THREE from "three";
import { techStack } from "../data";
import { useScrollReveal } from "../hooks/useScrollReveal";
import "./styles/TechStack.css";

const imageUrls = techStack.map((t) => t.image);

function Plane() {
  const [ref] = usePlane<THREE.Mesh>(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -6, 0],
  }));
  return (
    <mesh ref={ref} visible={false}>
      <planeGeometry args={[50, 50]} />
    </mesh>
  );
}

function Pointer() {
  const [ref, api] = useSphere<THREE.Mesh>(() => ({
    type: "Kinematic",
    args: [2],
    position: [0, 0, 0],
  }));

  useFrame(({ mouse, viewport }) => {
    api.position.set(
      (mouse.x * viewport.width) / 2,
      (mouse.y * viewport.height) / 2,
      0
    );
  });

  return (
    <mesh ref={ref} visible={false}>
      <sphereGeometry args={[2, 8, 8]} />
    </mesh>
  );
}

interface SphereGeoProps {
  imageUrl: string;
  position: [number, number, number];
  scale: number;
}

function SphereGeo({ imageUrl, position, scale }: SphereGeoProps) {
  const texture = useTexture(imageUrl);
  const [ref] = useSphere<THREE.Mesh>(() => ({
    mass: 1,
    args: [scale],
    position,
    linearDamping: 0.5,
  }));

  return (
    <mesh ref={ref} scale={scale}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial map={texture} roughness={0.3} metalness={0.1} />
    </mesh>
  );
}

function Scene() {
  const { viewport } = useThree();
  const spread = Math.min(viewport.width * 0.4, 5);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} color="#ff6030" />
      <directionalLight position={[-5, -5, -5]} intensity={0.4} color="#0084d6" />
      <Physics gravity={[0, -9.8, 0]}>
        <Plane />
        <Pointer />
        {Array.from({ length: 30 }).map((_, i) => {
          const idx = i % imageUrls.length;
          const scale = 0.7 + Math.random() * 0.3;
          return (
            <SphereGeo
              key={i}
              imageUrl={imageUrls[idx]}
              position={[
                (Math.random() - 0.5) * spread * 2,
                Math.random() * 8 + 2,
                (Math.random() - 0.5) * 4,
              ]}
              scale={scale}
            />
          );
        })}
      </Physics>
    </>
  );
}

const TechStack = () => {
  const [active, setActive] = useState(false);
  const sectionRef = useScrollReveal<HTMLElement>(0.08);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setActive(true); },
      { threshold: 0.3 }
    );
    const el = document.getElementById("tech");
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="tech-section section-container scene-reveal" id="tech">
      <div className="ivr-section-header">
        <span className="ivr-section-title">TECH ARSENAL</span>
        <span className="ivr-section-line" />
      </div>
      <p className="ivr-prompt tech-prompt">Loading technology stack...</p>
      <div className="tech-canvas-wrap">
        {active && (
          <Canvas
            camera={{ position: [0, 0, 14], fov: 45 }}
            gl={{ alpha: true, antialias: true }}
          >
            <Scene />
          </Canvas>
        )}
      </div>
      <div className="tech-labels">
        {techStack.map((t) => (
          <span key={t.name} className="tech-label">{t.name}</span>
        ))}
      </div>
    </section>
  );
};

export default TechStack;
