import type { Project } from './types';

export const projects: Project[] = [
  {
    id: '001',
    title: 'Cloud Contact Center Modernization',
    category: 'Healthcare · Genesys Cloud CX · AI',
    tools: 'Genesys Architect · AI Studio · Azure TTS/STT · OpenAI · Moveworks · Observe.AI · Power Automate',
    description: 'Designed IVR and chat workflows using Genesys Cloud CX, AI Studio, and SDK for a leading healthcare organization. Implemented OpenAI/ChatGPT for journey summaries, personalized IVR, and real-time agent-assist. Delivered predictive routing, AI scoring, post-call surveys, and PII/PHI/PCI-compliant workflows.',
    link: '#',
  },
  {
    id: '002',
    title: 'Genesys Configuration Tool',
    category: 'Automotive · Genesys Cloud SDK · Java',
    tools: 'Java · Spring Boot · Genesys Cloud SDK · React JS · GCP · Docker · Infosys IDP CI/CD',
    description: 'Built a full-lifecycle Genesys configuration management tool for a German multinational automotive corporation. Deployed on GCP with Docker and CI/CD on Infosys IDP — enabling automated provisioning and management of Genesys Cloud resources.',
    link: '#',
  },
  {
    id: '003',
    title: 'API Integration Framework',
    category: 'Automotive · Java · Spring Boot',
    tools: 'Java · Spring Boot · MySQL · MongoDB · SOAP · REST APIs · OAuth2',
    description: 'Developed an enterprise API Integration Framework in Java and Spring Boot for a German multinational automotive corporation. Configured MySQL, MongoDB, and SOAP services for seamless enterprise data exchange across systems.',
    link: '#',
  },
  {
    id: '004',
    title: 'CDA Lab — Voice Bot & Chatbot',
    category: 'Networking · Dialogflow · Cisco PCCE',
    tools: 'Google Dialogflow · ASR/TTS · Cisco PCCE · VAV · WhatsApp · Facebook · Webex SDK',
    description: 'Built conversational IVR and chatbot using Google Dialogflow with ASR/TTS for a leading American IT and networking provider. Integrated with WhatsApp, Facebook Messenger, and Webex SDK via Cisco PCCE and VAV for omnichannel self-service.',
    link: '#',
  },
  {
    id: '005',
    title: 'Reliance Retail — Digital & AJIO',
    category: 'E-Commerce · Java · IBM Sterling',
    tools: 'Java · Spring Boot · Microservices · Oracle DB · Python · IBM Sterling · Cron Automation',
    description: 'Developed health monitoring tools, automated cron jobs, and dashboards for India\'s leading electronics and fashion retail platform (Reliance Digital & AJIO). Built using Java, Spring Boot, Microservices, Oracle DB, Python, and IBM Sterling.',
    link: '#',
  },
];
