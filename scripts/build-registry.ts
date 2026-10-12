/**
 * Generates registry.json from registry/items.ts; `shadcn build` then turns it
 * into public/r/<group>/<slug>.json.
 *
 * - Cores and components ship their .ts/.tsx to components/transitions/. Their
 *   `@/registry/<group>/<file>` imports are rewritten to
 *   `@/components/transitions/<file>` in copies under .registry-build/, which
 *   is what `shadcn build` reads.
 * - CSS lives in real .css files and is converted to the shadcn `css` object,
 *   which the CLI merges into the user's global stylesheet.
 * - Styles and components depend on their group's core, and on every other
 *   item they import, through absolute URLs, so `shadcn add` pulls them in
 *   from any registry setup. `@/components/ui/<name>` imports depend on the
 *   shadcn primitive `<name>`.
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

import { parse } from "postcss";
import type { ChildNode, Container } from "postcss";
import type { Registry, RegistryItem } from "shadcn/schema";

import { FALLBACK_SITE_ORIGIN } from "../constants/site.ts";
import { items } from "../registry/items.ts";
import type { ItemGroup, ItemSource } from "../registry/items.ts";

const root = path.resolve(import.meta.dirname, "..");
const BUILD_DIR = ".registry-build";
const OUTPUT_DIR = "public/r";
const TARGET_DIR = "components/transitions";
/** Provided by the user's React 19.3 app, never installed by the CLI. */
const PEER_PACKAGES: Record<string, true> = { react: true, "react-dom": true };

interface CssObject {
  [key: string]: string | CssObject;
}

const readSource = (file: string) => {
  const absolute = path.join(root, file);
  if (!existsSync(absolute)) {
    throw new Error(`build-registry: missing file ${file}`);
  }
  return readFileSync(absolute, "utf-8");
};

/** Collapses the newlines and indentation postcss keeps in selectors, params and values. */
const oneLine = (value: string) => value.replaceAll(/\s*\n\s*/g, " ").trim();

const toCssObject = (
  container: Container<ChildNode>,
  file: string
): CssObject => {
  const result: CssObject = {};
  // Repeated selectors/at-rules merge like the cascade: later declarations win.
  const merge = (target: CssObject, key: string, value: CssObject) => {
    const existing = target[key];
    if (typeof existing !== "object") {
      target[key] = value;
      return;
    }
    for (const [innerKey, innerValue] of Object.entries(value)) {
      if (typeof innerValue === "object") {
        merge(existing, innerKey, innerValue);
      } else {
        existing[innerKey] = innerValue;
      }
    }
  };
  container.each((node) => {
    if (node.type === "decl") {
      if (node.prop in result) {
        console.warn(
          `build-registry: ${file}: duplicate "${node.prop}" in one rule; the css object keeps the last value`
        );
      }
      const value = oneLine(node.value);
      result[node.prop] = node.important ? `${value} !important` : value;
    } else if (node.type === "rule") {
      merge(result, oneLine(node.selector), toCssObject(node, file));
    } else if (node.type === "atrule") {
      const key = node.params
        ? `@${node.name} ${oneLine(node.params)}`
        : `@${node.name}`;
      merge(result, key, node.nodes ? toCssObject(node, file) : {});
    }
  });
  return result;
};

/** Every shipped source file → the item shipping it and its install target, e.g. registry/theme/x.tsx → components/transitions/x.tsx. */
const shipped = new Map<string, { item: ItemSource; target: string }>(
  items.flatMap((item) =>
    item.files.map((file): [string, { item: ItemSource; target: string }] => [
      file,
      { item, target: `${TARGET_DIR}/${path.basename(file)}` },
    ])
  )
);

const itemUrl = (item: ItemSource) =>
  `${FALLBACK_SITE_ORIGIN}/r/${item.name}.json`;

const resolveImport = (specifier: string, from: string) => {
  const source = specifier.slice("@/".length);
  for (const candidate of [source, `${source}.ts`, `${source}.tsx`]) {
    const entry = shipped.get(candidate);
    if (entry) {
      return entry;
    }
  }
  throw new Error(
    `build-registry: ${from} imports ${specifier}, which no registry item ships`
  );
};

