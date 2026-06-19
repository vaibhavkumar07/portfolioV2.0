// Generate the presenter portrait with Nano Banana (Gemini image model).
// Reads NANO_BANANA_API_KEY from the environment (.env) — never hardcode keys.
//
//   node --env-file=.env scripts/gen-presenter-image.mjs
//
// Output: public/intro/presenter.png  (feeds Hedra for the talking avatar,
// and is used as the intro avatar poster/fallback).

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Auto-load .env (gitignored) so `node scripts/gen-presenter-image.mjs` works
// without the --env-file flag. Node 20.6+.
try { process.loadEnvFile?.(resolve(dirname(fileURLToPath(import.meta.url)), '../.env')); } catch { /* optional */ }

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'public/intro/presenter.png');

const KEY = process.env.NANO_BANANA_API_KEY;
if (!KEY) {
  console.error('Missing NANO_BANANA_API_KEY (run with: node --env-file=.env ...)');
  process.exit(1);
}

const PROMPT = `Cinematic portrait of a friendly software developer seated at a modern
home workspace, wearing a black call-center headset with boom mic, slim glasses,
dark hoodie. Dual monitors with teal code glow behind, orange desk lamp, small
plant, night city window. Facing camera, upper body, neutral closed mouth, soft
teal-and-orange rim light, dark moody background. Photorealistic, high detail, 4k.`;

// Nano Banana = gemini-2.5-flash-image (fallback to a 3.x image model).
// Auth confirmed: x-goog-api-key header on v1beta.
const MODELS = ['gemini-2.5-flash-image', 'gemini-3.1-flash-image', 'gemini-3-pro-image'];

async function tryGen(model) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': KEY },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: PROMPT }] }],
      generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
    }),
  });
  const text = await res.text();
  if (!res.ok) return { ok: false, status: res.status, body: text.slice(0, 300) };
  let json;
  try { json = JSON.parse(text); } catch { return { ok: false, status: res.status, body: 'bad json' }; }
  const parts = json?.candidates?.[0]?.content?.parts ?? [];
  const img = parts.find((p) => p.inlineData?.data);
  if (!img) return { ok: false, status: res.status, body: 'no image: ' + text.slice(0, 200) };
  return { ok: true, data: img.inlineData.data };
}

let done = false;
for (const model of MODELS) {
  process.stdout.write(`Trying ${model} ... `);
  let r;
  try { r = await tryGen(model); } catch (e) { console.log('network error', e.message); continue; }
  if (r.ok) {
    await mkdir(dirname(OUT), { recursive: true });
    await writeFile(OUT, Buffer.from(r.data, 'base64'));
    console.log(`OK → ${OUT}`);
    done = true;
    break;
  }
  console.log(`HTTP ${r.status}: ${r.body}`);
}

if (!done) {
  console.error('\nAll attempts failed. The key may be invalid/expired or lack image access.');
  process.exit(2);
}
