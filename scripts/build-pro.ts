import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { parse } from "postcss";

import { FALLBACK_SITE_ORIGIN } from "../constants/site.ts";
import { items } from "../registry/items.ts";
import { toCssObject } from "./registry-css.ts";

interface ProSource {
  name: string;
  title: string;
  description: string;
  files: string[];
  css?: string;
}

const TARGET_DIR = "components/transitions";
const PEER_PACKAGES = new Set(["react", "react-dom"]);
const SHADCN_UI_IMPORT = "@/components/ui/";
const IMPORT_SPECIFIER = /(\bfrom\s*|\bimport\s*\(?\s*)(["'])([^"']+)\2/g;

const proDir = path.resolve(process.argv[2] ?? "../transition-kit-pro");

const read = (file: string) => {
  const absolute = path.join(proDir, file);
  if (!existsSync(absolute)) {
    throw new Error(`build-pro: missing file ${file}`);
  }
  return readFileSync(absolute, "utf-8").replaceAll("\r\n", "\n");
};

const sources = (JSON.parse(read("registry.json")) as { items: ProSource[] })
  .items;
const proNames = new Set(sources.map((item) => item.name));

const publicItemFor = (basename: string) =>
  items.find((item) =>
    item.files.some(
      (file) => path.basename(file).replace(/\.tsx?$/u, "") === basename
    )
  );

const packageName = (specifier: string) => {
  if (specifier.startsWith(".") || specifier.startsWith("@/")) {
    return;
  }
  const parts = specifier.split("/");
  const name = specifier.startsWith("@")
    ? parts.slice(0, 2).join("/")
    : parts[0];
  return PEER_PACKAGES.has(name) ? undefined : name;
};

const coreUrl = `${FALLBACK_SITE_ORIGIN}/r/ui-transition.json`;

for (const item of sources) {
  const packages = new Set<string>();
  const registry = new Set<string>([coreUrl]);
  const files = item.files.map((file) => {
    const content = read(file).replace(
      IMPORT_SPECIFIER,
      (match, prefix: string, quote: string, specifier: string) => {
        const name = packageName(specifier);
        if (name) {
          packages.add(name);
        }
        if (specifier.startsWith(SHADCN_UI_IMPORT)) {
          registry.add(specifier.slice(SHADCN_UI_IMPORT.length));
        }
        if (!specifier.startsWith("@/registry/")) {
          return match;
        }
        const basename = path.basename(specifier);
        if (proNames.has(basename) && basename !== item.name) {
          registry.add(`@transition-kit/${basename}`);
        } else if (!proNames.has(basename)) {
          const owner = publicItemFor(basename);
          if (!owner) {
            throw new Error(
              `build-pro: ${file} imports ${specifier}, which no item ships`
            );
          }
          registry.add(`${FALLBACK_SITE_ORIGIN}/r/${owner.name}.json`);
        }
        return `${prefix}${quote}@/${TARGET_DIR}/${basename}${quote}`;
      }
    );
    return {
      content,
      path: file,
      target: `${TARGET_DIR}/${path.basename(file)}`,
      type: "registry:component",
    };
  });
  const built = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    categories: ["ui"],
    ...(item.css && { css: toCssObject(parse(read(item.css)), item.css) }),
    ...(packages.size > 0 && { dependencies: [...packages].toSorted() }),
    description: item.description,
    files,
    name: item.name,
    registryDependencies: [...registry],
    title: item.title,
    type: "registry:component",
  };
  const out = path.join(proDir, "r", `${item.name}.json`);
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, `${JSON.stringify(built, null, 2)}\n`);
  console.log(`build-pro: ${item.name}`);
}
