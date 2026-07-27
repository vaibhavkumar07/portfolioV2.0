"use client";

/* eslint-disable react-hooks/immutability --
 * three.js is an imperative scene graph: morph influences and bone rotations
 * are mutated per-frame inside useFrame. That's the idiomatic R3F pattern;
 * the React Compiler rule can't model it. */

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import type { Group, Mesh, Object3D } from "three";

const AVATAR_URL = "/avatar.glb";

type MorphMesh = Mesh & {
  morphTargetDictionary: Record<string, number>;
  morphTargetInfluences: number[];
};

export type AvatarFraming = "bust" | "chest";

const FRAMING: Record<AvatarFraming, { pos: [number, number, number]; target: [number, number, number]; fov: number }> = {
  // Head-and-shoulders. Model is ~1.75m tall with the head centred near 1.6.
  bust: { pos: [0, 1.58, 0.92], target: [0, 1.54, 0], fov: 30 },
  chest: { pos: [0, 1.56, 0.98], target: [0, 1.52, 0], fov: 30 },
};

function CameraRig({ framing }: { framing: AvatarFraming }) {
  const camera = useThree((s) => s.camera);
  const f = FRAMING[framing];
  camera.position.set(...f.pos);
  camera.lookAt(...f.target);
  return null;
}

/**
 * Talking avatar. Lip-sync is amplitude-driven: an AnalyserNode wired to the
 * agent's TTS <audio> element is sampled every frame and its RMS drives the
 * jaw/mouth morphs, so the mouth moves in time with the real voice. Blinking
 * and idle head motion keep him alive between answers.
 *
 * Under prefers-reduced-motion the lip-sync stays (it carries meaning — the
 * agent is speaking) but the decorative sway and blink stop.
 */
function Avatar({
  analyserRef,
  reduce,
}: {
  analyserRef?: React.RefObject<AnalyserNode | null>;
  reduce?: boolean;
}) {
  const { scene } = useGLTF(AVATAR_URL);
  // Skinned + morphed meshes can't be mounted in two canvases at once
  // (hero teaser + takeover), so clone per instance. Geometry stays shared.
  const cloned = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const group = useRef<Group>(null);
  const buf = useMemo(() => new Uint8Array(128), []);
  const level = useRef(0);
  const blink = useRef({ next: 2.5, phase: 0 });

  const parts = useMemo(() => {
    const morphs: MorphMesh[] = [];
    let head: Object3D | null = null;
    cloned.traverse((o) => {
      const m = o as MorphMesh;
      if (m.morphTargetDictionary && m.morphTargetInfluences) morphs.push(m);
      if (o.name === "Head") head = o;
    });
    return { morphs, head: head as Object3D | null };
  }, [cloned]);

  const setMorph = (name: string, v: number) => {
    for (const m of parts.morphs) {
      const i = m.morphTargetDictionary[name];
      if (i !== undefined) m.morphTargetInfluences[i] = v;
    }
  };

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // ── Lip-sync: RMS of the live TTS audio → mouth morphs ──
    let target = 0;
    const an = analyserRef?.current;
    if (an) {
      an.getByteTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i++) {
        const d = (buf[i] - 128) / 128;
        sum += d * d;
      }
      target = Math.min(1, Math.sqrt(sum / buf.length) * 4.5);
    }
    level.current += (target - level.current) * Math.min(1, delta * 14);
    const v = level.current;
    setMorph("jawOpen", v * 0.5);
    setMorph("mouthOpen", v * 0.45);
    setMorph("viseme_aa", v * 0.4);
    // Resting friendly expression, opens slightly while speaking
    setMorph("mouthSmileLeft", 0.13 + v * 0.05);
    setMorph("mouthSmileRight", 0.13 + v * 0.05);

    if (reduce) return;

    // ── Blink ──
    const b = blink.current;
    if (b.phase === 0 && t > b.next) {
      b.phase = 0.0001;
      b.next = t + 2.5 + Math.random() * 3.5;
    }
    if (b.phase > 0) {
      b.phase += delta;
      const k = Math.sin(Math.min(b.phase / 0.16, 1) * Math.PI);
      setMorph("eyeBlinkLeft", k);
      setMorph("eyeBlinkRight", k);
      if (b.phase > 0.16) b.phase = 0;
    }

    // ── Idle head motion + pointer tracking + breathing ──
    if (parts.head) {
      parts.head.rotation.y = Math.sin(t * 0.35) * 0.06 + state.pointer.x * 0.14;
      parts.head.rotation.x = Math.sin(t * 0.6) * 0.02 - state.pointer.y * 0.07;
      parts.head.rotation.z = Math.sin(t * 0.22) * 0.015;
    }
    if (group.current) group.current.position.y = Math.sin(t * 0.9) * 0.005;
  });

  return (
    <group ref={group}>
      <primitive object={cloned} />
    </group>
  );
}

export default function AvatarScene({
  analyserRef,
  framing = "bust",
  reduce = false,
  rimA = "#22d3ee",
  rimB = "#a78bfa",
  keyIntensity = 2.2,
}: {
  analyserRef?: React.RefObject<AnalyserNode | null>;
  framing?: AvatarFraming;
  reduce?: boolean;
  /** Rim light from the left — usually the palette's primary accent. */
  rimA?: string;
  /** Rim light from the right — usually the palette's secondary accent. */
  rimB?: string;
  keyIntensity?: number;
}) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      camera={{ position: FRAMING[framing].pos, fov: FRAMING[framing].fov }}
    >
      <CameraRig framing={framing} />
      <ambientLight intensity={0.85} />
      <directionalLight position={[1.5, 2.5, 2]} intensity={keyIntensity} />
      <pointLight position={[-1.2, 1.7, 0.4]} intensity={1.5} color={rimA} />
      <pointLight position={[1.2, 1.5, -0.3]} intensity={1.2} color={rimB} />
      <Suspense fallback={null}>
        <Avatar analyserRef={analyserRef} reduce={reduce} />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload(AVATAR_URL);
