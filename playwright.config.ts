import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;
const BASE_URL = `http://localhost:${PORT}`;
const isCI = Boolean(process.env.CI);

/** Phone, tablet and desktop widths, each with a typical height. */
const VIEWPORTS = [
  { height: 800, width: 360 },
  { height: 1024, width: 768 },
  { height: 800, width: 1280 },
];

export default defineConfig({
  forbidOnly: isCI,
  projects: VIEWPORTS.map((viewport) => ({
    name: `${viewport.width}px`,
    use: { ...devices["Desktop Chrome"], viewport },
  })),
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : "list",
  retries: isCI ? 2 : 0,
  testDir: "e2e",
  use: {
    baseURL: BASE_URL,
    // Entrance animations are gated on motion, so pages settle into their final layout.
    contextOptions: { reducedMotion: "reduce" },
    trace: "on-first-retry",
  },
  // Serves the production build: run `pnpm build` first.
  webServer: {
    command: `pnpm preview --port ${PORT} --strictPort`,
    reuseExistingServer: !isCI,
    url: BASE_URL,
  },
});
