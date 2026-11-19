import { createFileRoute } from "@tanstack/react-router";

import { handleApiKey } from "@/src/server/pro";

export const Route = createFileRoute("/api/api-key")({
  server: {
    handlers: {
      DELETE: ({ request }) => handleApiKey(request),
      GET: ({ request }) => handleApiKey(request),
      POST: ({ request }) => handleApiKey(request),
    },
  },
});
