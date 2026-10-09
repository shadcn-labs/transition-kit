"use client";

import { SearchIcon, XIcon } from "lucide-react";
import * as React from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { tk, useTransitionNames } from "@/registry/ui/ui-transition";
import type { TransitionNames } from "@/registry/ui/ui-transition";

/** The filter value that shows every item. */
const FILTER_ALL = "all";

interface FilterGridItem {
  id: string | number;
  tags: readonly string[];
}

type FilterGridMatch<T extends FilterGridItem> = (
  item: T,
  query: string
) => boolean;

interface FilterGridContextValue {
  filter: string;
  query: string;
  visible: FilterGridItem[];
  total: number;
  name: TransitionNames;
  setFilter: (filter: string) => void;
  setQuery: (query: string) => void;
}

const FilterGridContext = React.createContext<FilterGridContextValue | null>(
  null
);

const useFilterGrid = () => {
  const context = React.useContext(FilterGridContext);
  if (!context) {
    throw new Error("FilterGrid parts must be used within <FilterGrid>.");
  }
  return context;
};

/** Every whitespace-separated term must appear in a string field or a tag. */
const defaultMatch = (item: FilterGridItem, query: string) => {
  const haystack = [
    ...Object.values(item).filter((v): v is string => typeof v === "string"),
    ...item.tags,
  ]
    .join(" ")
    .toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .every((term) => haystack.includes(term));
};

const FilterGrid = <T extends FilterGridItem>({
  items,
  filter: filterProp,
  defaultFilter = FILTER_ALL,
  onFilterChange,
  query: queryProp,
  defaultQuery = "",
  onQueryChange,
  match = defaultMatch,
  status = (shown, total) => `Showing ${shown} of ${total}`,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  items: readonly T[];
  filter?: string;
  defaultFilter?: string;
  onFilterChange?: (filter: string) => void;
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  match?: FilterGridMatch<T>;
  status?: (shown: number, total: number) => string;
}) => {
  const [filterState, setFilterState] = React.useState(defaultFilter);
  const [queryState, setQueryState] = React.useState(defaultQuery);
  const name = useTransitionNames();
  const filter = filterProp ?? filterState;
  const query = queryProp ?? queryState;

  const select = React.useCallback(
    (nextFilter: string, nextQuery: string) => {
      const term = nextQuery.trim();
      return items.filter(
        (item) =>
          (nextFilter === FILTER_ALL || item.tags.includes(nextFilter)) &&
          (term === "" || match(item, term))
      );
    },
    [items, match]
  );

  const visible = React.useMemo(
    () => select(filter, query),
    [select, filter, query]
  );

  const setFilter = React.useCallback(
    (next: string) => {
      if (next === filter) {
        return;
      }
      // Always animated, even when the items stay: the chip highlight glides.
      React.startTransition(() => {
        setFilterState(next);
        onFilterChange?.(next);
      });
    },
    [filter, onFilterChange]
  );

  const setQuery = React.useCallback(
    (next: string) => {
      if (next === query) {
        return;
      }
      const update = () => {
        setQueryState(next);
        onQueryChange?.(next);
      };
      // Typing a space or a letter that keeps the same results animates nothing.
      const nextVisible = select(filter, next);
      const unchanged =
        nextVisible.length === visible.length &&
        nextVisible.every((item, index) => item.id === visible[index]?.id);
      if (unchanged) {
        update();
      } else {
        React.startTransition(update);
      }
    },
    [query, onQueryChange, select, filter, visible]
  );

  const context = React.useMemo(
    () => ({
      filter,
      name,
      query,
      setFilter,
      setQuery,
      total: items.length,
      visible: visible as FilterGridItem[],
    }),
    [filter, name, query, setFilter, setQuery, items.length, visible]
  );

  return (
    <FilterGridContext.Provider value={context}>
      <div
        data-slot="filter-grid"
        className={cn("@container flex w-full flex-col gap-4", className)}
        {...props}
      >
        {children}
        <span aria-live="polite" aria-atomic className="sr-only">
          {status(visible.length, items.length)}
        </span>
      </div>
    </FilterGridContext.Provider>
  );
};

