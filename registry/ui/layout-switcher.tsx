"use client";

import { LayoutGrid, List } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";
import { tk, useTransitionNames } from "@/registry/ui/ui-transition";
import type { TransitionNames } from "@/registry/ui/ui-transition";

type Layout = "grid" | "list";

const layouts: Layout[] = ["grid", "list"];

interface LayoutSwitcherContextValue {
  layout: Layout;
  name: TransitionNames;
  select: (layout: Layout) => void;
}

const LayoutSwitcherContext =
  React.createContext<LayoutSwitcherContextValue | null>(null);

const useLayoutSwitcher = () => {
  const context = React.useContext(LayoutSwitcherContext);
  if (!context) {
    throw new Error(
      "LayoutSwitcher parts must be used within <LayoutSwitcher>."
    );
  }
  return context;
};

const LayoutSwitcherItemContext = React.createContext<string | null>(null);

/** The item id, so every part of one item keeps its transition name. */
const useItemValue = () => {
  const value = React.useContext(LayoutSwitcherItemContext);
  if (value === null) {
    throw new Error(
      "LayoutSwitcherItem parts must be used within <LayoutSwitcherItem>."
    );
  }
  return value;
};

/**
 * Names one part of an item after the item, so it keeps its identity (and
 * glides) across layouts, even if a layout renders it somewhere else.
 */
const LayoutSwitcherPart = ({
  part,
  transition,
  children,
}: {
  part: string;
  transition: string;
  children: React.ReactElement;
}) => {
  const { name } = useLayoutSwitcher();
  const value = useItemValue();
  return (
    <React.ViewTransition
      name={name(part, value)}
      default={transition}
      enter="none"
      exit="none"
    >
      {children}
    </React.ViewTransition>
  );
};

const LayoutSwitcher = ({
  layout: layoutProp,
  defaultLayout = "grid",
  onLayoutChange,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  layout?: Layout;
  defaultLayout?: Layout;
  onLayoutChange?: (layout: Layout) => void;
}) => {
  const [uncontrolled, setUncontrolled] = React.useState(defaultLayout);
  const name = useTransitionNames();
  const layout = layoutProp ?? uncontrolled;

  const select = React.useCallback(
    (next: Layout) => {
      if (next === layout) {
        return;
      }
      React.startTransition(() => {
        setUncontrolled(next);
        onLayoutChange?.(next);
      });
    },
    [layout, onLayoutChange]
  );

  const context = React.useMemo(
    () => ({ layout, name, select }),
    [layout, name, select]
  );

  return (
    <LayoutSwitcherContext.Provider value={context}>
      <div
        data-slot="layout-switcher"
        data-layout={layout}
        className={cn("@container flex flex-col gap-3", className)}
        {...props}
      />
    </LayoutSwitcherContext.Provider>
  );
};

const toggleIcons = { grid: LayoutGrid, list: List } as const;

const LayoutSwitcherToggle = ({
  labels = { grid: "Grid", list: "List" },
  className,
  onKeyDown,
  ...props
}: React.ComponentProps<"div"> & {
  /** Accessible names of the two options. */
  labels?: Record<Layout, string>;
}) => {
  const { layout, name, select } = useLayoutSwitcher();
  const groupRef = React.useRef<HTMLDivElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    const index = layouts.indexOf(layout);
    const next = layouts[(index + 1) % layouts.length];
    const previous = layouts[(index - 1 + layouts.length) % layouts.length];
    const target = {
      ArrowDown: next,
      ArrowLeft: previous,
      ArrowRight: next,
      ArrowUp: previous,
      End: layouts.at(-1),
      Home: layouts[0],
    }[event.key];
    if (target === undefined || event.defaultPrevented) {
      return;
    }
    event.preventDefault();
    select(target);
    groupRef.current
      ?.querySelector<HTMLElement>(`[data-value="${target}"]`)
      ?.focus();
  };

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label="Layout"
      data-slot="layout-switcher-toggle"
      onKeyDown={handleKeyDown}
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-8 w-fit items-center rounded-lg p-[3px]",
        className
      )}
      {...props}
    >
      {layouts.map((option) => {
        const checked = option === layout;
        const Icon = toggleIcons[option];
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={labels[option]}
            tabIndex={checked ? 0 : -1}
            data-value={option}
            data-state={checked ? "on" : "off"}
            onClick={() => select(option)}
            className="hover:text-foreground focus-visible:ring-ring/50 data-[state=on]:text-foreground relative inline-flex h-full cursor-pointer items-center justify-center rounded-md px-2 transition-colors outline-none focus-visible:ring-[3px]"
          >
            {/* Rendered in one option at a time: React pairs the old and new pill. */}
            {checked ? (
              <React.ViewTransition
                name={name("indicator")}
                default="none"
                share={tk("tk-morph")}
              >
                <span
                  aria-hidden
                  data-slot="layout-switcher-indicator"
                  className="bg-background dark:bg-input/30 dark:ring-input absolute inset-0 rounded-md shadow-sm dark:ring-1"
                />
              </React.ViewTransition>
            ) : null}
            {/* tk-top keeps both icons above the indicator gliding past them. */}
            <React.ViewTransition
              default="none"
              update={tk("tk-morph", "tk-top")}
            >
              <Icon aria-hidden className="relative size-4" />
            </React.ViewTransition>
          </button>
        );
      })}
    </div>
  );
};

