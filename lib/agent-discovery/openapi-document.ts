import { LINK } from "@/constants/links";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { docsContentRoute, homeContentRoute } from "@/lib/docs";

export const buildOpenApiDocument = (
  origin: string
): Record<string, unknown> => {
  const base = origin.replace(/\/$/, "");

  return {
    externalDocs: {
      description:
        "Use the maintained shadcn MCP server for registry browsing, search, and installation workflows.",
      url: LINK.SHADCN_MCP_DOCS,
    },
    info: {
      description: `Read-only HTTP surfaces for the ${SITE.NAME} documentation site and its shadcn registry of theme, page and UI transitions. ${SITE.DESCRIPTION.LONG}`,
      title: `${SITE.NAME} public HTTP API`,
      version: "0.1.0",
    },
    openapi: "3.0.3",
    paths: {
      [ROUTES.AGENT_SKILLS_INDEX]: {
        get: {
          responses: {
            "200": { description: "Agent skills index" },
          },
          summary: "Agent skills discovery index",
        },
      },
      [ROUTES.AGENT_SKILLS_SITE_SKILL]: {
        get: {
          responses: {
            "200": { description: "Agent skill markdown" },
          },
          summary: "Site agent skill markdown",
        },
      },
      [ROUTES.API_CATALOG]: {
        get: {
          responses: {
            "200": { description: "API catalog linkset" },
          },
          summary: "Machine-readable API catalog",
        },
        head: {
          responses: {
            "200": { description: "API catalog headers" },
          },
          summary: "API catalog headers",
        },
      },
      [ROUTES.API_STATUS]: {
        get: {
          responses: {
            "200": {
              content: {
                "application/json": {
                  schema: {
                    properties: { status: { example: "ok", type: "string" } },
                    type: "object",
                  },
                },
              },
              description: "OK",
            },
          },
          summary: "Service health",
        },
      },
      [ROUTES.LLMS_FULL]: {
        get: {
          responses: {
            "200": { description: "Plain text bundle" },
          },
          summary: "Full LLM-oriented documentation export",
        },
      },
      [ROUTES.LLMS]: {
        get: {
          responses: {
            "200": { description: "Plain text index" },
          },
          summary: "LLM-oriented documentation index",
        },
      },
      [ROUTES.OPENAPI]: {
        get: {
          responses: {
            "200": {
              content: {
                "application/json": {
                  schema: { type: "object" },
                },
              },
              description: "OpenAPI JSON",
            },
          },
          summary: "This OpenAPI document",
        },
      },
      [ROUTES.REGISTRY]: {
        get: {
          responses: {
            "200": {
              content: {
                "application/json": {
                  schema: { type: "object" },
                },
              },
              description: "Registry manifest",
            },
          },
          summary: "shadcn registry index (every theme, page and UI item)",
        },
      },
      "/r/{group}/{slug}.json": {
        get: {
          parameters: [
            {
              in: "path",
              name: "group",
              required: true,
              schema: { enum: ["theme", "page", "ui"], type: "string" },
            },
            {
              example: "circle-reveal",
              in: "path",
              name: "slug",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              content: {
                "application/json": {
                  schema: { type: "object" },
                },
              },
              description: "shadcn registry item",
            },
            "404": { description: "Unknown item" },
          },
          summary:
            "Registry item, installed with `npx shadcn@latest add @transition-kit/{group}/{slug}`",
        },
      },
      [ROUTES.DOCS]: {
        get: {
          responses: {
            "200": { description: "HTML documentation" },
          },
          summary: "Documentation (HTML)",
        },
      },
      [`${ROUTES.DOCS}/{path}.md`]: {
        get: {
          parameters: [
            {
              example: "components/theme/circle-reveal",
              in: "path",
              name: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": { description: "Documentation page markdown" },
            "404": { description: "Unknown page" },
          },
          summary:
            "Documentation page as markdown (also served for Accept: text/markdown)",
        },
      },
      [`${docsContentRoute}/{path}/content.md`]: {
        get: {
          parameters: [
            {
              example: "components/theme/circle-reveal",
              in: "path",
              name: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": { description: "Documentation page markdown" },
            "404": { description: "Unknown page" },
          },
          summary: "Documentation page markdown export",
        },
      },
      [homeContentRoute]: {
        get: {
          responses: {
            "200": { description: "Homepage markdown export" },
          },
          summary: "Homepage markdown export",
        },
        head: {
          responses: {
            "200": { description: "Homepage markdown headers" },
          },
          summary: "Homepage markdown headers",
        },
      },
    },
    servers: [{ url: base }],
  };
};
