"use client";

import { ArrowUp, ChevronsUpDown, Search } from "lucide-react";
import * as React from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { tk } from "@/registry/ui/ui-transition";

type SortDirection = "asc" | "desc";

interface SortableTableSort {
  key: string;
  direction: SortDirection;
}

type SortValue = string | number | bigint | boolean | Date | null | undefined;

interface SortableTableColumn<Row> {
  /** Unique column id. Also the default field read from each row. */
  key: string;
  header: React.ReactNode;
  /** Plain-text column name for announcements when `header` isn't a string. */
  label?: string;
  /** Value used to sort and search. Defaults to `row[key]`. */
  accessor?: (row: Row) => SortValue;
  /** Custom cell content. Defaults to the accessor value. */
  cell?: (row: Row) => React.ReactNode;
  /** Custom comparator for the ascending order. */
  sortFn?: (a: Row, b: Row) => number;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  /** Column width, e.g. `"40%"` or `120`. Columns without one share the rest. */
  width?: number | string;
  /** Applied to the header and every cell of the column. */
  className?: string;
}

type RowId = string | number;

const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

const valueOf = <Row,>(column: SortableTableColumn<Row>, row: Row) =>
  column.accessor
    ? column.accessor(row)
    : ((row as Record<string, unknown>)[column.key] as SortValue);

const compareValues = (a: SortValue, b: SortValue) => {
  const aEmpty = a === null || a === undefined || a === "";
  const bEmpty = b === null || b === undefined || b === "";
  if (aEmpty || bEmpty) {
    return Number(aEmpty) - Number(bEmpty);
  }
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime();
  }
  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }
  if (typeof a === "bigint" && typeof b === "bigint") {
    return a < b ? -1 : Number(a > b);
  }
  return collator.compare(String(a), String(b));
};

const textOf = (value: SortValue) =>
  value instanceof Date ? value.toLocaleDateString() : String(value ?? "");

/** Asc, then desc, then back to the original order. */
const nextSort = (
  current: SortableTableSort | null,
  key: string
): SortableTableSort | null => {
  if (current?.key !== key) {
    return { direction: "asc", key };
  }
  return current.direction === "asc" ? { direction: "desc", key } : null;
};

const ariaSort = (direction: SortDirection | undefined) => {
  if (!direction) {
    return;
  }
  return direction === "asc" ? "ascending" : "descending";
};

const alignClass = {
  center: "text-center",
  left: "text-left",
  right: "text-right",
};

const SortIcon = ({ direction }: { direction?: SortDirection }) => (
  <span aria-hidden className="relative size-3.5 shrink-0">
    <ChevronsUpDown
      className={cn(
        "absolute inset-0 size-3.5 transition-opacity duration-200",
        direction ? "opacity-0" : "opacity-40 group-hover/sort:opacity-80"
      )}
    />
    <ArrowUp
      className={cn(
        "absolute inset-0 size-3.5 transition-[rotate,scale,opacity] duration-300 ease-(--tk-ui-ease) motion-reduce:transition-opacity",
        direction ? "opacity-100" : "scale-50 opacity-0",
        direction === "desc" && "rotate-180"
      )}
    />
  </span>
);

