import { createFileRoute } from "@tanstack/react-router";

import { GET } from "@/src/server/manifest";

export const Route = createFileRoute("/manifest.webmanifest")({
  server: {
    handlers: {
      GET: () => GET(),
    },
  },
});
