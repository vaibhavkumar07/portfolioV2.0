export type CallState = 'ringing' | 'active' | 'ended';

export interface Project {
  id: string;
  title: string;
  category: string;
  tools: string;
  description: string;
  image?: string;
  link?: string;
}

export interface Skill {
  name: string;
  level: number;
  category: string;
}
