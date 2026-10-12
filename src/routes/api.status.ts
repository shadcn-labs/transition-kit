import { createFileRoute } from "@tanstack/react-router";

import { GET } from "@/src/server/status";

export const Route = createFileRoute("/api/status")({
  server: {
    handlers: {
      GET: () => GET(),
    },
  },
});
