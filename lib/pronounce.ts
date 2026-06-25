/**
 * Spell out domain acronyms so neural TTS says them as letters, not garbled
 * words. Spaced letters read reliably as letters ("I V R" → "eye vee arr").
 */
const MAP: Record<string, string> = {
  IVR: "I V R",
  CX: "C X",
  API: "A P I",
  APIs: "A P I's",
  SDK: "S D K",
  TTS: "T T S",
  STT: "S T T",
  PII: "P I I",
  PHI: "P H I",
  PCI: "P C I",
  GCP: "G C P",
  IoT: "I o T",
  CRM: "C R M",
  SQL: "sequel",
  CCaaS: "C C a a S",
  OAuth2: "O-Auth two",
  OAuth: "O-Auth",
  ASR: "A S R",
  AJIO: "A-jee-oh",
  Genesys: "Genesis",
};

export function pronounce(text: string): string {
  let out = text;
  for (const [k, v] of Object.entries(MAP)) {
    out = out.replace(new RegExp(`\\b${k}\\b`, "g"), v);
  }
  return out;
}
