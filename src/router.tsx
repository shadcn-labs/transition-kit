import { createRouter } from "@tanstack/react-router";
import type { Router } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";

export type AppRouter = Router<typeof routeTree>;

export const getRouter = () =>
  createRouter({
    defaultPreload: "intent",
    routeTree,
    scrollRestoration: true,
  });

declare module "@tanstack/react-router" {
  interface Register {
    router: AppRouter;
  }
}
