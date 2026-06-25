import { projects } from "./projects";
import { slug } from "./slug";

export interface CaseStudy {
  slug: string;
  id: string;
  title: string;
  category: string;
  stack: string[];
  summary: string;
  problem: string;
  approach: string[];
  impact: string[];
}

/** Structured case studies, grounded in the project data (no invented metrics). */
const DETAILS: Record<string, Omit<CaseStudy, "slug" | "id" | "title" | "category" | "stack">> = {
  "cloud-contact-center-modernization": {
    summary:
      "Re-architected a healthcare contact center on Genesys Cloud CX with generative-AI assist, while keeping every flow PII/PHI/PCI compliant.",
    problem:
      "A leading healthcare organization needed to modernize legacy IVR and chat into a single Genesys Cloud CX platform — adding AI-driven personalization and agent assist without compromising regulatory compliance.",
    approach: [
      "Designed IVR and chat workflows in Genesys Architect and AI Studio with the Genesys SDK.",
      "Integrated OpenAI/ChatGPT for call-journey summaries, personalized IVR, and real-time agent-assist.",
      "Built predictive routing, AI scoring, and post-call surveys with Power Automate.",
      "Enforced PII/PHI/PCI-compliant data handling across every Data Action and integration.",
    ],
    impact: [
      "Unified voice + chat self-service on one cloud platform.",
      "Real-time agent-assist and journey summaries cut handle complexity.",
      "Compliance maintained end-to-end for a regulated healthcare client.",
    ],
  },
  "genesys-configuration-tool": {
    summary:
      "A full-lifecycle configuration manager that automates provisioning of Genesys Cloud resources for a global automotive enterprise.",
    problem:
      "A German multinational automotive corporation managed Genesys Cloud resources manually — slow, error-prone, and hard to audit across environments.",
    approach: [
      "Built a Java/Spring Boot tool over the Genesys Cloud SDK with a React UI.",
      "Automated provisioning and lifecycle management of Genesys resources.",
      "Containerized with Docker, deployed on GCP, CI/CD on Infosys IDP.",
    ],
    impact: [
      "Automated, repeatable Genesys configuration across environments.",
      "Reduced manual provisioning effort and configuration drift.",
    ],
  },
  "api-integration-framework": {
    summary:
      "An enterprise API integration framework for seamless data exchange across heterogeneous automotive systems.",
    problem:
      "Disparate enterprise systems (SQL, NoSQL, SOAP) needed reliable, secured data exchange for a global automotive client.",
    approach: [
      "Developed the framework in Java and Spring Boot.",
      "Configured MySQL, MongoDB, and SOAP services with REST APIs and OAuth2.",
    ],
    impact: [
      "Seamless enterprise data exchange across systems.",
      "Secured, standardized integration surface.",
    ],
  },
  "cda-lab-voice-bot-chatbot": {
    summary:
      "An omnichannel conversational bot on Dialogflow + Cisco PCCE spanning voice, WhatsApp, Facebook, and Webex.",
    problem:
      "A leading American IT and networking provider wanted unified self-service across voice and messaging channels.",
    approach: [
      "Built conversational IVR and chatbot with Google Dialogflow (ASR/TTS).",
      "Integrated WhatsApp, Facebook Messenger, and Webex SDK via Cisco PCCE and VAV.",
    ],
    impact: [
      "Single conversational layer across voice and messaging channels.",
      "Omnichannel self-service reducing live-agent load.",
    ],
  },
  "reliance-retail-digital-ajio": {
    summary:
      "Health-monitoring tooling, automation, and dashboards for India's leading electronics and fashion retail platforms.",
    problem:
      "Reliance Digital & AJIO needed proactive monitoring and automation across a large microservices estate.",
    approach: [
      "Built health-monitoring tools, automated cron jobs, and dashboards.",
      "Java, Spring Boot, Microservices, Oracle DB, Python, IBM Sterling.",
    ],
    impact: [
      "Proactive visibility into platform health.",
      "Automated routine operations at retail scale.",
    ],
  },
};

export const caseStudies: CaseStudy[] = projects.map((p) => {
  const s = slug(p.title);
  const d = DETAILS[s];
  return {
    slug: s,
    id: p.id,
    title: p.title,
    category: p.category,
    stack: p.tools.split("·").map((t) => t.trim()),
    summary: d?.summary ?? p.description,
    problem: d?.problem ?? p.description,
    approach: d?.approach ?? [],
    impact: d?.impact ?? [],
  };
});

export const getCaseStudy = (s: string) => caseStudies.find((c) => c.slug === s);
