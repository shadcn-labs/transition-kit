"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { tk, useTransitionNames } from "@/registry/ui/ui-transition";
import type { TransitionNames } from "@/registry/ui/ui-transition";

type ItemId = string | number;

const AnimatedListContext = React.createContext<TransitionNames | null>(null);

const focusable =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const AnimatedList = ({
  className,
  onFocus,
  ...props
}: React.ComponentProps<"ul">) => {
  const name = useTransitionNames();
  const listRef = React.useRef<HTMLUListElement>(null);
  const lastFocus = React.useRef<{
    element: HTMLElement;
    index: number;
    slot: number;
  } | null>(null);

  // Runs after every render, inside the transition's update.
  React.useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) {
      return;
    }
    // A list that scrolls itself becomes a group its rows nest in, so their
    // snapshots are clipped to the scroll area (where nested groups are
    // supported). React already leaves rows outside the viewport alone.
    if (getComputedStyle(list).overflowY === "visible") {
      list.style.removeProperty("view-transition-group");
    } else {
      list.style.setProperty("view-transition-group", "contain");
    }
    const last = lastFocus.current;
    if (!last || last.element.isConnected) {
      return;
    }
    lastFocus.current = null;
    const active = document.activeElement;
    if (active && active !== document.body) {
      return;
    }
    // The focused row was removed: focus the same control in the row that
    // took its place, so keyboard users can keep removing.
    const rows = list.querySelectorAll<HTMLElement>(":scope > li");
    const row = rows[Math.min(last.index, rows.length - 1)];
    const targets = row
      ? [...row.querySelectorAll<HTMLElement>(focusable)]
      : [];
    (targets[last.slot] ?? targets[0] ?? row ?? list).focus({
      preventScroll: true,
    });
  });

  return (
    <AnimatedListContext.Provider value={name}>
      <React.ViewTransition
        default="none"
        update={tk("tk-morph", "tk-animated-list-viewport")}
      >
        <ul
          ref={listRef}
          tabIndex={-1}
          data-slot="animated-list"
          onFocus={(event) => {
            onFocus?.(event);
            const list = event.currentTarget;
            const row = event.target.closest<HTMLElement>(
              '[data-slot="animated-list-item"]'
            );
            if (!row || row.parentElement !== list) {
              return;
            }
            lastFocus.current = {
              element: event.target,
              index: Array.prototype.indexOf.call(list.children, row),
              slot: [...row.querySelectorAll<HTMLElement>(focusable)].indexOf(
                event.target
              ),
            };
          }}
          className={cn("flex flex-col gap-2 outline-none", className)}
          {...props}
        />
      </React.ViewTransition>
    </AnimatedListContext.Provider>
  );
};

const AnimatedListItem = ({
  id,
  className,
  ...props
}: Omit<React.ComponentProps<"li">, "id"> & {
  /** Stable identity: the row keeps its transition name across renders. */
  id: ItemId;
}) => {
  const name = React.useContext(AnimatedListContext);
  if (!name) {
    throw new Error("AnimatedListItem must be used within <AnimatedList>.");
  }

  // Rows glide when the list reflows, pop in when added and out when removed.
  return (
    <React.ViewTransition
      name={name("item", id)}
      default="none"
      update={tk("tk-morph")}
      share={tk("tk-morph")}
      enter={tk("tk-pop")}
      exit={tk("tk-pop")}
    >
      <li
        data-slot="animated-list-item"
        className={cn(
          "bg-card text-card-foreground flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm",
          className
        )}
        {...props}
      />
    </React.ViewTransition>
  );
};

type Updater<T> = T[] | ((items: T[]) => T[]);

const unchanged = <T,>(previous: T[], next: T[]) =>
  previous.length === next.length &&
  previous.every((item, index) => item === next[index]);

const defaultGetId = (item: unknown): ItemId => {
  if (
    item &&
    typeof item === "object" &&
    "id" in item &&
    (typeof item.id === "string" || typeof item.id === "number")
  ) {
    return item.id;
  }
  throw new Error("useAnimatedList: items need an `id`, or pass `getId`.");
};

/**
 * List state whose every change runs inside a React transition, so the list
 * animates. Updates are functional, so rapid clicks queue up instead of
 * overwriting each other. `move` and `remove` look items up by id when they
 * apply.
 */
const useAnimatedList = <T,>(
  initial: T[] | (() => T[]),
  { getId = defaultGetId }: { getId?: (item: T) => ItemId } = {}
) => {
  const [items, setItems] = React.useState(initial);

  const set = React.useCallback((update: Updater<T>) => {
    const apply = typeof update === "function" ? update : () => update;
    React.startTransition(() => {
      // Returning the same array bails out, so a no-op starts no transition.
      setItems((previous) => {
        const next = apply(previous);
        return unchanged(previous, next) ? previous : next;
      });
    });
  }, []);

  const add = React.useCallback(
    (item: T, index?: number) =>
      set((previous) => {
        const next = [...previous];
        next.splice(index ?? previous.length, 0, item);
        return next;
      }),
    [set]
  );

  const remove = React.useCallback(
    (id: ItemId) =>
      set((previous) => previous.filter((item) => getId(item) !== id)),
    [set, getId]
  );

  const move = React.useCallback(
    (id: ItemId, index: number) =>
      set((previous) => {
        const from = previous.findIndex((item) => getId(item) === id);
        if (from === -1) {
          return previous;
        }
        const next = [...previous];
        const [item] = next.splice(from, 1);
        next.splice(Math.max(0, Math.min(index, next.length)), 0, item);
        return next;
      }),
    [set, getId]
  );

  const sort = React.useCallback(
    (compare: (a: T, b: T) => number) =>
      set((previous) => previous.toSorted(compare)),
    [set]
  );

  return { add, items, move, remove, set, sort };
};

export { AnimatedList, AnimatedListItem, useAnimatedList };
export type { ItemId as AnimatedListItemId };
