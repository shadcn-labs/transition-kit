import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import react from "ultracite/oxlint/react";
import vitest from "ultracite/oxlint/vitest";

export default defineConfig({
  extends: [core, react, vitest],
  ignorePatterns: [
    "public/r/**",
    ".agents/**",
    ".cursor/**",
    ".changeset/**",
    ".claude/**",
    ".web-kits/**",
    "audio/**",
    ".output/**",
    "dist/**",
    ".source/**",
    "src/routeTree.gen.ts",
  ],
  overrides: [
    {
      files: ["e2e/**"],
      // The vitest preset lints test files with its plugin; enable it here so
      // its rules can be configured for these files.
      plugins: ["vitest"],
      rules: {
        // Code passed to page.evaluate() runs in the browser, so its helpers must be defined inside it.
        "unicorn/consistent-function-scoping": "off",
        // Playwright tests: `test` and `expect` come from @playwright/test.
        "vitest/prefer-importing-vitest-globals": "off",
      },
    },
  ],
});
