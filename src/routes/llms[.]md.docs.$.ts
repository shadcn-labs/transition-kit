import { createFileRoute } from "@tanstack/react-router";

import { docsMarkdown } from "@/src/server/docs-markdown";

export const Route = createFileRoute("/llms.md/docs/$")({
  server: {
    handlers: {
      GET: ({ params }) => docsMarkdown(params._splat, true),
      HEAD: ({ params }) => docsMarkdown(params._splat, false),
    },
  },
});
