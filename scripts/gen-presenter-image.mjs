// Generate the presenter portrait with NVIDIA-hosted FLUX.1 (Black Forest Labs).
// Reads NVIDIA_IMAGE_API_KEY from the environment (.env) — never hardcode keys.
//
//   node scripts/gen-presenter-image.mjs            # auto-loads .env, flux.1-dev
//   node scripts/gen-presenter-image.mjs schnell    # faster, lower fidelity
//
// Output: public/intro/presenter.jpg  (source for the Hedra talking avatar;
// also used as the intro <video> poster).
//
// Note: the provided NVIDIA key exposes FLUX models, not stable-diffusion-3.5
// (that route 404s / isn't in the key's function list). FLUX.1 is photorealistic
// and a strong replacement.

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

try { process.loadEnvFile?.(resolve(dirname(fileURLToPath(import.meta.url)), '../.env')); } catch { /* optional */ }

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'public/intro/presenter.jpg');

const KEY = process.env.NVIDIA_IMAGE_API_KEY;
if (!KEY) { console.error('Missing NVIDIA_IMAGE_API_KEY (set it in .env)'); process.exit(1); }

const MODELS = {
  dev: { id: '0c474133-6fd2-42f6-be29-8ebbbaeaaeb2', steps: 50, cfg: 3.5 },
  schnell: { id: '105fe02c-924b-4dfa-9797-92d89c3936ad', steps: 4, cfg: 0 },
};
const pick = process.argv[2] === 'schnell' ? 'schnell' : 'dev';
const M = MODELS[pick];

const PROMPT = `Photorealistic cinematic portrait of a friendly south-asian software
developer, late 20s, seated at a modern home workspace, wearing a black call-center
headset with boom mic, slim glasses, dark hoodie. Dual monitors with teal code glow
behind, warm orange desk lamp, small plant, night city window with bokeh. Facing
camera, upper body, calm neutral expression, soft teal-and-orange rim light, shallow
depth of field, dark moody background, high detail, 4k.`;

const H = { Authorization: `Bearer ${KEY}`, Accept: 'application/json', 'Content-Type': 'application/json' };

async function invoke(id, body) {
  let res = await fetch(`https://api.nvcf.nvidia.com/v2/nvcf/pexec/functions/${id}`, {
    method: 'POST', headers: H, body: JSON.stringify(body),
  });
  let guard = 0;
  while (res.status === 202 && guard++ < 30) {
    const reqId = res.headers.get('nvcf-reqid');
    await new Promise((r) => setTimeout(r, 2000));
    res = await fetch(`https://api.nvcf.nvidia.com/v2/nvcf/pexec/status/${reqId}`, { headers: H });
  }
  return res;
}

console.log(`Generating presenter with FLUX.1-${pick} ...`);
const body = { prompt: PROMPT, width: 1024, height: 1024, seed: 7, steps: M.steps };
if (M.cfg) body.cfg_scale = M.cfg;

const res = await invoke(M.id, body);
const text = await res.text();
if (!res.ok) { console.error(`HTTP ${res.status}: ${text.slice(0, 300)}`); process.exit(2); }

let json;
try { json = JSON.parse(text); } catch { console.error('Bad JSON'); process.exit(2); }
const b64 = json.artifacts?.find((a) => a.base64)?.base64 ?? json.image;
if (!b64) { console.error('No image:', text.slice(0, 200)); process.exit(2); }

await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, Buffer.from(b64, 'base64'));
console.log(`OK → ${OUT}`);
