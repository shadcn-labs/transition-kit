import { createFileRoute } from "@tanstack/react-router";

import { handleWebhook, handleWebhookInfo } from "@/src/server/pro";

export const Route = createFileRoute("/api/webhooks/dodo")({
  server: {
    handlers: {
      GET: () => handleWebhookInfo(),
      POST: ({ request }) => handleWebhook(request),
    },
  },
});