const SortableTable = <Row extends { id: RowId }>({
  columns,
  rows,
  sort: sortProp,
  defaultSort = null,
  onSortChange,
  searchable = false,
  query: queryProp,
  defaultQuery = "",
  onQueryChange,
  searchFn,
  searchPlaceholder = "Search…",
  caption,
  emptyMessage = "No results.",
  className,
  ...props
}: React.ComponentProps<"div"> & {
  columns: SortableTableColumn<Row>[];
  rows: Row[];
  sort?: SortableTableSort | null;
  defaultSort?: SortableTableSort | null;
  onSortChange?: (sort: SortableTableSort | null) => void;
  /** Shows a search field above the table. */
  searchable?: boolean;
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  /** Decides which rows match. Defaults to a case-insensitive match on any column. */
  searchFn?: (row: Row, query: string) => boolean;
  searchPlaceholder?: string;
  /** Accessible table name, rendered as a visually hidden `<caption>`. */
  caption?: React.ReactNode;
  emptyMessage?: React.ReactNode;
}) => {
  const [uncontrolledSort, setUncontrolledSort] = React.useState(defaultSort);
  const [uncontrolledQuery, setUncontrolledQuery] =
    React.useState(defaultQuery);
  const sort = sortProp === undefined ? uncontrolledSort : sortProp;
  const query = queryProp ?? uncontrolledQuery;
  // The field updates on every keystroke; the rows follow inside a transition.
  const [draft, setDraft] = React.useState(query);
  const [reserved, setReserved] = React.useState<number>();
  const tableRef = React.useRef<HTMLTableElement>(null);
  const searchId = React.useId();

  React.useEffect(() => {
    setDraft((current) => (current.trim() === query.trim() ? current : query));
  }, [query]);

  const matches = React.useCallback(
    (row: Row, search: string) => {
      const needle = search.trim().toLowerCase();
      if (!needle) {
        return true;
      }
      if (searchFn) {
        return searchFn(row, search.trim());
      }
      return columns.some((column) =>
        textOf(valueOf(column, row)).toLowerCase().includes(needle)
      );
    },
    [columns, searchFn]
  );

  const visible = React.useMemo(() => {
    const filtered = rows.filter((row) => matches(row, query));
    const column = sort && columns.find((item) => item.key === sort.key);
    if (!(sort && column)) {
      return filtered;
    }
    const sign = sort.direction === "asc" ? 1 : -1;
    const compare =
      column.sortFn ??
      ((a: Row, b: Row) =>
        compareValues(valueOf(column, a), valueOf(column, b)));
    return filtered.toSorted((a, b) => sign * compare(a, b));
  }, [columns, matches, query, rows, sort]);

  // Keep the unfiltered height while searching so the page below doesn't jump.
  React.useEffect(() => {
    const table = tableRef.current;
    if (!table || query.trim()) {
      return;
    }
    const observer = new ResizeObserver(() => setReserved(table.offsetHeight));
    observer.observe(table);
    return () => observer.disconnect();
  }, [query]);

  const changeSort = (key: string) => {
    const next = nextSort(sort, key);
    React.startTransition(() => {
      setUncontrolledSort(next);
      onSortChange?.(next);
    });
  };

  const changeQuery = (next: string) => {
    setDraft(next);
    const same =
      rows.filter((row) => matches(row, next)).length === visible.length &&
      visible.every((row) => matches(row, next));
    if (same) {
      setUncontrolledQuery(next);
      onQueryChange?.(next);
      return;
    }
    React.startTransition(() => {
      setUncontrolledQuery(next);
      onQueryChange?.(next);
    });
  };

  const sortedColumn = sort && columns.find((item) => item.key === sort.key);
  const sortedLabel =
    sortedColumn &&
    (sortedColumn.label ??
      (typeof sortedColumn.header === "string"
        ? sortedColumn.header
        : sortedColumn.key));
  const status = [
    `${visible.length} ${visible.length === 1 ? "row" : "rows"}`,
    sort && sortedLabel
      ? `sorted by ${sortedLabel}, ${ariaSort(sort.direction)}`
      : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      data-slot="sortable-table"
      className={cn("bg-background flex w-full flex-col gap-2", className)}
      {...props}
    >
      {searchable ? (
        <div data-slot="sortable-table-search" className="relative">
          <label htmlFor={searchId} className="sr-only">
            {searchPlaceholder}
          </label>
          <Search
            aria-hidden
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
          />
          <Input
            id={searchId}
            type="search"
            value={draft}
            placeholder={searchPlaceholder}
            autoComplete="off"
            onChange={(event) => changeQuery(event.target.value)}
            className="pl-8"
          />
        </div>
      ) : null}
      <div
        data-slot="sortable-table-container"
        className="relative w-full overflow-x-auto bg-inherit"
        style={{ minHeight: query.trim() ? reserved : undefined }}
      >
        <table
          ref={tableRef}
          data-slot="sortable-table-table"
          className="w-full table-fixed border-separate border-spacing-0 bg-inherit text-sm"
        >
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <colgroup>
            {columns.map((column) => (
              <col key={column.key} style={{ width: column.width }} />
            ))}
          </colgroup>
          <thead data-slot="sortable-table-header">
            <tr>
              {columns.map((column) => {
                const direction =
                  sort?.key === column.key ? sort.direction : undefined;
                const align = column.align ?? "left";
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={ariaSort(direction)}
                    data-slot="sortable-table-head"
                    className={cn(
                      "text-muted-foreground h-9 border-b px-2 align-middle font-medium whitespace-nowrap",
                      alignClass[align],
                      column.className
                    )}
                  >
                    {column.sortable === false ? (
                      column.header
                    ) : (
                      <button
                        type="button"
                        data-slot="sortable-table-sort"
                        data-state={direction ?? "none"}
                        onClick={() => changeSort(column.key)}
                        className={cn(
                          "group/sort hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring/50 data-[state=asc]:text-foreground data-[state=desc]:text-foreground -mx-2 inline-flex h-8 max-w-[calc(100%+1rem)] cursor-pointer items-center gap-1.5 rounded-md px-2 font-medium transition-colors outline-none focus-visible:ring-[3px]",
                          align === "right" && "flex-row-reverse"
                        )}
                      >
                        <span className="truncate">{column.header}</span>
                        <SortIcon direction={direction} />
                      </button>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody data-slot="sortable-table-body" className="bg-inherit">
            {visible.map((row) => (
              // Rows glide to their new place on sort; filtered rows fade.
              <React.ViewTransition
                key={row.id}
                default="none"
                update={tk("tk-morph")}
                enter={tk("tk-fade")}
                exit={tk("tk-fade")}
              >
                <tr
                  data-slot="sortable-table-row"
                  // Opaque rows, so rows that cross mid-sort slide over each other.
                  className="group/row bg-inherit"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      data-slot="sortable-table-cell"
                      className={cn(
                        "group-hover/row:bg-muted/50 h-9 truncate border-b px-2 align-middle tabular-nums transition-colors group-last/row:border-b-0",
                        alignClass[column.align ?? "left"],
                        column.className
                      )}
                    >
                      {column.cell
                        ? column.cell(row)
                        : textOf(valueOf(column, row))}
                    </td>
                  ))}
                </tr>
              </React.ViewTransition>
            ))}
            {visible.length === 0 ? (
              <React.ViewTransition
                default="none"
                enter={tk("tk-fade")}
                exit={tk("tk-fade")}
              >
                <tr data-slot="sortable-table-empty" className="bg-inherit">
                  <td
                    colSpan={columns.length}
                    className="text-muted-foreground h-20 text-center"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              </React.ViewTransition>
            ) : null}
          </tbody>
        </table>
      </div>
      <p aria-live="polite" aria-atomic className="sr-only">
        {status}
      </p>
    </div>
  );
};

export { SortableTable };
export type { SortableTableColumn, SortableTableSort, SortDirection };
