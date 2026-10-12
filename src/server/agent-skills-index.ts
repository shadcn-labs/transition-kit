import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { requestOrigin } from "@/lib/agent-discovery/request-origin";
import { siteAgentSkillDigest } from "@/lib/agent-discovery/site-agent-skill";

export const GET = async (request: Request) => {
  const origin = requestOrigin(request);
  const base = origin.replace(/\/$/, "");

  return Response.json(
    {
      $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
      skills: [
        {
          description: `Install and use ${SITE.NAME} theme, page and UI transitions (React 19.3 <ViewTransition>) from the @transition-kit shadcn registry.`,
          digest: await siteAgentSkillDigest(),
          name: SITE.NAME,
          type: "skill-md",
          url: `${base}${ROUTES.AGENT_SKILLS_SITE_SKILL}`,
        },
      ],
    },
    { headers: { "Cache-Control": "public, max-age=3600" } }
  );
};
