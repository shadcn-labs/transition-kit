import { isMarkdownPreferred, rewritePath } from "fumadocs-core/negotiation";

import { LINK } from "@/constants/links";
import { ROUTES } from "@/constants/routes";
import {
  docsContentRoute,
  docsPathForItem,
  homeContentRoute,
} from "@/lib/docs";
import { getItem } from "@/registry/items";

const { rewrite: rewriteDocs } = rewritePath(
  `${ROUTES.DOCS}{/*path}`,
  `${docsContentRoute}{/*path}/content.md`
);
const { rewrite: rewriteSuffix } = rewritePath(
  `${ROUTES.DOCS}{/*path}.md`,
  `${docsContentRoute}{/*path}/content.md`
);

export const homepageLinkHeader = [
  `<${ROUTES.API_CATALOG}>; rel="api-catalog"`,
  `<${ROUTES.OPENAPI}>; rel="service-desc"`,
  `<${ROUTES.DOCS}>; rel="service-doc"`,
  `<${LINK.SHADCN_MCP_DOCS}>; rel="service-doc"; title="shadcn MCP server"`,
  `<${ROUTES.AGENT_SKILLS_INDEX}>; rel="describedby"`,
].join(", ");

/** Old transition slugs that were renamed when the catalog moved to registry/items.ts. */
const RENAMED_TRANSITIONS: Record<string, string> = {
  "iris-wipe-page": "iris-wipe",
  "venetian-blinds-theme": "venetian-blinds",
  "wave-reveal-theme": "wave-reveal",
};

const OLD_THEME_TOGGLES = new Set([
  "animated-theme-toggler",
  "theme-switcher",
  "theme-toggle-button",
  "theme-toggle-switch",
]);

/** Docs pages of the theme toggles, moved from `theme/` to `components/`. */
const MOVED_DOCS_PAGES: Record<string, string> = {
  "browser-support": "installation",
  "components/theme/animated-theme-toggler": "components/theme-morph-button",
  "components/theme/theme-switcher": "components/theme-mode-switch",
  "components/theme/theme-toggle-button": "components/theme-toggle-button",
  "components/theme/theme-toggle-switch": "components/theme-toggle-switch",
};

/** Docs pages moved when theme/page folders were renamed to their core pages. */
const MOVED_GROUP_PAGES: Record<string, string> = {
  "components/page": "components/page-transition",
  "components/page/accordion": "components/page-transition/accordion",
  "components/page/blur": "components/page-transition/blur",
  "components/page/book-flip": "components/page-transition/book-flip",
  "components/page/cube": "components/page-transition/cube",
  "components/page/curtain": "components/page-transition/curtain",
  "components/page/doorway": "components/page-transition/doorway",
  "components/page/fade": "components/page-transition/fade",
  "components/page/flip": "components/page-transition/flip",
  "components/page/fold": "components/page-transition/fold",
  "components/page/glitch": "components/page-transition/glitch",
  "components/page/iris-wipe": "components/page-transition/iris-wipe",
  "components/page/page-curl": "components/page-transition/page-curl",
  "components/page/roll": "components/page-transition/roll",
  "components/page/rotate": "components/page-transition/rotate",
  "components/page/scale": "components/page-transition/scale",
  "components/page/skew-slide": "components/page-transition/skew-slide",
  "components/page/slide": "components/page-transition/slide",
  "components/page/zoom": "components/page-transition/zoom",
  "components/theme": "components/theme-transition",
  "components/theme/checkerboard-reveal":
    "components/theme-transition/checkerboard-reveal",
  "components/theme/circle-blur": "components/theme-transition/circle-blur",
  "components/theme/circle-reveal": "components/theme-transition/circle-reveal",
  "components/theme/clock-wipe": "components/theme-transition/clock-wipe",
  "components/theme/diagonal-wipe": "components/theme-transition/diagonal-wipe",
  "components/theme/gif-cat": "components/theme-transition/gif-cat",
  "components/theme/gif-chika": "components/theme-transition/gif-chika",
  "components/theme/gif-deadpool": "components/theme-transition/gif-deadpool",
  "components/theme/gif-frog": "components/theme-transition/gif-frog",
  "components/theme/gif-hakari-dance":
    "components/theme-transition/gif-hakari-dance",
  "components/theme/gif-michael-jackson":
    "components/theme-transition/gif-michael-jackson",
  "components/theme/gif-penguin": "components/theme-transition/gif-penguin",
  "components/theme/heart-reveal": "components/theme-transition/heart-reveal",
  "components/theme/polygon-reveal":
    "components/theme-transition/polygon-reveal",
  "components/theme/ripple-reveal": "components/theme-transition/ripple-reveal",
  "components/theme/spiral-reveal": "components/theme-transition/spiral-reveal",
  "components/theme/star-reveal": "components/theme-transition/star-reveal",
  "components/theme/venetian-blinds":
    "components/theme-transition/venetian-blinds",
  "components/theme/wave-reveal": "components/theme-transition/wave-reveal",
  "components/ui-transition": "components",
};

