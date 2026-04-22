import type { Project, CareerItem } from "../types";

export const projects: Project[] = [
  {
    title: "Contact Center Modernization",
    category: "Leading Healthcare Organization · Feb 2023 – Present",
    tools: "Genesys Cloud CX · AI Studio · Azure TTS/STT · OpenAI · Dialogflow · Moveworks · Observe.AI · Power Automate",
    image: "/images/project-healthcare.svg",
    link: "#",
  },
  {
    title: "Genesys Configuration Tool",
    category: "German Multinational Automotive Corp · Jun – Dec 2021",
    tools: "Java · Spring Boot · Genesys Cloud SDK · React JS · GCP · Docker · CI/CD Infosys IDP · JUnit + Mockito",
    image: "/images/project-config.svg",
    link: "#",
  },
  {
    title: "API Integration Framework",
    category: "German Multinational Automotive Corp · May 2022 – Jan 2023",
    tools: "Java · Spring Boot · MySQL · MongoDB · SOAP · REST APIs · JUnit + Mockito",
    image: "/images/project-api.svg",
    link: "#",
  },
  {
    title: "CDA Lab — Voice Bot & Chatbot",
    category: "American Leading IT & Networking Provider · Jan – Apr 2022",
    tools: "Google Dialogflow · ASR/TTS · WhatsApp & Facebook · React JS SPA · Cisco PCCE · VAV",
    image: "/images/project-voicebot.svg",
    link: "#",
  },
  {
    title: "Reliance Retail — AJIO",
    category: "Indian Fashion & Electronics Retail · Nov 2018 – May 2021",
    tools: "Java · Microservices · Oracle DB · Python · Cron Automation · IBM Sterling",
    image: "/images/project-retail.svg",
    link: "#",
  },
];

export const career: CareerItem[] = [
  {
    role: "Package Consultant 2 — Genesys Cloud SME",
    company: "Infosys Limited",
    period: "OCT 2025 – PRESENT",
    description:
      "Serve as Subject Matter Expert in Genesys Cloud CX, leading design and development of intelligent IVR, chatbot, and omnichannel solutions for a leading healthcare organization. Architect complex call flows, bot flows, and digital workflows using Genesys Cloud Architect, AI Studio, and SDK. Richardson, TX, USA.",
  },
  {
    role: "Consultant — Contact Center Modernization Lead",
    company: "Infosys Limited",
    period: "FEB 2023 – SEP 2025",
    description:
      "Led contact center modernization for Healthcare domain. Integrated Azure Cognitive Services (TTS/STT), OpenAI/ChatGPT for journey summaries and personalized IVR, Moveworks, Observe.AI, and CRM systems. Implemented predictive routing, AI scoring, and Power Automate workflows. USA.",
  },
  {
    role: "Technology Analyst — Genesys & API Developer",
    company: "Infosys Limited",
    period: "JUN 2021 – JAN 2023",
    description:
      "Built full-lifecycle Genesys configuration tool using Java, Spring Boot, and Genesys Cloud SDK deployed on GCP. Developed enterprise API Integration Framework; integrated Google Dialogflow voicebots with WhatsApp, Facebook, and Webex SDK. Pune, India.",
  },
  {
    role: "Senior System Engineer & System Engineer",
    company: "Infosys Limited",
    period: "NOV 2018 – MAY 2021",
    description:
      "Developed health monitoring tools, automated cron jobs, and dashboards for Reliance Retail (AJIO) using Java, Spring Boot, Microservices, Oracle DB, Python, and IBM Sterling. E-Commerce domain. Bengaluru, India.",
  },
];

export const techStack = [
  { name: "Genesys Cloud", image: "/images/tech/genesys.svg" },
  { name: "Architect", image: "/images/tech/architect.svg" },
  { name: "Azure TTS/STT", image: "/images/tech/azure.svg" },
  { name: "OpenAI", image: "/images/tech/openai.svg" },
  { name: "Dialogflow", image: "/images/tech/dialogflow.svg" },
  { name: "Java / Spring", image: "/images/tech/java.svg" },
  { name: "Python", image: "/images/tech/python.svg" },
  { name: "React JS", image: "/images/tech/react.svg" },
];

export const socials = {
  linkedin: "https://www.linkedin.com/in/vaibhavkumar-yadav-633552233",
  github: "https://github.com/vaibhavkumar07",
  email: "yadavvaibhavkumar7@gmail.com",
};

export const stats = {
  years: 7,
  certifications: 11,
  awards: 7,
  projects: 5,
};