const FilterGridFilters = ({
  className,
  onKeyDown,
  ...props
}: React.ComponentProps<"div">) => {
  const { filter, setFilter } = useFilterGrid();
  const ref = React.useRef<HTMLDivElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    const values = Array.from(
      ref.current?.querySelectorAll<HTMLElement>(
        '[role="radio"]:not([disabled])'
      ) ?? [],
      (radio) => radio.dataset.value ?? ""
    );
    const index = values.indexOf(filter);
    const previous = values[(index - 1 + values.length) % values.length];
    const next = values[(index + 1) % values.length];
    const target = {
      ArrowDown: next,
      ArrowLeft: previous,
      ArrowRight: next,
      ArrowUp: previous,
      End: values.at(-1),
      Home: values[0],
    }[event.key];
    if (target === undefined || event.defaultPrevented) {
      return;
    }
    event.preventDefault();
    setFilter(target);
    ref.current
      ?.querySelector<HTMLElement>(
        `[role="radio"][data-value="${CSS.escape(target)}"]`
      )
      ?.focus();
  };

  return (
    <div
      ref={ref}
      role="radiogroup"
      aria-label="Filter"
      data-slot="filter-grid-filters"
      onKeyDown={handleKeyDown}
      className={cn("flex flex-wrap items-center gap-1.5", className)}
      {...props}
    />
  );
};

const FilterGridFilter = ({
  value,
  className,
  children,
  onClick,
  ...props
}: Omit<React.ComponentProps<"button">, "value"> & { value: string }) => {
  const { filter, name, setFilter } = useFilterGrid();
  const checked = value === filter;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      tabIndex={checked ? 0 : -1}
      data-value={value}
      data-state={checked ? "on" : "off"}
      data-slot="filter-grid-filter"
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          setFilter(value);
        }
      }}
      className={cn(
        "border-border text-muted-foreground hover:text-foreground data-[state=on]:text-primary-foreground focus-visible:ring-ring/50 relative inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-full border px-3 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {/* Rendered in one chip at a time: React pairs the old and new highlight. */}
      {checked ? (
        <React.ViewTransition
          name={name("indicator")}
          default="none"
          share={tk("tk-morph")}
        >
          <span
            aria-hidden
            data-slot="filter-grid-indicator"
            className="bg-primary absolute -inset-px rounded-full"
          />
        </React.ViewTransition>
      ) : null}
      {/*
       * Every label is captured and raised with tk-top, so the gliding
       * highlight never covers one, whichever direction it travels.
       * data-checked-value changes with every selection, which is what makes
       * React capture it.
       */}
      <React.ViewTransition default="none" update={tk("tk-morph", "tk-top")}>
        <span
          data-slot="filter-grid-filter-label"
          data-checked-value={filter}
          className="relative inline-flex items-center gap-1.5"
        >
          {children}
        </span>
      </React.ViewTransition>
    </button>
  );
};

const FilterGridSearch = ({
  debounce = 150,
  className,
  onChange,
  onKeyDown,
  placeholder = "Search…",
  "aria-label": ariaLabel = "Search",
  ...props
}: Omit<React.ComponentProps<"input">, "value" | "defaultValue" | "type"> & {
  /** Milliseconds of idle typing before the grid filters. */
  debounce?: number;
}) => {
  const { query, setQuery } = useFilterGrid();
  const [draft, setDraft] = React.useState(query);
  const sent = React.useRef(query);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // A query set from outside (controlled prop, reset) replaces the draft.
  React.useEffect(() => {
    if (query !== sent.current) {
      sent.current = query;
      setDraft(query);
    }
  }, [query]);

  const apply = React.useCallback(
    (next: string) => {
      sent.current = next;
      setQuery(next);
    },
    [setQuery]
  );

  // One transition after typing settles, not one per keystroke.
  React.useEffect(() => {
    if (draft === sent.current) {
      return;
    }
    const timer = window.setTimeout(() => apply(draft), debounce);
    return () => window.clearTimeout(timer);
  }, [draft, debounce, apply]);

  const clear = () => {
    setDraft("");
    apply("");
    inputRef.current?.focus();
  };

  return (
    <div
      data-slot="filter-grid-search"
      className={cn("relative w-full @lg:w-56", className)}
    >
      <SearchIcon
        aria-hidden
        className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
      />
      <Input
        ref={inputRef}
        type="search"
        value={draft}
        placeholder={placeholder}
        aria-label={ariaLabel}
        onChange={(event) => {
          onChange?.(event);
          setDraft(event.target.value);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) {
            return;
          }
          if (event.key === "Enter") {
            event.preventDefault();
            apply(draft);
          } else if (event.key === "Escape" && draft !== "") {
            event.preventDefault();
            clear();
          }
        }}
        className="h-8 px-8 [&::-webkit-search-cancel-button]:appearance-none"
        {...props}
      />
      {draft === "" ? null : (
        <button
          type="button"
          aria-label="Clear search"
          onClick={clear}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 absolute top-1/2 right-1.5 inline-flex size-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full outline-none focus-visible:ring-[3px]"
        >
          <XIcon className="size-3.5" />
        </button>
      )}
    </div>
  );
};

