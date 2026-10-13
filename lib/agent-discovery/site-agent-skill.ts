import { LINK } from "@/constants/links";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import {
  installCommand,
  ITEM_GROUPS,
  itemDocsPath,
  REGISTRY_NAMESPACE,
} from "@/lib/agent-discovery/registry-items";
import { items } from "@/registry/items";

const itemList = ITEM_GROUPS.map(
  ({ group, title }) => `### ${title}

${items
  .filter((item) => item.group === group)
  .map(
    (item) =>
      `- \`${item.name}\` (${item.kind}): ${item.description} Docs: ${SITE.URL}${itemDocsPath(item)}`
  )
  .join("\n")}`
).join("\n\n");

export const SITE_AGENT_SKILL_MD = `# ${SITE.NAME}

## Summary

Help users install and use ${SITE.NAME}: ${SITE.DESCRIPTION.LONG}

Source: ${LINK.GITHUB}

## Requirements

- React 19.3 or newer (\`<ViewTransition>\`, \`startTransition\`, \`addTransitionType\`).
- A project initialised with the shadcn CLI (\`npx shadcn@latest init\`) and Tailwind CSS.

## Registry

- Namespace: \`${REGISTRY_NAMESPACE}\` resolves to \`${SITE.URL}/r/{name}.json\`.
- Add it to \`components.json\` with \`npx shadcn@latest registry add ${SITE.REGISTRY_NAMESPACE}\`, or install by URL: \`npx shadcn@latest add ${SITE.REGISTRY}/theme-transition.json\`.
- Registry index: ${SITE.URL}${ROUTES.REGISTRY}
- Item names mirror the docs URLs: bare slugs for UI components and cores (\`tabs\`), \`theme/<slug>\` or \`page/<slug>\` for styles.

## Theme transitions

1. Install the core (it includes the Circle Reveal default style): \`${installCommand("theme-transition")}\`
2. Wrap the app in \`ThemeTransitionProvider\` (render \`ThemeTransitionScript\` in \`<head>\` to avoid a flash of the wrong theme).
3. Call \`useThemeTransition().toggleTheme({ transition: "circle-reveal", origin })\` or \`setTheme(theme, { transition, origin })\`, or install a ready-made control such as \`theme-toggle-button\`.

## Page transitions

1. Install the core (it includes the Fade default style): \`${installCommand("page-transition")}\`
2. Wrap the routed content in \`<PageTransition id={pathname} transition="slide">\`.
3. Navigate inside \`navigateWithTransition(() => navigate(to))\`; pass \`{ direction: "back" }\` for backward navigation.

## UI components

1. Install a component (it pulls in the \`ui-transition\` core and any shadcn primitives it uses): \`${installCommand("tabs")}\`
2. Import it from \`@/components/transitions/<slug>\`, e.g. \`import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/transitions/tabs"\`. Its state changes animate through React's \`<ViewTransition>\`; no provider is needed.
3. Build your own with \`tk()\`, \`useTransitionNames\` and the \`FORWARD\`/\`BACK\` transition types from \`@/components/transitions/ui-transition\`.

## Items

${itemList}

## Docs

- Installation: ${SITE.URL}${ROUTES.DOCS_INSTALLATION}
- Components: ${SITE.URL}${ROUTES.DOCS_COMPONENTS}
- LLM index: ${SITE.URL}${ROUTES.LLMS}

## MCP

This site is a shadcn-compatible registry. For MCP workflows, use the shadcn MCP server: ${LINK.SHADCN_MCP_DOCS}
`;

export const siteAgentSkillDigest = async (): Promise<string> => {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(SITE_AGENT_SKILL_MD)
  );
  const hex = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");

  return `sha256:${hex}`;
};
