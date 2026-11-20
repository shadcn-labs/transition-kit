import { createFileRoute } from "@tanstack/react-router";

import { handleProRegistry } from "@/src/server/pro";

export const Route = createFileRoute("/r/$name")({
  server: {
    handlers: {
      GET: ({ params, request }) => handleProRegistry(request, params.name),
    },
  },
});
