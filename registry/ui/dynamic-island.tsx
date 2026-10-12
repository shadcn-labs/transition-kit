"use client";

import * as React from "react";
import { startTransition, ViewTransition } from "react";

import { cn } from "@/lib/utils";
import { tk, useTransitionNames } from "@/registry/ui/ui-transition";
import type { TransitionNames } from "@/registry/ui/ui-transition";

const focusable =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface DynamicIslandContextValue {
  state: string;
  setState: (state: string) => void;
  name: TransitionNames;
}

const DynamicIslandContext =
  React.createContext<DynamicIslandContextValue | null>(null);

const useDynamicIslandContext = () => {
  const context = React.useContext(DynamicIslandContext);
  if (!context) {
    throw new Error("DynamicIsland parts must be used within <DynamicIsland>.");
  }
  return context;
};

/** The island's current state and a setter that morphs it to another one. */
const useDynamicIsland = () => {
  const { setState, state } = useDynamicIslandContext();
  return { setState, state };
};

const DynamicIsland = ({
  state: stateProp,
  defaultState = "idle",
  onStateChange,
  className,
  children,
  ref,
  ...props
}: React.ComponentProps<"div"> & {
  state?: string;
  defaultState?: string;
  onStateChange?: (state: string) => void;
}) => {
  const [uncontrolled, setUncontrolled] = React.useState(defaultState);
  const target = stateProp ?? uncontrolled;
  // The state on screen. It follows `target` inside a React Transition, so
  // controlled and uncontrolled changes animate the same way.
  const [shown, setShown] = React.useState(target);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const hadFocus = React.useRef(false);
  const name = useTransitionNames();

  React.useEffect(() => {
    if (target === shown) {
      return;
    }
    hadFocus.current =
      rootRef.current?.contains(document.activeElement) ?? false;
    startTransition(() => setShown(target));
  }, [target, shown]);

  // Focus inside content that just unmounted moves into the new content.
  React.useLayoutEffect(() => {
    const root = rootRef.current;
    if (!hadFocus.current || !root || root.contains(document.activeElement)) {
      return;
    }
    hadFocus.current = false;
    (root.querySelector<HTMLElement>(focusable) ?? root).focus();
  }, [shown]);

  const setState = React.useCallback(
    (next: string) => {
      if (next === target) {
        return;
      }
      if (stateProp === undefined) {
        setUncontrolled(next);
      }
      onStateChange?.(next);
    },
    [target, stateProp, onStateChange]
  );

  const setRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === "function") {
        return ref(node);
      }
      if (ref) {
        ref.current = node;
      }
    },
    [ref]
  );

  const context = React.useMemo(
    () => ({ name, setState, state: shown }),
    [name, setState, shown]
  );

  return (
    <DynamicIslandContext.Provider value={context}>
      <div
        ref={setRef}
        role="region"
        aria-label="Live activity"
        aria-live="polite"
        tabIndex={-1}
        data-slot="dynamic-island"
        data-state={shown}
        className={cn(
          "text-background relative isolate inline-flex w-fit max-w-full overflow-hidden rounded-[var(--tk-ui-dynamic-island-radius,2rem)] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
          className
        )}
        {...props}
      >
        {/* A flat rectangle clipped by the root: it can fill any box without distorting. */}
        <ViewTransition
          default="none"
          update={tk(
            "tk-morph",
            "tk-slow",
            "tk-spring",
            "tk-clip",
            "tk-dynamic-island-surface"
          )}
        >
          <span
            aria-hidden
            data-slot="dynamic-island-surface"
            className="bg-foreground absolute inset-0"
          />
        </ViewTransition>
        {children}
      </div>
    </DynamicIslandContext.Provider>
  );
};

const DynamicIslandContent = ({
  state,
  className,
  ...props
}: React.ComponentProps<"div"> & { state: string }) => {
  const { name, state: shown } = useDynamicIslandContext();
  if (state !== shown) {
    return null;
  }
  // Every state's content shares one name, so the old and new content pair
  // into one group that rides the surface's spring while they crossfade. It
  // comes after the surface, so it paints above it.
  return (
    <ViewTransition
      name={name("content")}
      default="none"
      share={tk(
        "tk-morph",
        "tk-slow",
        "tk-spring",
        "tk-clip",
        "tk-blur",
        "tk-dynamic-island-content"
      )}
    >
      <div
        data-slot="dynamic-island-content"
        data-state={state}
        className={cn("relative", className)}
        {...props}
      />
    </ViewTransition>
  );
};

export { DynamicIsland, DynamicIslandContent, useDynamicIsland };
