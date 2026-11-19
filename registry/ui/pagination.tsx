"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";
import {
  BACK,
  FORWARD,
  tk,
  useTransitionNames,
} from "@/registry/ui/ui-transition";

type Size = "sm" | "md";
type PageItem = number | "start-ellipsis" | "end-ellipsis";

const range = (from: number, to: number) =>
  Array.from(
    { length: Math.max(to - from + 1, 0) },
    (_, index) => from + index
  );

/** Keeps the item count constant, so pages slide through a fixed window. */
const pageItems = (
  page: number,
  total: number,
  siblings: number,
  boundaries: number
): PageItem[] => {
  if (total <= boundaries * 2 + siblings * 2 + 3) {
    return range(1, total);
  }
  const start = Math.max(
    Math.min(page - siblings, total - boundaries - siblings * 2 - 1),
    boundaries + 2
  );
  const end = Math.min(
    Math.max(page + siblings, boundaries + siblings * 2 + 2),
    total - boundaries - 1
  );
  return [
    ...range(1, boundaries),
    start > boundaries + 2 ? "start-ellipsis" : boundaries + 1,
    ...range(start, end),
    end < total - boundaries - 1 ? "end-ellipsis" : total - boundaries,
    ...range(total - boundaries + 1, total),
  ];
};

const itemSizes: Record<Size, string> = {
  md: "h-9 min-w-9 px-2 text-sm",
  sm: "h-8 min-w-7 px-1 text-xs",
};

const gaps: Record<Size, string> = { md: "gap-1", sm: "gap-0.5" };

const Pagination = ({
  total,
  page: pageProp,
  defaultPage = 1,
  onPageChange,
  siblings = 1,
  boundaries = 1,
  size = "md",
  disabled = false,
  className,
  "aria-label": ariaLabel = "Pagination",
  ...props
}: React.ComponentProps<"nav"> & {
  total: number;
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  /** Pages shown on each side of the current one. */
  siblings?: number;
  /** Pages always shown at the start and end. */
  boundaries?: number;
  size?: Size;
  disabled?: boolean;
}) => {
  const [uncontrolled, setUncontrolled] = React.useState(defaultPage);
  const count = Math.max(Math.floor(total), 1);
  const page = Math.min(Math.max(pageProp ?? uncontrolled, 1), count);
  const name = useTransitionNames();

  const pending = React.useRef<number | null>(null);

  React.useLayoutEffect(() => {
    pending.current = null;
  });

  const go = (resolve: (from: number) => number) => {
    const from = pending.current ?? page;
    const target = Math.min(Math.max(resolve(from), 1), count);
    if (target === from || disabled) {
      return;
    }
    pending.current = target;
    React.startTransition(() => {
      React.addTransitionType(target > from ? FORWARD : BACK);
      setUncontrolled(target);
      onPageChange?.(target);
    });
  };

  const arrow =
    "text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring/50 inline-flex cursor-pointer items-center justify-center rounded-md outline-none transition-colors focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4";

  return (
    <nav
      aria-label={ariaLabel}
      data-slot="pagination"
      data-size={size}
      className={cn("flex w-fit items-center", gaps[size], className)}
      {...props}
    >
      <button
        type="button"
        aria-label="Previous page"
        disabled={disabled || page === 1}
        data-slot="pagination-previous"
        onClick={() => go((from) => from - 1)}
        className={cn(arrow, itemSizes[size])}
      >
        <ChevronLeft aria-hidden />
      </button>
      <ul
        data-slot="pagination-list"
        className={cn("flex items-center", gaps[size])}
      >
        {pageItems(page, count, siblings, boundaries).map((item) => {
          if (typeof item !== "number") {
            return (
              <React.ViewTransition
                key={item}
                default="none"
                enter={tk("tk-pop")}
                exit={tk("tk-pop")}
                update={tk("tk-morph")}
              >
                <li
                  aria-hidden
                  data-slot="pagination-ellipsis"
                  className={cn(
                    "text-muted-foreground flex items-center justify-center",
                    itemSizes[size]
                  )}
                >
                  …
                </li>
              </React.ViewTransition>
            );
          }
          const current = item === page;
          return (
            <React.ViewTransition
              key={item}
              default="none"
              enter={tk("tk-pop")}
              exit={tk("tk-pop")}
              update={tk("tk-morph", "tk-top")}
            >
              <li data-slot="pagination-item" data-current-page={page}>
                <button
                  type="button"
                  aria-label={`Page ${item}`}
                  aria-current={current ? "page" : undefined}
                  disabled={disabled}
                  data-state={current ? "active" : "inactive"}
                  onClick={() => go(() => item)}
                  className={cn(
                    "focus-visible:ring-ring/50 relative inline-flex cursor-pointer items-center justify-center rounded-md font-medium tabular-nums outline-none transition-colors focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50",
                    "text-muted-foreground hover:text-foreground data-[state=active]:text-primary-foreground",
                    itemSizes[size]
                  )}
                >
                  {current ? (
                    <React.ViewTransition
                      name={name("pill")}
                      default="none"
                      share={tk("tk-morph", "tk-spring")}
                    >
                      <span
                        aria-hidden
                        data-slot="pagination-pill"
                        className="bg-primary absolute inset-0 rounded-md shadow-sm"
                      />
                    </React.ViewTransition>
                  ) : null}
                  <span className="relative">{item}</span>
                </button>
              </li>
            </React.ViewTransition>
          );
        })}
      </ul>
      <button
        type="button"
        aria-label="Next page"
        disabled={disabled || page === count}
        data-slot="pagination-next"
        onClick={() => go((from) => from + 1)}
        className={cn(arrow, itemSizes[size])}
      >
        <ChevronRight aria-hidden />
      </button>
    </nav>
  );
};

export { Pagination };
