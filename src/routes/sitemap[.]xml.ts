import { createFileRoute } from "@tanstack/react-router";

import { GET } from "@/src/server/sitemap";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () => GET(),
    },
  },
});
