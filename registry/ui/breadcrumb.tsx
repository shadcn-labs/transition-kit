"use client";

import { ChevronRight } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";
import { BACK, FORWARD, tk } from "@/registry/ui/ui-transition";

interface BreadcrumbItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
}

const enter = {
  [BACK]: tk("tk-fade"),
  [FORWARD]: tk("tk-slide", "tk-forward"),
  default: tk("tk-pop"),
};

const exit = {
  [BACK]: tk("tk-slide", "tk-back"),
  [FORWARD]: tk("tk-fade"),
  default: tk("tk-pop"),
};

const Breadcrumb = ({
  items,
  onNavigate,
  maxItems = 4,
  separator,
  className,
  "aria-label": ariaLabel = "Breadcrumb",
  ...props
}: React.ComponentProps<"nav"> & {
  items: BreadcrumbItem[];
  /** Called with the crumb's id and index, inside a transition marked `BACK`. */
  onNavigate?: (id: string, index: number) => void;
  /** Longer paths keep the first crumb and the last `maxItems - 1`. */
  maxItems?: number;
  separator?: React.ReactNode;
}) => {
  const [expanded, setExpanded] = React.useState(false);
  const keep = Math.max(Math.floor(maxItems), 2);
  const collapsible = !expanded && items.length > keep;
  const hiddenIds = collapsible
    ? new Set(items.slice(1, items.length - keep + 1).map((item) => item.id))
    : null;

  const navigate = (id: string, index: number) => {
    if (index === items.length - 1) {
      return;
    }
    React.startTransition(() => {
      React.addTransitionType(BACK);
      setExpanded(false);
      onNavigate?.(id, index);
    });
  };

  const expand = () => {
    React.startTransition(() => setExpanded(true));
  };

  const divider = (
    <span
      aria-hidden
      data-slot="breadcrumb-separator"
      className="text-muted-foreground/60 [&_svg]:size-3.5"
    >
      {separator ?? <ChevronRight />}
    </span>
  );

  return (
    <nav
      aria-label={ariaLabel}
      data-slot="breadcrumb"
      className={cn("min-w-0", className)}
      {...props}
    >
      <ol
        data-slot="breadcrumb-list"
        className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words"
      >
        {items.map((item, index) => {
          if (hiddenIds?.has(item.id)) {
            return index === 1 ? (
              <React.ViewTransition
                key="ellipsis"
                default="none"
                enter={tk("tk-pop")}
                exit={tk("tk-pop")}
                update={tk("tk-morph")}
              >
                <li
                  data-slot="breadcrumb-ellipsis"
                  className="flex items-center gap-1.5"
                >
                  <button
                    type="button"
                    aria-label={`Show ${hiddenIds.size} more`}
                    onClick={expand}
                    className="hover:bg-accent hover:text-foreground focus-visible:ring-ring/50 flex h-6 cursor-pointer items-center rounded-md px-1.5 outline-none transition-colors focus-visible:ring-[3px]"
                  >
                    …
                  </button>
                  {divider}
                </li>
              </React.ViewTransition>
            ) : null;
          }
          const current = index === items.length - 1;
          return (
            <React.ViewTransition
              key={item.id}
              default="none"
              enter={enter}
              exit={exit}
              update={tk("tk-morph")}
            >
              <li
                data-slot="breadcrumb-item"
                data-current={current ? "" : undefined}
                className="flex min-w-0 items-center gap-1.5"
              >
                {current ? (
                  <span
                    aria-current="page"
                    data-slot="breadcrumb-page"
                    className="text-foreground flex items-center gap-1.5 font-medium [&_svg]:size-4"
                  >
                    {item.icon}
                    {item.label}
                  </span>
                ) : (
                  <>
                    <button
                      type="button"
                      data-slot="breadcrumb-link"
                      onClick={() => navigate(item.id, index)}
                      className="hover:text-foreground focus-visible:ring-ring/50 flex cursor-pointer items-center gap-1.5 rounded-sm outline-none transition-colors focus-visible:ring-[3px] [&_svg]:size-4"
                    >
                      {item.icon}
                      {item.label}
                    </button>
                    {divider}
                  </>
                )}
              </li>
            </React.ViewTransition>
          );
        })}
      </ol>
    </nav>
  );
};

export { Breadcrumb };
export type { BreadcrumbItem };