/** Docs pages of the UI components, moved from `components/ui/` to `components/`. */
const MOVED_UI_PAGES: Record<string, string> = {
  "components/animated-theme-toggler": "components/theme-morph-button",
  "components/theme-switcher": "components/theme-mode-switch",
  "components/ui": "components",
  "components/ui/accordion": "components/accordion",
  "components/ui/add-to-cart": "components/add-to-cart",
  "components/ui/animated-list": "components/animated-list",
  "components/ui/animated-theme-toggler": "components/theme-morph-button",
  "components/ui/carousel": "components/carousel",
  "components/ui/dynamic-island": "components/dynamic-island",
  "components/ui/filter-grid": "components/filter-grid",
  "components/ui/kanban-board": "components/kanban-board",
  "components/ui/layout-switcher": "components/layout-switcher",
  "components/ui/morphing-popover": "components/morphing-popover",
  "components/ui/number-flip": "components/number-flip",
  "components/ui/product-gallery": "components/product-gallery",
  "components/ui/segmented-control": "components/segmented-control",
  "components/ui/sortable-table": "components/sortable-table",
  "components/ui/stack-navigator": "components/stack-navigator",
  "components/ui/status-button": "components/status-button",
  "components/ui/step-wizard": "components/step-wizard",
  "components/ui/tabs": "components/tabs",
  "components/ui/theme-switcher": "components/theme-mode-switch",
  "components/ui/theme-toggle-button": "components/theme-toggle-button",
  "components/ui/theme-toggle-switch": "components/theme-toggle-switch",
  "components/ui/ui-transition": "components/ui-transition",
};

/** Maps URLs of the pre-docs site (/templates, /components, /transition) to their docs pages. */
const legacyRedirect = (pathname: string): string | undefined => {
  const path = pathname.replace(/\/+$/, "");
  const markdown = path.endsWith(".md");
  const segments = (markdown ? path.slice(0, -3) : path)
    .split("/")
    .filter(Boolean);
  const [section, ...rest] = segments;
  const last = rest.at(-1);
  let target: string | undefined;

  switch (section) {
    case "templates": {
      if (rest.length === 1 && rest[0] === "theme-toggles") {
        target = ROUTES.DOCS_THEME;
      } else if (rest.length === 1 && rest[0] === "page-transitions") {
        target = ROUTES.DOCS_PAGE;
      } else {
        target = ROUTES.DOCS_COMPONENTS;
      }
      break;
    }
    case "components": {
      if (!last || last === "theme") {
        target = ROUTES.DOCS_THEME;
      } else if (OLD_THEME_TOGGLES.has(last)) {
        target = `${ROUTES.DOCS_COMPONENTS}/${last}`;
      } else {
        target = ROUTES.DOCS_COMPONENTS;
      }
      break;
    }
    case "transition": {
      const slug =
        rest.length === 1 ? (RENAMED_TRANSITIONS[rest[0]] ?? rest[0]) : "";
      const item = slug
        ? (getItem(`theme/${slug}`) ?? getItem(`page/${slug}`))
        : undefined;
      target = item
        ? `${ROUTES.DOCS_COMPONENTS}/${docsPathForItem(item.name)}`
        : ROUTES.DOCS_COMPONENTS;
      break;
    }
    default: {
      return undefined;
    }
  }

  return markdown ? `${target}.md` : target;
};

export const routeRequest = (request: Request): Request | Response => {
  const url = new URL(request.url);
  const docsPrefix = `${ROUTES.DOCS}/`;
  if (url.pathname.startsWith(docsPrefix)) {
    const rest = url.pathname.slice(docsPrefix.length);
    const markdown = rest.endsWith(".md");
    const key = markdown ? rest.slice(0, -3) : rest;
    const moved =
      MOVED_DOCS_PAGES[key] ?? MOVED_UI_PAGES[key] ?? MOVED_GROUP_PAGES[key];
    if (moved) {
      return new Response(null, {
        headers: {
          Location: `${docsPrefix}${moved}${markdown ? ".md" : ""}${url.search}`,
        },
        status: 301,
      });
    }
  }
  const legacy = legacyRedirect(url.pathname);
  if (legacy) {
    return new Response(null, {
      headers: { Location: `${legacy}${url.search}` },
      status: 301,
    });
  }

  if (
    url.pathname === `${ROUTES.DOCS}.mdx` ||
    (url.pathname.startsWith(`${ROUTES.DOCS}/`) &&
      url.pathname.endsWith(".mdx"))
  ) {
    return new Response(null, {
      headers: { Location: `${url.pathname.slice(0, -1)}${url.search}` },
      status: 308,
    });
  }

  let destination: string | undefined;
  if (
    url.pathname === ROUTES.HOME &&
    (request.method === "GET" || request.method === "HEAD") &&
    isMarkdownPreferred(request)
  ) {
    destination = homeContentRoute;
  } else {
    destination = rewriteSuffix(url.pathname) || undefined;
    if (!destination && isMarkdownPreferred(request)) {
      destination = rewriteDocs(url.pathname) || undefined;
    }
  }

  if (!destination) {
    return request;
  }

  url.pathname = destination;
  return new Request(url, request);
};
