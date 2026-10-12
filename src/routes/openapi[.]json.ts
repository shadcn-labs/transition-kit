import { createFileRoute } from "@tanstack/react-router";

import { GET } from "@/src/server/openapi";

export const Route = createFileRoute("/openapi.json")({
  server: {
    handlers: {
      GET: ({ request }) => GET(request),
    },
  },
});
