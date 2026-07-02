import { PROFILE } from "./kb";

/**
 * Recruiter-facing FAQ. Single source for the visible FAQ section on the home
 * page AND the FAQPage JSON-LD — Google requires schema answers to match
 * on-page content, and answer engines (ChatGPT, Perplexity, AI Overviews)
 * quote it directly.
 */
export const FAQ: { q: string; a: string }[] = [
  {
    q: "Who is Vaibhavkumar Yadav?",
    a: `${PROFILE.name} is a ${PROFILE.title} with ${PROFILE.experienceYears} years of experience, currently ${PROFILE.role}, based in Richardson, Texas (Dallas–Fort Worth metro), USA.`,
  },
  {
    q: "What does Vaibhavkumar Yadav specialize in?",
    a: "Enterprise IVR and contact-center voice AI on Genesys Cloud CX — Architect flows, AI Studio, Data Actions, CX-as-Code (Terraform) — integrating Azure TTS/STT, OpenAI/ChatGPT, Google Dialogflow, and Observe.AI for healthcare, automotive, and e-commerce clients.",
  },
  {
    q: "Is Vaibhavkumar Yadav available for hire?",
    a: `Yes — ${PROFILE.availability} He is based in Richardson, TX and works with teams across the United States and globally (remote-friendly).`,
  },
  {
    q: "What are his flagship projects?",
    a: "Cloud Contact Center Modernization for a healthcare leader (Genesys Cloud CX + OpenAI agent-assist, PII/PHI/PCI-compliant), a full-lifecycle Genesys Configuration Tool for a German automotive corporation, an enterprise API Integration Framework, a Dialogflow voice/chat bot on Cisco PCCE, and platform tooling for Reliance Digital & AJIO.",
  },
  {
    q: "What certifications does he hold?",
    a: "10 certifications, including the Infosys Contact Center suite, Infosys Certified Applied Generative AI Professional, and the eCornell AI Strategy certification — plus an IoT patent and 7 Infosys awards.",
  },
  {
    q: "How can I contact Vaibhavkumar Yadav?",
    a: `Email ${PROFILE.email}, connect on LinkedIn, or talk to the live voice agent on this site — it answers questions about his work in his own voice.`,
  },
];
