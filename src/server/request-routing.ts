import { isMarkdownPreferred, rewritePath } from "fumadocs-core/negotiation";

import { LINK } from "@/constants/links";
import { ROUTES } from "@/constants/routes";
import { docsContentRoute, homeContentRoute } from "@/lib/docs";
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
        target = `${ROUTES.DOCS_THEME}/${last}`;
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
        ? `${ROUTES.DOCS_COMPONENTS}/${item.name}`
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
