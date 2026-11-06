import { Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";
import type { ComponentType } from "react";

import { ROUTES } from "@/constants/routes";
import { AddToCartDemo } from "@/examples/ui/add-to-cart-demo";
import { DynamicIslandDemo } from "@/examples/ui/dynamic-island-demo";
import { ExpandableCardDemo } from "@/examples/ui/expandable-card-demo";
import { KanbanBoardDemo } from "@/examples/ui/kanban-board-demo";
import { MorphingPopoverDemo } from "@/examples/ui/morphing-popover-demo";
import { NumberFlipDemo } from "@/examples/ui/number-flip-demo";
import { StackNavigatorDemo } from "@/examples/ui/stack-navigator-demo";
import { StatusButtonDemo } from "@/examples/ui/status-button-demo";
import { TabsDemo } from "@/examples/ui/tabs-demo";
import { docsPathForItem } from "@/lib/docs";
import { cn } from "@/lib/utils";
import { getItem } from "@/registry/items";

/** Live demos on the home page. `wide` tiles span two columns on large screens. */
const TILES: { name: string; Demo: ComponentType; wide?: boolean }[] = [
  { Demo: ExpandableCardDemo, name: "expandable-card", wide: true },
  { Demo: DynamicIslandDemo, name: "dynamic-island" },
  { Demo: TabsDemo, name: "tabs" },
  { Demo: MorphingPopoverDemo, name: "morphing-popover" },
  { Demo: NumberFlipDemo, name: "number-flip" },
  { Demo: StatusButtonDemo, name: "status-button" },
  { Demo: AddToCartDemo, name: "add-to-cart", wide: true },
  { Demo: KanbanBoardDemo, name: "kanban-board", wide: true },
  { Demo: StackNavigatorDemo, name: "stack-navigator" },
];

export const HomeGallery = () => (
  <section className="container-wrapper pb-16 md:pb-24">
    <div className="container flex flex-col gap-8">
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Play with them
          </h2>
          <p className="text-muted-foreground text-sm">
            Every tile is the real component. Click around.
          </p>
        </div>
        <Link
          to="/docs/$"
          params={{
            _splat: ROUTES.DOCS_COMPONENTS.slice(ROUTES.DOCS.length + 1),
          }}
          viewTransition={{ types: ["nav-forward"] }}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 inline-flex shrink-0 items-center gap-1 rounded-sm text-sm outline-none focus-visible:ring-[3px]"
        >
          All components
          <ArrowRightIcon className="size-3.5" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {TILES.map(({ Demo, name, wide }) => {
          const item = getItem(name);
          return (
            <article
              key={name}
              className={cn(
                "reveal bg-card flex min-w-0 flex-col overflow-hidden rounded-xl border",
                wide && "lg:col-span-2"
              )}
            >
              <div className="@container flex min-h-80 flex-1 items-center justify-center p-6">
                <Demo />
              </div>
              <Link
                to="/docs/$"
                params={{ _splat: `components/${docsPathForItem(name)}` }}
                viewTransition={{ types: ["nav-forward"] }}
                className="group hover:bg-muted/40 focus-visible:ring-ring/50 flex items-center justify-between gap-3 border-t px-4 py-3 text-sm transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-inset"
              >
                <span className="min-w-0">
                  <span className="font-medium">{item?.title ?? name}</span>
                  <span className="text-muted-foreground hidden truncate sm:block">
                    {item?.description}
                  </span>
                </span>
                <ArrowRightIcon
                  className="text-muted-foreground size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  </section>
);