const LayoutSwitcherItems = ({
  className,
  ...props
}: React.ComponentProps<"ul">) => {
  const { layout } = useLayoutSwitcher();
  return (
    // Outermost, so any background grows behind the items.
    <React.ViewTransition default="none" update={tk("tk-morph", "tk-clip")}>
      <ul
        data-slot="layout-switcher-items"
        data-layout={layout}
        className={cn(
          layout === "grid"
            ? "grid grid-cols-2 gap-3 @md:grid-cols-3"
            : "flex flex-col gap-2",
          className
        )}
        {...props}
      />
    </React.ViewTransition>
  );
};

const LayoutSwitcherItem = ({
  value,
  className,
  ...props
}: React.ComponentProps<"li"> & {
  /** Unique, stable id of the item: pairs its parts across layouts. */
  value: string;
}) => {
  const { layout } = useLayoutSwitcher();
  return (
    <LayoutSwitcherItemContext.Provider value={value}>
      <LayoutSwitcherPart
        part="item"
        transition={tk("tk-morph", "tk-layout-switcher-surface")}
      >
        <li
          data-slot="layout-switcher-item"
          data-layout={layout}
          className={cn(
            "bg-card text-card-foreground flex min-w-0 rounded-xl border",
            layout === "grid"
              ? "flex-col items-start gap-3 p-4"
              : "flex-row items-center gap-3 px-3 py-2.5",
            className
          )}
          {...props}
        />
      </LayoutSwitcherPart>
    </LayoutSwitcherItemContext.Provider>
  );
};

const LayoutSwitcherItemMedia = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  const { layout } = useLayoutSwitcher();
  return (
    <LayoutSwitcherPart part="media" transition={tk("tk-morph")}>
      <div
        data-slot="layout-switcher-item-media"
        data-layout={layout}
        className={cn(
          "bg-muted relative flex shrink-0 items-center justify-center overflow-hidden rounded-full *:size-full",
          layout === "grid" ? "size-11" : "size-9",
          className
        )}
        {...props}
      />
    </LayoutSwitcherPart>
  );
};

/** Unnamed column for the title and description; fills the leftover space. */
const LayoutSwitcherItemContent = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  const { layout } = useLayoutSwitcher();
  return (
    <div
      data-slot="layout-switcher-item-content"
      data-layout={layout}
      className={cn(
        "flex w-full min-w-0 flex-1 flex-col gap-0.5",
        layout === "list" && "justify-center",
        className
      )}
      {...props}
    />
  );
};

const LayoutSwitcherItemTitle = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  const { layout } = useLayoutSwitcher();
  return (
    <LayoutSwitcherPart part="title" transition={tk("tk-morph", "tk-text")}>
      <div
        data-slot="layout-switcher-item-title"
        data-layout={layout}
        className={cn(
          "w-fit max-w-full truncate text-sm leading-5 font-medium",
          className
        )}
        {...props}
      />
    </LayoutSwitcherPart>
  );
};

const LayoutSwitcherItemDescription = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  const { layout } = useLayoutSwitcher();
  return (
    <LayoutSwitcherPart
      part="description"
      transition={tk("tk-morph", "tk-text")}
    >
      <div
        data-slot="layout-switcher-item-description"
        data-layout={layout}
        className={cn(
          "text-muted-foreground w-fit max-w-full truncate text-xs leading-4",
          className
        )}
        {...props}
      />
    </LayoutSwitcherPart>
  );
};

const LayoutSwitcherItemMeta = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  const { layout } = useLayoutSwitcher();
  return (
    <LayoutSwitcherPart part="meta" transition={tk("tk-morph", "tk-text")}>
      <div
        data-slot="layout-switcher-item-meta"
        data-layout={layout}
        className={cn(
          "text-muted-foreground flex w-fit max-w-full shrink-0 items-center gap-1 text-xs whitespace-nowrap tabular-nums [&_svg]:size-3.5 [&_svg]:shrink-0",
          className
        )}
        {...props}
      />
    </LayoutSwitcherPart>
  );
};

export {
  LayoutSwitcher,
  LayoutSwitcherItem,
  LayoutSwitcherItemContent,
  LayoutSwitcherItemDescription,
  LayoutSwitcherItemMedia,
  LayoutSwitcherItemMeta,
  LayoutSwitcherItems,
  LayoutSwitcherItemTitle,
  LayoutSwitcherToggle,
};
export type { Layout as LayoutSwitcherLayout };
