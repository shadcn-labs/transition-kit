import { createFileRoute } from "@tanstack/react-router";

import { GET } from "@/src/server/agent-skill";

export const Route = createFileRoute("/.well-known/agent-skills/site-skill.md")(
  {
    server: {
      handlers: {
        GET: () => GET(),
      },
    },
  }
);
