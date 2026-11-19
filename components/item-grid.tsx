"use client";

import { Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";
import type { ReactNode } from "react";

import { docsPathForItem } from "@/lib/docs";
import { cn } from "@/lib/utils";
import { items } from "@/registry/items";
import type { ItemGroup, ItemKind, ItemSource } from "@/registry/items";

type CardItem = Pick<ItemSource, "name" | "title" | "description" | "isNew">;

const docsLink = (name: string) => ({
  params: { _splat: `components/${docsPathForItem(name)}` },
  to: "/docs/$" as const,
  viewTransition: { types: ["nav-forward"] },
});

const playPreview = (event: React.SyntheticEvent<HTMLElement>) => {
  void event.currentTarget.querySelector("video")?.play();
};

const pausePreview = (event: React.SyntheticEvent<HTMLElement>) => {
  event.currentTarget.querySelector("video")?.pause();
};

export const ItemCard = ({
  item,
  preview,
  video,
  meta,
  badge,
  className,
}: {
  item: CardItem;
  badge?: ReactNode;
  /** Interactive, so it is rendered outside the docs link. */
  preview?: ReactNode;
  video?: string;
  meta?: string;
  className?: string;
}) => (
  <article
    data-slot="item-card"
    className={cn(
      "bezel has-[[data-slot=item-card-link]:hover]:border-foreground/20 flex min-w-0 flex-col transition-colors duration-150",
      className
    )}
    {...(video && {
      onBlur: pausePreview,
      onFocus: playPreview,
      onMouseEnter: playPreview,
      onMouseLeave: pausePreview,
    })}
  >
    {video && (
      <Link
        {...docsLink(item.name)}
        tabIndex={-1}
        aria-hidden
        data-slot="item-card-link"
        className="bezel-inner bg-muted aspect-video overflow-hidden"
      >
        <video
          src={`${video}#t=0.1`}
          className="size-full object-cover"
          muted
          loop
          playsInline
          preload="metadata"
        />
      </Link>
    )}
    {preview && (
      <div className="bezel-inner flex flex-1 flex-col overflow-hidden">
        {preview}
      </div>
    )}
    <div
      className={cn(
        "mt-auto rounded-[calc(var(--radius-xl)-4px)] transition-colors duration-150 has-[[data-slot=item-card-link]:hover]:bg-background/60",
        !video && !preview && "bezel-inner"
      )}
    >
      <Link
        {...docsLink(item.name)}
        data-slot="item-card-link"
        className="group/link focus-visible:ring-ring/50 flex items-center justify-between gap-4 rounded-[inherit] px-3 py-3 outline-none focus-visible:ring-[3px] focus-visible:ring-inset"
      >
        <span className="flex min-w-0 flex-col gap-1">
          <span className="text-foreground flex items-center gap-2 text-sm font-medium">
            {item.title}
            {badge}
            {item.isNew && (
              <span className="text-muted-foreground text-xs font-normal">
                New
              </span>
            )}
            {meta && (
              <span className="text-muted-foreground text-xs font-normal">
                {meta}
              </span>
            )}
          </span>
          <span className="text-muted-foreground line-clamp-2 text-sm">
            {item.description}
          </span>
        </span>
        <ArrowRightIcon
          className="text-muted-foreground size-4 shrink-0 transition-transform duration-150 group-hover/link:translate-x-0.5"
          aria-hidden="true"
        />
      </Link>
    </div>
  </article>
);

/** Cards for a group's styles, linking to their docs pages. */
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
      {visible.map((item) => (
        <ItemCard key={item.name} item={item} video={item.video} />
      ))}
    </div>
  );
};
