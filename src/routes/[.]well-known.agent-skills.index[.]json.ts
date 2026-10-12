import { createFileRoute } from "@tanstack/react-router";

import { GET } from "@/src/server/agent-skills-index";

export const Route = createFileRoute("/.well-known/agent-skills/index.json")({
  server: {
    handlers: {
      GET: ({ request }) => GET(request),
    },
  },
});
