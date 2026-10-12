import { LRUCache } from "lru-cache";
import type { ShikiTransformer } from "shiki";
import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

// Workers can't compile WebAssembly at runtime, so use the JavaScript regex
// engine and bundle only the grammars the site shows.
const highlighter = createHighlighterCore({
  engine: createJavaScriptRegexEngine(),
  langs: [
    import("shiki/langs/bash.mjs"),
    import("shiki/langs/css.mjs"),
    import("shiki/langs/json.mjs"),
    import("shiki/langs/tsx.mjs"),
    import("shiki/langs/typescript.mjs"),
  ],
  themes: [
    import("shiki/themes/github-dark.mjs"),
    import("shiki/themes/github-light.mjs"),
  ],
});

const highlightCache = new LRUCache<string, string>({
  max: 500,
  ttl: 1000 * 60 * 60,
});

const hash = (input: string) => {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = Math.trunc(Math.imul(31, h) + (input.codePointAt(i) ?? 0));
  }
  return h.toString(36);
};

export const transformers = [
  {
    code(node) {
      if (node.tagName === "code") {
        const raw = this.source;
        node.properties.__raw__ = raw;

        if (raw.startsWith("npm install")) {
          node.properties.__npm__ = raw;
          node.properties.__yarn__ = raw.replace("npm install", "yarn add");
          node.properties.__pnpm__ = raw.replace("npm install", "pnpm add");
          node.properties.__bun__ = raw.replace("npm install", "bun add");
        } else if (raw.startsWith("npx create-")) {
          node.properties.__npm__ = raw;
          node.properties.__yarn__ = raw.replace("npx create-", "yarn create ");
          node.properties.__pnpm__ = raw.replace("npx create-", "pnpm create ");
          node.properties.__bun__ = raw.replace("npx", "bunx --bun");
        } else if (raw.startsWith("npm create")) {
          node.properties.__npm__ = raw;
          node.properties.__yarn__ = raw.replace("npm create", "yarn create");
          node.properties.__pnpm__ = raw.replace("npm create", "pnpm create");
          node.properties.__bun__ = raw.replace("npm create", "bun create");
        } else if (raw.startsWith("npx")) {
          node.properties.__npm__ = raw;
          node.properties.__yarn__ = raw.replace("npx", "yarn dlx");
          node.properties.__pnpm__ = raw.replace("npx", "pnpm dlx");
          node.properties.__bun__ = raw.replace("npx", "bunx --bun");
        } else if (raw.startsWith("npm run")) {
          node.properties.__npm__ = raw;
          node.properties.__yarn__ = raw.replace("npm run", "yarn");
          node.properties.__pnpm__ = raw.replace("npm run", "pnpm");
          node.properties.__bun__ = raw.replace("npm run", "bun");
        }
      }
    },
  },
] as ShikiTransformer[];

export const highlightCode = async (code: string, language = "tsx") => {
  const cacheKey = hash(`${language}:${code}`);

  const cached = highlightCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const shiki = await highlighter;
  const html = shiki.codeToHtml(code, {
    lang: shiki.getLoadedLanguages().includes(language) ? language : "text",
    themes: {
      dark: "github-dark",
      light: "github-light",
    },
    transformers: [
      {
        code(node) {
          node.properties["data-line-numbers"] = "";
        },
        line(node) {
          node.properties["data-line"] = "";
        },
        pre(node) {
          node.properties.class =
            "no-scrollbar min-w-0 overflow-x-auto px-4 py-3.5 outline-none has-[[data-highlighted-line]]:px-0 has-[[data-line-numbers]]:px-0 has-[[data-slot=tabs]]:p-0 !bg-transparent";
        },
      },
    ],
  });

  highlightCache.set(cacheKey, html);

  return html;
};
