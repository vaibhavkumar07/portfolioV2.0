/**
 * Knowledge base for the live portfolio agent. Small enough to context-stuff
 * (no vector DB). The system prompt grounds answers to real facts and keeps the
 * agent in character as Vaibhav's portfolio concierge.
 */

export const PROFILE = {
  name: "Vaibhavkumar Yadav",
  title: "Genesys Cloud IVR Developer & Contact-Center Voice-AI Engineer",
  role: "Package Consultant 2 — Genesys Cloud SME, Infosys Limited",
  location: "Richardson, Texas, USA",
  email: "yadavvaibhavkumar7@gmail.com",
  phone: "+1 945-542-0116",
  linkedin: "https://www.linkedin.com/in/vaibhavkumar-yadav-633552233/",
  experienceYears: "7+",
  availability: "Open to Genesys Cloud / contact-center voice-AI roles globally.",
};

export const HIGHLIGHTS = [
  "7+ years building enterprise IVR and contact-center solutions on Genesys Cloud CX.",
  "SME in Genesys Architect, AI Studio, Data Actions, and CX-as-Code (Terraform).",
  "Integrates Azure TTS/STT, OpenAI/ChatGPT, Google Dialogflow, Observe.AI, Moveworks.",
  "Delivered PII/PHI/PCI-compliant flows for healthcare and regulated industries.",
  "Holder of an IoT patent; 7 Infosys awards including Tech Maestro and RISE MVP.",
  "10 certifications (Infosys Contact Center suite, Applied Generative AI, eCornell AI Strategy).",
];

export const EXPERIENCE = [
  { period: "Oct 2025 – Present", role: "Package Consultant 2", org: "Infosys · United States", focus: "Genesys Cloud + Generative AI" },
  { period: "Jan 2025 – Sep 2025", role: "Consultant", org: "Infosys · United States", focus: "Genesys Cloud" },
  { period: "May 2023 – Dec 2024", role: "Technology Analyst", org: "Infosys · United States", focus: "Genesys Cloud" },
  { period: "Oct 2021 – Apr 2023", role: "Technology Analyst", org: "Infosys · Pune, India", focus: "Genesys Cloud" },
  { period: "Jul 2020 – Sep 2021", role: "Senior System Engineer", org: "Infosys · Bengaluru, India", focus: "Contact center" },
  { period: "May 2018 – Jun 2020", role: "System Engineer", org: "Infosys · Bengaluru, India", focus: "Enterprise dev" },
];

export const CERTS = [
  "Infosys Certified Contact Center Platform Professional",
  "Infosys Certified Contact Center Technology Components & Integrations Professional",
  "Infosys Certified Contact Center Professional",
  "Infosys Certified Applied Generative AI Professional",
  "Infosys Certified AI Consumer",
  "Infosys Certified IoT Professional",
  "Infosys Global Agile Developer Certification",
  "Infosys Certified Python Associate",
  "Infosys Certified Java SE8 Developer – 101",
  "AI Strategy Certification — eCornell",
];

/** Suggested questions surfaced in the UI. */
export const SUGGESTED = [
  "What do you actually build?",
  "Walk me through your healthcare IVR project.",
  "How do you use AI in contact centers?",
  "Are you available to hire?",
];

import { projects } from "./projects";
import { skills } from "./skills";

export function buildSystemPrompt(): string {
  const proj = projects
    .map((p) => `- ${p.title} (${p.category}). Tools: ${p.tools}. ${p.description}`)
    .join("\n");
  const skl = skills.map((s) => `${s.name} (${s.level}%)`).join(", ");
  return `You are the portfolio concierge for ${PROFILE.name}, a ${PROFILE.title} based in ${PROFILE.location}.
You answer recruiters, hiring managers, and peers on his behalf — confident, concrete, warm, never salesy. Speak in first person as Vaibhav ("I built…", "I led…").

RULES:
- Only use the facts below. If asked something not covered, say you'd be glad to discuss it directly and point to ${PROFILE.email}.
- Keep answers tight: 2–4 sentences unless asked to go deep. This is spoken aloud, so avoid markdown, lists, and code blocks.
- Stay on topic: his work, experience, projects, skills, availability. Politely deflect anything off-topic back to his work.
- When relevant, suggest the matching case study ("see the Cloud Contact Center Modernization case study").

FACTS
Role: ${PROFILE.role}. Experience: ${PROFILE.experienceYears} years. ${PROFILE.availability}
Contact: ${PROFILE.email}, ${PROFILE.phone}, LinkedIn ${PROFILE.linkedin}.
Highlights:
${HIGHLIGHTS.map((h) => "- " + h).join("\n")}
Skills: ${skl}
Projects:
${proj}
Certifications: ${CERTS.join("; ")}.`;
}
