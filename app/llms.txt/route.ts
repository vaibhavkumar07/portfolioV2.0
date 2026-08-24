import { PROFILE, HIGHLIGHTS, CERTS } from "@/lib/data/kb";
import { FAQ } from "@/lib/data/faq";
import { projects } from "@/lib/data/projects";
import { skills } from "@/lib/data/skills";
import { caseStudies } from "@/lib/data/work";
import { SITE } from "@/lib/site";

/**
 * /llms.txt — the emerging convention for describing a site to LLM crawlers
 * (llmstxt.org). Generated from the same data as the UI, so it never drifts.
 */
export const dynamic = "force-static";

export function GET() {
  const body = `# ${PROFILE.name} — Portfolio

> ${PROFILE.title}. ${PROFILE.experienceYears} years of experience. Based in Richardson, Texas (Dallas–Fort Worth metro), USA. ${PROFILE.availability}

Current role: ${PROFILE.role}.
Contact: ${PROFILE.email} · LinkedIn: ${PROFILE.linkedin}

## Highlights

${HIGHLIGHTS.map((h) => `- ${h}`).join("\n")}

## Projects

${projects.map((p) => `- ${p.title} (${p.category}): ${p.description}`).join("\n")}

## Case studies

${caseStudies.map((c) => `- [${c.title}](${SITE}/work/${c.slug}): ${c.summary}`).join("\n")}

## Skills

${skills.map((s) => `${s.name} (${s.level}%)`).join(", ")}

## Certifications

${CERTS.map((c) => `- ${c}`).join("\n")}

## FAQ

${FAQ.map((f) => `### ${f.q}\n${f.a}`).join("\n\n")}

## Site

- [Home + live voice agent](${SITE}) — talk to the portfolio by voice or text
- [Sitemap](${SITE}/sitemap.xml)
`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
