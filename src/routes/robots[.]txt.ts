import { createFileRoute } from "@tanstack/react-router";

import { GET } from "@/src/server/robots";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: () => GET(),
    },
  },
});
