import { createFileRoute } from "@tanstack/react-router";

import { GET } from "@/src/server/llms";

export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: ({ request }) => GET(request),
    },
  },
});
