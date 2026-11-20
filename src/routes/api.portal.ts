import { createFileRoute } from "@tanstack/react-router";

import { handlePortal } from "@/src/server/pro";

export const Route = createFileRoute("/api/portal")({
  server: {
    handlers: {
      POST: ({ request }) => handlePortal(request),
    },
  },
});
