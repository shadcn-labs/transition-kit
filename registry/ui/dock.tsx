"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { tk, useTransitionNames } from "@/registry/ui/ui-transition";
import type { TransitionNames } from "@/registry/ui/ui-transition";

interface DockContextValue {
  value: string;
  tabStop: string;
  name: TransitionNames;
  select: (value: string) => void;
}

const DockContext = React.createContext<DockContextValue | null>(null);

const useDock = () => {
  const context = React.useContext(DockContext);
  if (!context) {
    throw new Error("DockItem must be used within <Dock>.");
  }
  return context;
};

const enabledItem = '[data-slot="dock-item"]:not([disabled])';

const Dock = ({
  value: valueProp,
  defaultValue = "",
  onValueChange,
  className,
  children,
  onKeyDown,
  ref: callerRef,
  ...props
}: Omit<React.ComponentProps<"div">, "defaultValue"> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}) => {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const value = valueProp ?? uncontrolled;
  const [tabStop, setTabStop] = React.useState(value);
  const ref = React.useRef<HTMLDivElement>(null);
  const pending = React.useRef<string | null>(null);
  const name = useTransitionNames();

  React.useLayoutEffect(() => {
    pending.current = null;
  });

  React.useLayoutEffect(() => {
    const toolbar = ref.current;
    if (!toolbar) {
      return;
    }
    const enabledValues = () =>
      [...toolbar.querySelectorAll<HTMLElement>(enabledItem)].map(
        (item) => item.dataset.value ?? ""
      );
    const fallback = (values: string[]) =>
      values.includes(value) ? value : (values[0] ?? value);
    setTabStop(fallback(enabledValues()));
    const observer = new MutationObserver(() => {
      const values = enabledValues();
      setTabStop((current) =>
        values.includes(current) ? current : fallback(values)
      );
    });
    observer.observe(toolbar, {
      attributeFilter: ["disabled", "data-value"],
      attributes: true,
      childList: true,
      subtree: true,
    });
    return () => observer.disconnect();
  }, [value]);

  const select = React.useCallback(
    (next: string) => {
      if (next === (pending.current ?? value)) {
        return;
      }
      pending.current = next;
      React.startTransition(() => {
        setUncontrolled(next);
        onValueChange?.(next);
      });
    },
    [onValueChange, value]
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) {
      return;
    }
    const items = [
      ...event.currentTarget.querySelectorAll<HTMLElement>(enabledItem),
    ];
    const index = items.indexOf(event.target as HTMLElement);
    if (index === -1) {
      return;
    }
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const step = (delta: number) =>
      items[(index + delta + items.length) % items.length];
    const target = {
      ArrowLeft: step(rtl ? 1 : -1),
      ArrowRight: step(rtl ? -1 : 1),
      End: items.at(-1),
      Home: items[0],
    }[event.key];
    if (!target) {
      return;
    }
    event.preventDefault();
    setTabStop(target.dataset.value ?? "");
    target.focus();
  };

  const context = React.useMemo(
    () => ({ name, select, tabStop, value }),
    [name, select, tabStop, value]
  );

  return (
    <DockContext.Provider value={context}>
      <div
        ref={(node) => {
          ref.current = node;
          if (typeof callerRef === "function") {
            const cleanup = callerRef(node);
            return typeof cleanup === "function" ? cleanup : undefined;
          }
          if (callerRef) {
            callerRef.current = node;
          }
        }}
        role="toolbar"
        aria-orientation="horizontal"
        data-slot="dock"
        onKeyDown={handleKeyDown}
        className={cn(
          "bg-background/80 supports-[backdrop-filter]:bg-background/60 inline-flex w-fit items-center gap-1 rounded-full border p-1.5 shadow-lg backdrop-blur",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </DockContext.Provider>
  );
};

const DockItem = ({
  value,
  icon,
  label,
  className,
  onClick,
  ...props
}: Omit<React.ComponentProps<"button">, "value" | "children"> & {
  value: string;
  icon: React.ReactNode;
  label: string;
}) => {
  const context = useDock();
  const { name, select, tabStop } = context;
  const active = value === context.value;

  return (
    <React.ViewTransition default="none" update={tk("tk-morph", "tk-top")}>
      <button
        type="button"
        aria-pressed={active}
        aria-label={label}
        title={active ? undefined : label}
        tabIndex={value === tabStop ? 0 : -1}
        data-value={value}
        data-active-value={context.value}
        data-state={active ? "active" : "inactive"}
        data-slot="dock-item"
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) {
            select(value);
          }
        }}
        className={cn(
          "text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 data-[state=active]:text-primary-foreground relative flex h-10 min-w-10 cursor-pointer items-center justify-center gap-2 rounded-full px-2.5 text-sm font-medium whitespace-nowrap outline-none transition-colors focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
          active && "pe-4",
          className
        )}
        {...props}
      >
        {active ? (
          <React.ViewTransition
            name={name("pill")}
            default="none"
            share={tk("tk-morph", "tk-spring")}
          >
            <span
              aria-hidden
              data-slot="dock-pill"
              className="bg-primary absolute inset-0 rounded-full"
            />
          </React.ViewTransition>
        ) : null}
        <span aria-hidden className="relative flex">
          {icon}
        </span>
        {active ? (
          <React.ViewTransition
            default="none"
            enter={tk("tk-fade")}
            exit={tk("tk-fade")}
          >
            <span aria-hidden data-slot="dock-label" className="relative">
              {label}
            </span>
          </React.ViewTransition>
        ) : null}
      </button>
    </React.ViewTransition>
  );
};

export { Dock, DockItem };
