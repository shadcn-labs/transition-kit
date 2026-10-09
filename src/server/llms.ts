import { llms } from "fumadocs-core/source";

import { LINK } from "@/constants/links";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import {
  ITEM_GROUPS,
  itemsMarkdown,
  REGISTRY_NAMESPACE,
} from "@/lib/agent-discovery/registry-items";
import { requestOrigin } from "@/lib/agent-discovery/request-origin";
import { homeContentRoute } from "@/lib/docs";
import { source } from "@/lib/source";

const documentationIndex = async (base: string) => {
  const index = await llms(source).index();
  return index
    .replace(/^#\s+(.+)$/m, "## $1")
    .replaceAll(
      /\]\((\/docs(?:\/[^)#\s]+)?)(#[^)]+)?\)/g,
      (_, pathname, hash = "") => `](${base}${pathname}.md${hash})`
    )
    .trim();
};

const docsIndex = async (origin: string) => {
  const base = origin.replace(/\/$/, "");

  return `# ${SITE.NAME}

> ${SITE.DESCRIPTION.LONG} Use this index to discover the available documentation pages, markdown mirrors, and registry resources before browsing.

${await documentationIndex(base)}

${ITEM_GROUPS.map(
  ({ group, title }) => `## ${title} Transitions

${itemsMarkdown(base, group)}`
).join("\n\n")}

## Registry

- Namespace: \`${REGISTRY_NAMESPACE}\` resolves to \`${base}/r/{name}.json\`
- [Registry index](${base}${ROUTES.REGISTRY})
- Requires React 19.3 (\`<ViewTransition>\`, \`addTransitionType\`)

## Machine-readable Resources

- [Full documentation](${base}${ROUTES.LLMS_FULL})
- [Homepage markdown](${base}${homeContentRoute})
- [OpenAPI description](${base}${ROUTES.OPENAPI})
- [API catalog](${base}${ROUTES.API_CATALOG})
- [Agent skill](${base}${ROUTES.AGENT_SKILLS_SITE_SKILL})
- [shadcn MCP server documentation](${LINK.SHADCN_MCP_DOCS})
`;
};

export const GET = async (request: Request) =>
  new Response(await docsIndex(requestOrigin(request)), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
