"use client";

import { Link } from "@tanstack/react-router";
import {
  ArrowDownUpIcon,
  CircleCheckIcon,
  ComponentIcon,
  FilterIcon,
  GalleryHorizontalIcon,
  GalleryThumbnailsIcon,
  HashIcon,
  KanbanIcon,
  LayersIcon,
  LayoutGridIcon,
  ListCollapseIcon,
  ListIcon,
  ListOrderedIcon,
  MessageSquareIcon,
  PanelTopIcon,
  PillIcon,
  ShoppingCartIcon,
  SlidersHorizontalIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { items } from "@/registry/items";
import type { ItemGroup, ItemKind } from "@/registry/items";

/** Icons for the preview tile of UI components, which have no video. */
const UI_ICONS: Record<string, LucideIcon> = {
  "ui/accordion": ListCollapseIcon,
  "ui/add-to-cart": ShoppingCartIcon,
  "ui/animated-list": ListIcon,
  "ui/carousel": GalleryHorizontalIcon,
  "ui/dynamic-island": PillIcon,
  "ui/filter-grid": FilterIcon,
  "ui/kanban-board": KanbanIcon,
  "ui/layout-switcher": LayoutGridIcon,
  "ui/morphing-popover": MessageSquareIcon,
  "ui/number-flip": HashIcon,
  "ui/product-gallery": GalleryThumbnailsIcon,
  "ui/segmented-control": SlidersHorizontalIcon,
  "ui/sortable-table": ArrowDownUpIcon,
  "ui/stack-navigator": LayersIcon,
  "ui/status-button": CircleCheckIcon,
  "ui/step-wizard": ListOrderedIcon,
  "ui/tabs": PanelTopIcon,
};

/** Plays a preview while it is hovered or focused. */
const playPreview = (event: React.SyntheticEvent<HTMLElement>) => {
  void event.currentTarget.querySelector("video")?.play();
};

const pausePreview = (event: React.SyntheticEvent<HTMLElement>) => {
  event.currentTarget.querySelector("video")?.pause();
};

/** Cards for a group's catalog items, linking to their docs pages. */
export const ItemGrid = ({
  group,
  kind,
  className,
}: {
  group: ItemGroup;
  kind?: ItemKind;
  className?: string;
}) => {
  const visible = items.filter(
    (item) =>
      item.group === group && (kind ? item.kind === kind : item.kind !== "core")
  );

  return (
    <div
      className={cn("not-prose mt-6 grid gap-4 sm:grid-cols-2", className)}
      data-slot="item-grid"
    >
      {visible.map((item) => {
        const Icon = UI_ICONS[item.name] ?? ComponentIcon;
        return (
          <Link
            key={item.name}
            to="/docs/$"
            params={{ _splat: `components/${item.name}` }}
            viewTransition={{ types: ["nav-forward"] }}
            className="group/item bg-card hover:bg-accent/40 focus-visible:ring-ring/50 flex flex-col overflow-hidden rounded-xl border transition-colors outline-none focus-visible:ring-[3px]"
            onMouseEnter={playPreview}
            onMouseLeave={pausePreview}
            onFocus={playPreview}
            onBlur={pausePreview}
          >
            {item.video && (
              <div className="bg-muted aspect-video overflow-hidden border-b">
                <video
                  src={`${item.video}#t=0.1`}
                  className="size-full object-cover"
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-hidden
                />
              </div>
            )}
            {item.group === "ui" && (
              <div
                className="bg-muted/50 flex aspect-video items-center justify-center overflow-hidden border-b bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] [background-size:16px_16px]"
                aria-hidden
              >
                <div className="bg-background text-muted-foreground group-hover/item:text-foreground group-focus-visible/item:text-foreground flex size-14 items-center justify-center rounded-xl border shadow-xs transition-[color,scale] duration-200 group-hover/item:scale-105 group-focus-visible/item:scale-105">
                  <Icon className="size-6" />
                </div>
              </div>
            )}
            <div className="flex flex-col gap-1 p-4">
              <div className="flex items-center gap-2 font-medium">
                {item.title}
                {item.isNew && (
                  <Badge variant="secondary" className="rounded-full">
                    New
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
};
