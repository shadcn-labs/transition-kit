import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  out: "./drizzle",
  schema: "./lib/db/schema.ts",
});
