import { readFile } from "node:fs/promises";

import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import fumadocsMdx from "fumadocs-mdx/vite";
import { defineConfig } from "vite";
import type { Plugin } from "vite";

import { toInstalledImports } from "./lib/component-sources";
import { highlightCode } from "./lib/highlight-code";
import * as sourceConfig from "./source.config";

/** `file?highlight` -> `{ code, highlightedCode, language }`, so Shiki runs at build time, not per request. */
const HIGHLIGHT = "\0highlight:";
const highlightSources = (): Plugin => ({
  enforce: "pre",
  async load(id) {
    if (!id.startsWith(HIGHLIGHT)) {
      return;
    }
    const file = id.slice(HIGHLIGHT.length, -".js".length);
    const raw = await readFile(file, "utf-8");
    const code = toInstalledImports(raw.replaceAll("\r\n", "\n"));
    const language = file.split(".").pop() ?? "tsx";
    const highlightedCode = await highlightCode(code, language);
    return `export default ${JSON.stringify({ code, highlightedCode, language })};`;
  },
  name: "highlight-sources",
  // A virtual `.js` id, so Vite's CSS pipeline leaves `.css?highlight` alone.
  async resolveId(source, importer) {
    const [path, query] = source.split("?");
    if (query !== "highlight") {
      return;
    }
    const resolved = await this.resolve(path, importer, { skipSelf: true });
    return resolved && `${HIGHLIGHT}${resolved.id}.js`;
  },
});

export default defineConfig(async () => {
  const mdx = await fumadocsMdx(sourceConfig);
  const { transform } = mdx;
  if (typeof transform === "function") {
    mdx.transform = function transformMdx(code, id, options) {
      // Fumadocs 14 also matches ?raw; leave raw content to Vite's loader.
      if (new URLSearchParams(id.split("?")[1]).has("raw")) {
        return;
      }
      return transform.call(this, code, id, options);
    };
  }
  return {
    // constants/site.ts runs on server and client; bake the origin in so both agree.
    define: {
      "process.env.SITE_URL": JSON.stringify(process.env.SITE_URL ?? null),
    },
    plugins: [
      highlightSources(),
      tailwindcss(),
      mdx,
      cloudflare({ viteEnvironment: { name: "ssr" } }),
      tanstackStart(),
      react(),
    ],
    resolve: { alias: { "@": import.meta.dirname } },
  };
});
