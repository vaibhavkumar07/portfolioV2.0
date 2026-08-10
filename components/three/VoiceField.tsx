"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  particleFragment,
  particleVertex,
  portraitFragment,
  portraitVertex,
} from "./shaders";

const AVATAR_SRC = "/avatar-hero.jpg";
const CYAN = new THREE.Color("#4dd4e8");
const VIOLET = new THREE.Color("#9b8cf0");

/**
 * Per-frame state shared by the scene's parts, deliberately outside React.
 *
 * These values change every frame; routing them through props or state would
 * either re-render the tree 60×/second or trip the compiler's rule against
 * mutating props. The page mounts exactly one VoiceField, so a single instance
 * is correct — and a stale level self-corrects within a few frames anyway.
 */
const live = {
  level: 0,
  pointer: new THREE.Vector2(),
};

/**
 * Deterministic PRNG (mulberry32). The particle field must be identical on
 * every render and between server and client — Math.random() would reshuffle
 * the whole field on any re-render, and is impure inside a memo besides.
 */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Portrait({ reveal }: { reveal: number }) {
  const texture = useTexture(AVATAR_SRC);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();

  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uTime: { value: 0 },
      uLevel: { value: 0 },
      uReveal: { value: 0 },
      uPointer: { value: new THREE.Vector2() },
      uTint: { value: CYAN },
    }),
    [texture],
  );

  useFrame((state) => {
    const u = mat.current?.uniforms;
    if (!u) return;
    u.uTime.value = state.clock.elapsedTime;
    u.uLevel.value = live.level;
    u.uReveal.value = reveal;
    u.uPointer.value.copy(live.pointer);
  });

  // The source is a 787x1400 portrait. Cover-fitting that to a landscape
  // viewport scales it until his face fills the screen and crops at the chin,
  // so the plane is fitted to viewport *height* and kept at its own aspect —
  // he stands in the scene as a figure, with room for the particles around him.
  const img = texture.image as { width: number; height: number } | undefined;
  const aspect = img ? img.width / img.height : 0.562;
  const height = viewport.height * 0.98;
  const width = height * aspect;

  // Offset right on wide screens so the statement owns the left half; centred
  // once there is no room for a two-column composition.
  const wide = viewport.width > viewport.height * 1.15;
  const x = wide ? viewport.width * 0.21 : 0;

  return (
    <mesh position={[x, 0, 0]}>
      <planeGeometry args={[width, height, 72, 128]} />
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={portraitVertex}
        fragmentShader={portraitFragment}
        transparent
      />
    </mesh>
  );
}

function VoiceParticles({ count = 3200 }: { count?: number }) {
  const mat = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const rings = new Float32Array(count);

    const rand = rng(0x5eed);
    for (let i = 0; i < count; i++) {
      // Points live on concentric rings around the portrait; the shader spins
      // them. Biasing toward the outside keeps the face unobstructed.
      const ring = 1.6 + Math.pow(rand(), 0.6) * 3.4;
      const a = rand() * Math.PI * 2;
      positions[i * 3] = Math.cos(a) * ring;
      positions[i * 3 + 1] = (rand() - 0.5) * 4.2;
      positions[i * 3 + 2] = Math.sin(a) * ring;
      seeds[i] = rand();
      rings[i] = ring;
    }

    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    g.setAttribute("aRing", new THREE.BufferAttribute(rings, 1));
    return g;
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uLevel: { value: 0 },
      uSize: { value: 2.4 },
      uPointer: { value: new THREE.Vector2() },
      uColorA: { value: CYAN },
      uColorB: { value: VIOLET },
    }),
    [],
  );

  useFrame((state) => {
    const u = mat.current?.uniforms;
    if (!u) return;
    u.uTime.value = state.clock.elapsedTime;
    u.uLevel.value = live.level;
    u.uPointer.value.copy(live.pointer);
  });

  return (
    <points geometry={geometry}>
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={particleVertex}
        fragmentShader={particleFragment}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/** Smooths the raw analyser reading and feeds it to both shaders. */
function LevelPump({
  analysers,
}: {
  analysers?: React.RefObject<AnalyserNode | null>[];
}) {
  const buf = useMemo(() => new Uint8Array(128), []);

  useFrame((_, delta) => {
    let target = 0;
    for (const ref of analysers ?? []) {
      const an = ref.current;
      if (!an) continue;
      an.getByteTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i++) {
        const d = (buf[i] - 128) / 128;
        sum += d * d;
      }
      target = Math.max(target, Math.min(1, Math.sqrt(sum / buf.length) * 4.5));
    }
    // Critically damped-ish follow: fast attack on speech, slow release, so
    // the field swells on a word and settles instead of strobing per frame.
    const k = target > live.level ? 14 : 5;
    live.level += (target - live.level) * Math.min(1, delta * k);
  });

  return null;
}

/**
 * The hero scene: the real likeness on a displaced, chromatically split plane,
 * inside a field of points that inflates on his actual voice.
 *
 * Everything reads from one mutable ref rather than React state — uniforms are
 * written inside useFrame, so a re-render per frame would be pure waste.
 */
export default function VoiceField({
  analysers,
  reveal = 0,
  reduce = false,
  className = "",
}: {
  analysers?: React.RefObject<AnalyserNode | null>[];
  /** 0 = solid, 1 = fully dissolved. Driven by scroll as the hero unpins. */
  reveal?: number;
  reduce?: boolean;
  className?: string;
}) {
  return (
    <div
      className={className}
      onPointerMove={(e) => {
        if (reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        live.pointer.set(
          ((e.clientX - r.left) / r.width) * 2 - 1,
          -(((e.clientY - r.top) / r.height) * 2 - 1),
        );
      }}
      onPointerLeave={() => live.pointer.set(0, 0)}
    >
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 42 }}
        dpr={[1, 1.75]}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        /* Only redraw when something is actually moving. On reduced-motion the
           scene renders once and then costs nothing. */
        frameloop={reduce ? "demand" : "always"}
      >
        <Suspense fallback={null}>
          <LevelPump analysers={analysers} />
          <Portrait reveal={reveal} />
          {!reduce && <VoiceParticles />}
        </Suspense>
      </Canvas>
    </div>
  );
}
