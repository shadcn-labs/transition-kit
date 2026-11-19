import { createFileRoute } from "@tanstack/react-router";

import { handleMe } from "@/src/server/pro";

export const Route = createFileRoute("/api/me")({
  server: {
    handlers: {
      GET: ({ request }) => handleMe(request),
    },
  },
});
