import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import fumadocsMdx from "fumadocs-mdx/vite";
import { defineConfig } from "vite";

import * as sourceConfig from "./source.config";

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
      tailwindcss(),
      mdx,
      cloudflare({ viteEnvironment: { name: "ssr" } }),
      tanstackStart(),
      react(),
    ],
    resolve: { alias: { "@": import.meta.dirname } },
  };
});
