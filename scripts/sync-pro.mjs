import { existsSync, readFileSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseEnv } from "node:util";

const REPO = "AbdullahMukadam/transition-kit-pro";
const root = path.join(import.meta.dirname, "..");
const proDir = path.join(root, "registry", "pro");
const indexFile = path.join(proDir, "__index__.tsx");
const catalogFile = path.join(root, "registry", "pro-catalog.ts");
const args = new Set(process.argv.slice(2));

const log = (message) => console.log(`[sync-pro] ${message}`);

const readToken = () => {
  if (process.env.TRANSITION_KIT_PRO_GITHUB_TOKEN) {
    return process.env.TRANSITION_KIT_PRO_GITHUB_TOKEN;
  }
  const vars = path.join(root, ".dev.vars");
  if (!existsSync(vars)) {
    return;
  }
  return parseEnv(readFileSync(vars, "utf-8")).TRANSITION_KIT_PRO_GITHUB_TOKEN;
};

const writeIndex = async (demos) => {
  const lines = [
    'import { lazy } from "react";',
    'import type { ComponentType, LazyExoticComponent } from "react";',
    "",
    "export const PRO_DEMOS: Record<string, LazyExoticComponent<ComponentType>> = {",
    ...demos.map(
      ({ exportName, file, name }) =>
        `  ${JSON.stringify(name)}: lazy(() => import(${JSON.stringify(`./${file.replace(/\.tsx$/u, "")}`)}).then((module) => ({ default: module.${exportName} }))),`
    ),
    "};",
    "",
  ];
  await mkdir(proDir, { recursive: true });
  await writeFile(indexFile, lines.join("\n"));
};

const writeCatalog = async (items) => {
  const entries = items.map((item) => ({
    description: item.description ?? "",
    name: item.name,
    title: item.title ?? item.name,
  }));
  await writeFile(
    catalogFile,
    `export interface ProCatalogItem {
  name: string;
  title: string;
  description: string;
}

export const PRO_CATALOG: ProCatalogItem[] = ${JSON.stringify(entries, null, 2)};

export const isProItem = (name: string) =>
  PRO_CATALOG.some((item) => item.name === name);
`
  );
};

const token = readToken();

if (args.has("--if-missing") && existsSync(indexFile)) {
  process.exit(0);
}

if (!token) {
  if (!existsSync(indexFile)) {
    await writeIndex([]);
  }
  log("TRANSITION_KIT_PRO_GITHUB_TOKEN is not set; Pro previews stay locked.");
  process.exit(0);
}

const fetchFile = async (file) => {
  const response = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${file.split("/").map(encodeURIComponent).join("/")}?ref=main`,
    {
      headers: {
        Accept: "application/vnd.github.raw+json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "transition-kit",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`GitHub returned ${response.status} for ${file}`);
  }
  return response.text();
};

const isSafe = (file) =>
  file.startsWith("registry/") &&
  file.split("/").every((part) => part && part !== "." && part !== "..");

const manifest = JSON.parse((await fetchFile("registry.json")) ?? "{}");
const items = manifest.items ?? [];
const proNames = new Set(items.map((item) => item.name));

const toLocalImports = (source) =>
  source.replaceAll(/@\/registry\/ui\/(?<name>[\w-]+)/gu, (match, name) =>
    proNames.has(name) ? `@/registry/pro/ui/${name}` : match
  );

await rm(proDir, { force: true, recursive: true });
const demos = [];
for (const item of items) {
  for (const file of item.files ?? []) {
    if (!isSafe(file.path)) {
      throw new Error(`Unsafe path in registry.json: ${file.path}`);
    }
    const source = await fetchFile(file.path);
    const target = path.join(proDir, file.path.slice("registry/".length));
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, toLocalImports(source ?? ""));
  }
  const demoPath = `examples/${item.name}-demo.tsx`;
  const demo = await fetchFile(demoPath);
  if (demo) {
    const target = path.join(proDir, demoPath);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, toLocalImports(demo));
    const exportName = `${item.name
      .split("-")
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join("")}Demo`;
    demos.push({ exportName, file: demoPath, name: item.name });
  }
}
await writeIndex(demos);
if (args.has("--catalog")) {
  await writeCatalog(items);
}
log(`synced ${items.length} Pro items, ${demos.length} demos`);
