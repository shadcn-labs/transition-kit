"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { tk, useTransitionNames } from "@/registry/ui/ui-transition";

type Size = "sm" | "md" | "lg";

interface AvatarGroupItem {
  name: string;
  src?: string;
  fallback?: string;
}

const sizes: Record<Size, string> = {
  lg: "size-12 text-sm",
  md: "size-10 text-xs",
  sm: "size-8 text-[0.625rem]",
};

const overlaps: Record<Size, string> = {
  lg: "-ms-4",
  md: "-ms-3",
  sm: "-ms-2.5",
};

const tints = [
  "bg-chart-1/30 text-foreground",
  "bg-chart-2/30 text-foreground",
  "bg-chart-3/30 text-foreground",
  "bg-chart-4/30 text-foreground",
  "bg-chart-5/30 text-foreground",
];

const tint = (name: string) => {
  let sum = 0;
  for (const char of name) {
    sum += char.codePointAt(0) ?? 0;
  }
  return tints[sum % tints.length];
};

const initials = (name: string) =>
  name
    .split(/\s+/u)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

const AvatarFace = ({ item, size }: { item: AvatarGroupItem; size: Size }) => {
  const [failed, setFailed] = React.useState(false);
  const image = item.src && !failed;
  return (
    <span
      data-slot="avatar-group-avatar"
      title={item.name}
      className={cn(
        "ring-background relative flex shrink-0 items-center justify-center overflow-hidden rounded-full font-medium ring-2 select-none",
        image ? "bg-muted" : tint(item.name),
        sizes[size]
      )}
    >
      {image ? (
        <img
          src={item.src}
          alt={item.name}
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <>
          <span aria-hidden>{item.fallback ?? initials(item.name)}</span>
          <span className="sr-only">{item.name}</span>
        </>
      )}
    </span>
  );
};

const AvatarGroup = ({
  items,
  max = 4,
  size = "md",
  expanded: expandedProp,
  defaultExpanded = false,
  onExpandedChange,
  className,
  "aria-label": ariaLabel = "People",
  ...props
}: React.ComponentProps<"div"> & {
  items: AvatarGroupItem[];
  max?: number;
  size?: Size;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}) => {
  const [uncontrolled, setUncontrolled] = React.useState(defaultExpanded);
  const expanded = expandedProp ?? uncontrolled;
  const name = useTransitionNames();
  const limit = Math.max(Math.floor(max), 1);
  const hidden = Math.max(items.length - limit, 0);
  const shown = expanded ? items : items.slice(0, limit);

  const pending = React.useRef<boolean | null>(null);

  React.useLayoutEffect(() => {
    pending.current = null;
  });

  const toggle = () => {
    const next = !(pending.current ?? expanded);
    pending.current = next;
    React.startTransition(() => {
      setUncontrolled(next);
      onExpandedChange?.(next);
    });
  };

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      data-slot="avatar-group"
      data-state={expanded ? "expanded" : "collapsed"}
      className={cn("w-fit", className)}
      {...props}
    >
      <ul
        data-slot="avatar-group-list"
        className="flex flex-wrap items-center gap-y-2"
      >
        {shown.map((item, index) => {
          const extra = index >= limit;
          return (
            <React.ViewTransition
              key={`${item.name}-${index}`}
              default="none"
              enter={tk(
                "tk-pop",
                extra && `tk-delay-${Math.min(index - limit + 1, 8)}`
              )}
              exit={tk("tk-pop")}
              update={tk("tk-morph")}
            >
              <li
                data-slot="avatar-group-item"
                className={cn(
                  "flex",
                  index > 0 && (expanded ? "ms-1.5" : overlaps[size])
                )}
              >
                <AvatarFace item={item} size={size} />
              </li>
            </React.ViewTransition>
          );
        })}
        {hidden > 0 ? (
          <React.ViewTransition
            name={name("toggle")}
            default="none"
            update={tk("tk-morph")}
          >
            <li data-slot="avatar-group-more" className="flex">
              <button
                type="button"
                aria-expanded={expanded}
                aria-label={expanded ? "Show fewer" : `Show ${hidden} more`}
                data-slot="avatar-group-toggle"
                onClick={toggle}
                className={cn(
                  "bg-secondary text-secondary-foreground ring-background hover:bg-accent focus-visible:ring-ring/50 relative flex shrink-0 cursor-pointer items-center justify-center rounded-full font-medium tabular-nums ring-2 outline-none transition-colors focus-visible:ring-[3px]",
                  sizes[size],
                  expanded ? "ms-1.5" : overlaps[size]
                )}
              >
                <React.ViewTransition
                  key={expanded ? "less" : "more"}
                  default="none"
                  enter={tk("tk-blur")}
                  exit={tk("tk-blur")}
                >
                  <span aria-hidden>{expanded ? "−" : `+${hidden}`}</span>
                </React.ViewTransition>
              </button>
            </li>
          </React.ViewTransition>
        ) : null}
      </ul>
    </div>
  );
};

export { AvatarGroup };
export type { AvatarGroupItem };
