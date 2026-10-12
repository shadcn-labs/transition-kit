"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import {
  BACK,
  FORWARD,
  tk,
  useTransitionNames,
} from "@/registry/ui/ui-transition";
import type { TransitionNames } from "@/registry/ui/ui-transition";

interface TabsContextValue {
  value: string;
  variant: "pill" | "underline";
  listRef: React.RefObject<HTMLDivElement | null>;
  names: TransitionNames;
  select: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

const useTabs = () => {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs parts must be used within <Tabs>.");
  }
  return context;
};

const tabValues = (list: HTMLElement | null) =>
  Array.from(
    list?.querySelectorAll<HTMLElement>('[role="tab"]:not([disabled])') ?? [],
    (tab) => tab.dataset.value ?? ""
  );

// The old panel slides out and the new one in, in the direction of the tab.
const panelShare = {
  [BACK]: tk("tk-morph", "tk-slide", "tk-back"),
  [FORWARD]: tk("tk-morph", "tk-slide", "tk-forward"),
  default: "none",
};

const Tabs = ({
  value: valueProp,
  defaultValue = "",
  onValueChange,
  variant = "pill",
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "defaultValue"> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  variant?: "pill" | "underline";
}) => {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const listRef = React.useRef<HTMLDivElement>(null);
  const names = useTransitionNames();
  const value = valueProp ?? uncontrolled;

  const select = React.useCallback(
    (next: string) => {
      if (next === value) {
        return;
      }
      const values = tabValues(listRef.current);
      const forward = values.indexOf(next) > values.indexOf(value);
      React.startTransition(() => {
        React.addTransitionType(forward ? FORWARD : BACK);
        setUncontrolled(next);
        onValueChange?.(next);
      });
    },
    [value, onValueChange]
  );

  const context = React.useMemo(
    () => ({ listRef, names, select, value, variant }),
    [names, select, value, variant]
  );

  return (
    <TabsContext.Provider value={context}>
      <div
        data-slot="tabs"
        className={cn("flex flex-col gap-3", className)}
        {...props}
      />
    </TabsContext.Provider>
  );
};

const TabsList = ({
  className,
  onKeyDown,
  ...props
}: React.ComponentProps<"div">) => {
  const { listRef, select, value, variant } = useTabs();

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    const values = tabValues(listRef.current);
    const index = values.indexOf(value);
    const target = {
      ArrowLeft: values[(index - 1 + values.length) % values.length],
      ArrowRight: values[(index + 1) % values.length],
      End: values.at(-1),
      Home: values[0],
    }[event.key];
    if (target === undefined || event.defaultPrevented) {
      return;
    }
    event.preventDefault();
    select(target);
    listRef.current
      ?.querySelector<HTMLElement>(
        `[role="tab"][data-value="${CSS.escape(target)}"]`
      )
      ?.focus();
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-orientation="horizontal"
      data-slot="tabs-list"
      data-variant={variant}
      onKeyDown={handleKeyDown}
      className={cn(
        "text-muted-foreground inline-flex w-fit items-center",
        variant === "pill"
          ? "bg-muted h-9 rounded-lg p-[3px]"
          : "h-10 gap-4 border-b border-border",
        className
      )}
      {...props}
    />
  );
};

const TabsTrigger = ({
  value,
  className,
  children,
  onClick,
  ...props
}: Omit<React.ComponentProps<"button">, "value"> & { value: string }) => {
  const { names, select, value: active, variant } = useTabs();
  const selected = value === active;

  const label = (
    <span
      data-slot="tabs-label"
      // Changes with every selection, so React captures each label and can
      // paint it above the gliding pill.
      data-active-value={variant === "pill" ? active : undefined}
      className="relative inline-flex items-center gap-1.5"
    >
      {children}
    </span>
  );

  return (
    <button
      type="button"
      role="tab"
      id={names("tab", value)}
      aria-selected={selected}
      aria-controls={names("panel", value)}
      tabIndex={selected ? 0 : -1}
      data-value={value}
      data-state={selected ? "active" : "inactive"}
      data-slot="tabs-trigger"
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          select(value);
        }
      }}
      className={cn(
        "relative inline-flex h-full cursor-pointer items-center justify-center gap-1.5 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        variant === "pill" ? "flex-1 rounded-md px-3" : "px-1",
        className
      )}
      {...props}
    >
      {selected ? (
        // Rendered in the active trigger only: the indicator leaving one
        // trigger and appearing in the next share a name, so it glides.
        <React.ViewTransition
          name={names("indicator")}
          default="none"
          share={tk("tk-morph")}
        >
          <span
            aria-hidden
            data-slot="tabs-indicator"
            className={cn(
              "absolute",
              variant === "pill"
                ? "inset-0 rounded-md bg-background shadow-sm dark:bg-input/30 dark:ring-1 dark:ring-input"
                : "inset-x-0 -bottom-px h-0.5 rounded-full bg-foreground"
            )}
          />
        </React.ViewTransition>
      ) : null}
      {variant === "pill" ? (
        <React.ViewTransition default="none" update={tk("tk-morph", "tk-top")}>
          {label}
        </React.ViewTransition>
      ) : (
        label
      )}
    </button>
  );
};

const TabsContent = ({
  value,
  className,
  ...props
}: React.ComponentProps<"div"> & { value: string }) => {
  const { names, value: active } = useTabs();
  if (value !== active) {
    return null;
  }
  return (
    // Only the active panel is mounted, so the leaving and entering panels
    // pair up into one group that resizes while their contents slide.
    <React.ViewTransition
      name={names("panel")}
      default="none"
      share={panelShare}
    >
      <div
        role="tabpanel"
        id={names("panel", value)}
        aria-labelledby={names("tab", value)}
        tabIndex={0}
        data-slot="tabs-content"
        className={cn("outline-none", className)}
        {...props}
      />
    </React.ViewTransition>
  );
};

export { Tabs, TabsContent, TabsList, TabsTrigger };
