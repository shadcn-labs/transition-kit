import { createFileRoute } from "@tanstack/react-router";

import { handleCheckout } from "@/src/server/pro";

export const Route = createFileRoute("/api/checkout")({
  server: {
    handlers: {
      POST: ({ request }) => handleCheckout(request),
    },
  },
});
