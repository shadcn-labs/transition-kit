import { ROUTES } from "@/constants/routes";
import { items } from "@/registry/items";
import type { ItemGroup, ItemSource } from "@/registry/items";

export const REGISTRY_NAMESPACE = "@transition-kit";

export const ITEM_GROUPS: { group: ItemGroup; title: string }[] = [
  { group: "theme", title: "Theme" },
  { group: "page", title: "Page" },
  { group: "ui", title: "UI" },
];

export const installCommand = (name: string) =>
  `npx shadcn@latest add ${REGISTRY_NAMESPACE}/${name}`;

export const itemDocsPath = (item: ItemSource) =>
  `${ROUTES.DOCS_COMPONENTS}/${item.name}`;

/** Markdown bullet list of every item in a group, with install command and docs link. */
export const itemsMarkdown = (base: string, group: ItemGroup) =>
  items
    .filter((item) => item.group === group)
    .map(
      (item) =>
        `- [${item.title}](${base}${itemDocsPath(item)}.md) (\`${item.name}\`, ${item.kind}): ${item.description} Install: \`${installCommand(item.name)}\``
    )
    .join("\n");