const IMPORT_SPECIFIER = /(\bfrom\s*|\bimport\s*\(?\s*)(["'])([^"']+)\2/g;

/** shadcn/ui primitives, installed from shadcn's registry by name (`button`). */
const SHADCN_UI_IMPORT = "@/components/ui/";

/** Bare package imports (minus React) become the item's npm dependencies. */
const packageName = (specifier: string) => {
  if (specifier.startsWith(".") || specifier.startsWith("@/")) {
    return;
  }
  const parts = specifier.split("/");
  const name = specifier.startsWith("@")
    ? parts.slice(0, 2).join("/")
    : parts[0];
  return PEER_PACKAGES[name] ? undefined : name;
};

interface ItemDependencies {
  /** npm packages. */
  packages: Set<string>;
  /** shadcn primitive names and transition-kit item URLs. */
  registry: Set<string>;
}

/**
 * Copies `file` into BUILD_DIR with `@/registry/...` imports pointing at their
 * install targets, collecting what the imports need installed alongside.
 */
const buildFile = (
  owner: ItemSource,
  file: string,
  dependencies: ItemDependencies
) => {
  const content = readSource(file).replace(
    IMPORT_SPECIFIER,
    (match, prefix: string, quote: string, specifier: string) => {
      const name = packageName(specifier);
      if (name) {
        dependencies.packages.add(name);
      }
      if (specifier.startsWith(SHADCN_UI_IMPORT)) {
        dependencies.registry.add(specifier.slice(SHADCN_UI_IMPORT.length));
      }
      if (!specifier.startsWith("@/registry/")) {
        return match;
      }
      const { item, target } = resolveImport(specifier, file);
      if (item !== owner) {
        dependencies.registry.add(itemUrl(item));
      }
      return `${prefix}${quote}@/${target.replace(/\.tsx?$/, "")}${quote}`;
    }
  );
  const built = path.join(BUILD_DIR, file);
  mkdirSync(path.dirname(path.join(root, built)), { recursive: true });
  writeFileSync(path.join(root, built), content);
  return {
    path: built,
    target: shipped.get(file)?.target ?? `${TARGET_DIR}/${path.basename(file)}`,
    type: "registry:component" as const,
  };
};

const coreOf = (group: ItemGroup) => {
  const core = items.find(
    (item) => item.group === group && item.kind === "core"
  );
  if (!core) {
    throw new Error(`build-registry: no core item for group "${group}"`);
  }
  return core;
};

const toRegistryItem = (item: ItemSource): RegistryItem => {
  // Every style and component needs its group's core, even CSS-only styles.
  const dependencies: ItemDependencies = {
    packages: new Set(),
    registry: new Set(
      item.kind === "core" ? [] : [itemUrl(coreOf(item.group))]
    ),
  };
  const files = item.files.map((file) => buildFile(item, file, dependencies));
  // oxlint-disable-next-line sort-keys -- keep shadcn's documented field order
  return {
    name: item.name,
    // Styles ship only `css`: registry:item merges it without the base-style
    // overwrite prompt that registry:style triggers.
    type: item.kind === "style" ? "registry:item" : "registry:component",
    title: item.title,
    description: item.description,
    ...(dependencies.packages.size > 0 && {
      dependencies: [...dependencies.packages].toSorted(),
    }),
    ...(dependencies.registry.size > 0 && {
      registryDependencies: [...dependencies.registry],
    }),
    ...(files.length > 0 && { files }),
    ...(item.css && {
      css: toCssObject(parse(readSource(item.css)), item.css),
    }),
    categories: [item.group],
  };
};

rmSync(path.join(root, BUILD_DIR), { force: true, recursive: true });
const registry: Registry & { $schema: string } = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  homepage: FALLBACK_SITE_ORIGIN,
  items: items.map(toRegistryItem),
  name: "transition-kit",
};

// `shadcn build` writes public/r/<name>.json but only creates the output dir
// itself; names are `<group>/<slug>`, so create (and clear) the group dirs.
for (const group of new Set(items.map((item) => item.group))) {
  const dir = path.join(root, OUTPUT_DIR, group);
  rmSync(dir, { force: true, recursive: true });
  mkdirSync(dir, { recursive: true });
}

writeFileSync(
  path.join(root, "registry.json"),
  `${JSON.stringify(registry, null, 2)}\n`
);
console.log(
  `registry.json: ${registry.items.length} items for ${FALLBACK_SITE_ORIGIN}`
);
