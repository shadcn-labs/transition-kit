import type { PageTreeFolder } from "@/lib/page-tree";

import { ROUTES } from "../constants/routes";
import { items } from "../registry/items";
import { formatLabelFromSlug } from "./utils";

export const DOCS_DIR = `content${ROUTES.DOCS}`;

export const EXCLUDED_SECTIONS = new Set(["installation", "(root)"]);

export const isComponentsFolder = (folder: PageTreeFolder) =>
  folder.$id === "components" || folder.name === "Components";

const TITLE_OVERRIDES: Record<string, string> = {
  "page-transition": "Page Transitions",
  "theme-transition": "Theme Transitions",
};

/**
 * Docs URL path (under `/docs/components`) for a registry item: UI items live
 * directly under components, theme and page items nest under their core page.
 */
export const docsPathForItem = (name: string) => {
  if (name.startsWith("ui/")) {
    return name.slice("ui/".length);
  }
  if (name.startsWith("theme/")) {
    return `theme-transition/${name.slice("theme/".length)}`;
  }
  if (name.startsWith("page/")) {
    return `page-transition/${name.slice("page/".length)}`;
  }
  return name;
};

export const formatTitleFromSlug = (slug: string): string =>
  TITLE_OVERRIDES[slug] ?? formatLabelFromSlug(slug);

export const homeContentRoute = `${ROUTES.LLMS_MD}/content.md`;
export const docsContentRoute = `${ROUTES.LLMS_MD}${ROUTES.DOCS}`;

/**
 * Docs URLs flagged as new, marked with a dot in navigation: registry items
 * flagged `isNew`, plus new top-level pages.
 */
export const NEW_DOCS_URLS: ReadonlySet<string> = new Set([
  ...items
    .filter((item) => item.isNew)
    .map((item) => `${ROUTES.DOCS_COMPONENTS}/${docsPathForItem(item.name)}`),
  ROUTES.DOCS_CHANGELOG,
]);
