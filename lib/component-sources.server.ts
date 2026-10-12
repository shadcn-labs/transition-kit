import { createProcessor } from "@mdx-js/mdx";

import type {
  ComponentSourceData,
  ComponentSourceRequest,
  ComponentSources,
} from "@/lib/component-sources";
import { componentSourceKey } from "@/lib/component-sources";
import { getItem } from "@/registry/items";

// Highlighted at build time by the `highlight-sources` plugin in vite.config.ts;
// Shiki at request time exceeds the Worker CPU limit.
const sourceFiles = import.meta.glob<ComponentSourceData>(
  ["/examples/**/*.{ts,tsx,css}", "/registry/**/*.{ts,tsx,css}"],
  { import: "default", query: "?highlight" }
);

/** An item's shipped source: the TSX for cores and components, the CSS for styles. */
const itemSourcePath = (name: string) => {
  const item = getItem(name);
  return item?.files[0] ?? item?.css;
};

interface MdxNode {
  type: string;
  name?: string | null;
  attributes?: {
    type: string;
    name?: string;
    value?:
      | string
      | null
      | {
          data?: {
            estree?: {
              body: {
                type: string;
                expression?: { type: string; value?: unknown };
              }[];
            } | null;
          };
        };
  }[];
  children?: MdxNode[];
}

const processor = createProcessor();

export const loadComponentSources = async (
  mdxSource: string
): Promise<ComponentSources> => {
  const requests = new Map<string, ComponentSourceRequest>();
  const collect = (node: MdxNode) => {
    if (
      ["mdxJsxFlowElement", "mdxJsxTextElement"].includes(node.type) &&
      (node.name === "ComponentPreview" || node.name === "ComponentSource")
    ) {
      const request: ComponentSourceRequest = {};
      for (const attribute of node.attributes ?? []) {
        if (
          attribute.type !== "mdxJsxAttribute" ||
          !attribute.name ||
          !["name", "src", "title", "language"].includes(attribute.name)
        ) {
          continue;
        }
        let { value } = attribute;
        if (value && typeof value === "object") {
          const expression = value.data?.estree?.body[0]?.expression;
          value =
            expression?.type === "Literal" &&
            typeof expression.value === "string"
              ? expression.value
              : undefined;
        }
        if (typeof value === "string") {
          request[attribute.name as keyof ComponentSourceRequest] = value;
        }
      }
      requests.set(componentSourceKey(request), request);
    }
    for (const child of node.children ?? []) {
      collect(child);
    }
  };
  // Frontmatter is YAML, not MDX; descriptions may contain `<Tags>`.
  collect(
    processor.parse(mdxSource.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, ""))
  );

  const sources: ComponentSources = {};
  await Promise.all(
    [...requests].map(async ([key, request]) => {
      const path =
        request.src?.replace(/^\.?\//, "") ??
        (request.name ? itemSourcePath(request.name) : undefined);
      const load = path ? sourceFiles[`/${path}`] : undefined;
      sources[key] = load ? await load() : null;
    })
  );
  return sources;
};
