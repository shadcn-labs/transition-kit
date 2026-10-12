import { createFileRoute } from "@tanstack/react-router";

import { GET } from "@/src/server/rss";

export const Route = createFileRoute("/rss.xml")({
  server: {
    handlers: {
      GET: () => GET(),
    },
  },
});
