import { createFileRoute } from "@tanstack/react-router";

import { GET, HEAD } from "@/src/server/api-catalog";

export const Route = createFileRoute("/.well-known/api-catalog")({
  server: {
    handlers: {
      GET: ({ request }) => GET(request),
      HEAD: () => HEAD(),
    },
  },
});