/**
 * Reserves the height of the full, unfiltered grid so filtering never moves
 * what sits below it. Assumes rows of equal height, the usual filter grid.
 */
const useReservedHeight = (
  ref: React.RefObject<HTMLElement | null>,
  total: number,
  enabled: boolean
) => {
  React.useLayoutEffect(() => {
    const grid = ref.current;
    if (!grid) {
      return;
    }
    if (!enabled) {
      grid.style.minHeight = "";
      return;
    }
    const measure = () => {
      const cell = grid.querySelector<HTMLElement>("[data-filter-grid-cell]");
      if (!cell) {
        return;
      }
      const style = getComputedStyle(grid);
      const columns = style.gridTemplateColumns.split(" ").length;
      const rows = Math.ceil(total / columns);
      const gap = Number.parseFloat(style.rowGap) || 0;
      const chrome =
        Number.parseFloat(style.paddingTop) +
        Number.parseFloat(style.paddingBottom) +
        Number.parseFloat(style.borderTopWidth) +
        Number.parseFloat(style.borderBottomWidth);
      const height = rows * cell.offsetHeight + (rows - 1) * gap + chrome;
      grid.style.minHeight = `${Math.max(height, 0)}px`;
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(grid);
    return () => observer.disconnect();
  }, [ref, total, enabled]);
};

const FilterGridItems = <T extends FilterGridItem = FilterGridItem>({
  children,
  empty = "Nothing matches.",
  reserveSpace = true,
  className,
  ...props
}: Omit<React.ComponentProps<"ul">, "children"> & {
  children: (item: T, index: number) => React.ReactNode;
  /** Shown when no item matches the filter and search. */
  empty?: React.ReactNode;
  /** Keep the height of the unfiltered grid so the page never jumps. */
  reserveSpace?: boolean;
}) => {
  const { total, visible } = useFilterGrid();
  const ref = React.useRef<HTMLUListElement>(null);
  useReservedHeight(ref, total, reserveSpace);

  return (
    <ul
      ref={ref}
      data-slot="filter-grid-items"
      data-empty={visible.length === 0 ? "" : undefined}
      className={cn(
        "grid grid-cols-2 content-start gap-3 @sm:grid-cols-3 @lg:grid-cols-4 data-[empty]:content-stretch",
        className
      )}
      {...props}
    >
      {visible.map((item, index) => {
        // Matches glide to their new cell, new ones pop in one after another
        // and the rest pop out.
        const transition = tk(
          "tk-morph",
          "tk-pop",
          index > 0 && `tk-delay-${Math.min(index, 8)}`
        );
        return (
          <React.ViewTransition
            key={item.id}
            default="none"
            update={transition}
            enter={transition}
            exit={transition}
          >
            <li
              data-filter-grid-cell
              data-slot="filter-grid-item"
              className="min-w-0"
            >
              {children(item as T, index)}
            </li>
          </React.ViewTransition>
        );
      })}
      {visible.length === 0 ? (
        <React.ViewTransition
          default="none"
          enter={tk("tk-fade")}
          exit={tk("tk-fade")}
        >
          <li
            data-slot="filter-grid-empty"
            className="text-muted-foreground col-span-full flex items-center justify-center p-6 text-center text-sm"
          >
            {empty}
          </li>
        </React.ViewTransition>
      ) : null}
    </ul>
  );
};

export {
  FILTER_ALL,
  FilterGrid,
  FilterGridFilter,
  FilterGridFilters,
  FilterGridItems,
  FilterGridSearch,
};
export type { FilterGridItem, FilterGridMatch };
