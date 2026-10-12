import { createFileRoute } from "@tanstack/react-router";

import { GET, HEAD } from "@/src/server/home-markdown";

export const Route = createFileRoute("/llms.md/content.md")({
  server: {
    handlers: {
      GET: ({ request }) => GET(request),
      HEAD: ({ request }) => HEAD(request),
    },
  },
});
