/**
 * GLSL for the hero. Kept as plain strings (no glslify, no loader) so the
 * bundle stays honest and the CSP needs no script-src change — these compile
 * on the GPU driver, they are never evaluated as JavaScript.
 *
 * Both programs read the same `uLevel` uniform: the live TTS amplitude the
 * console already computes. One number, driving every reaction on screen.
 */

/** Cheap 2D simplex-ish noise. Enough for organic drift; no texture lookup. */
const NOISE = /* glsl */ `
  vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865, 0.366025404, -0.577350269, 0.024390243);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m; m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }
`;

/* ── Portrait plane ────────────────────────────────────────────────────── */

export const portraitVertex = /* glsl */ `
  uniform float uTime;
  uniform float uLevel;
  uniform vec2 uPointer;
  varying vec2 vUv;
  varying float vWave;

  ${NOISE}

  void main() {
    vUv = uv;

    vec3 pos = position;

    // Speech pushes a travelling wave up the portrait. Amplitude is squared so
    // quiet passages stay still instead of shimmering constantly.
    float speech = uLevel * uLevel;
    float wave = sin(uv.y * 9.0 - uTime * 3.2) * 0.5 + 0.5;
    float drift = snoise(uv * 2.6 + uTime * 0.09);

    float displace = wave * speech * 0.22 + drift * 0.035;
    pos.z += displace;

    // Parallax: the plane tilts toward the pointer, so the portrait sits in
    // space rather than on the glass.
    pos.x += uPointer.x * 0.06 * (1.0 - uv.y * 0.35);
    pos.y += uPointer.y * 0.05;

    vWave = displace;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const portraitFragment = /* glsl */ `
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uLevel;
  uniform float uReveal;
  uniform vec3 uTint;
  varying vec2 vUv;
  varying float vWave;

  void main() {
    // Chromatic split scaled by speech — the channels separate when he talks.
    float split = 0.0016 + uLevel * 0.006 + abs(vWave) * 0.05;
    vec2 dir = vec2(1.0, 0.35);

    float r = texture2D(uTexture, vUv + dir * split).r;
    float g = texture2D(uTexture, vUv).g;
    float b = texture2D(uTexture, vUv - dir * split).b;
    vec3 col = vec3(r, g, b);

    // Scanline bloom that rides the displacement wave.
    col += uTint * smoothstep(0.02, 0.16, vWave) * (0.35 + uLevel * 0.9);

    // Vignette keeps the eye on the face and hides the plane's edges.
    vec2 c = vUv - 0.5;
    col *= smoothstep(0.85, 0.28, length(c));

    // Scroll-driven dissolve: the portrait breaks into its own scanlines as
    // the hero unpins, instead of merely fading out.
    float lines = fract(vUv.y * 140.0 + uTime * 0.4);
    float cut = step(uReveal, lines * 0.6 + vUv.y * 0.4);
    float alpha = mix(1.0, cut, step(0.001, uReveal));

    gl_FragColor = vec4(col, alpha);
  }
`;

/* ── Voice particle field ──────────────────────────────────────────────── */

export const particleVertex = /* glsl */ `
  uniform float uTime;
  uniform float uLevel;
  uniform float uSize;
  uniform vec2 uPointer;
  attribute float aSeed;
  attribute float aRing;
  varying float vGlow;

  ${NOISE}

  void main() {
    vec3 pos = position;

    // Each point orbits its ring. Speech widens the orbit and lifts the point,
    // so the field visibly inflates on his voice.
    float speech = uLevel * uLevel;
    float ang = uTime * (0.08 + aSeed * 0.12) + aSeed * 6.283;
    float radius = aRing * (1.0 + speech * 0.35);

    pos.x = cos(ang) * radius;
    pos.z = sin(ang) * radius;
    pos.y += sin(uTime * 1.4 + aSeed * 9.0) * (0.05 + speech * 0.5);
    pos += snoise(vec2(aSeed, uTime * 0.15)) * 0.08;

    pos.x += uPointer.x * 0.25;
    pos.y += uPointer.y * 0.18;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    // Perspective-correct sizing, plus a swell while speaking.
    gl_PointSize = uSize * (1.0 + speech * 1.8) * (14.0 / -mv.z);

    vGlow = speech * 0.8 + 0.2;
  }
`;

export const particleFragment = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vGlow;

  void main() {
    // Round, soft-edged points. Discarding outside the disc avoids the
    // square-sprite look that gives cheap particle fields away.
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;

    float falloff = smoothstep(0.5, 0.0, d);
    vec3 col = mix(uColorA, uColorB, vGlow);
    gl_FragColor = vec4(col, falloff * falloff * vGlow);
  }
`;
