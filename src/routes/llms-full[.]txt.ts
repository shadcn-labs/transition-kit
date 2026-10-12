import { createFileRoute } from "@tanstack/react-router";

import { GET } from "@/src/server/llms-full";

export const Route = createFileRoute("/llms-full.txt")({
  server: {
    handlers: {
      GET: () => GET(),
    },
  },
});
