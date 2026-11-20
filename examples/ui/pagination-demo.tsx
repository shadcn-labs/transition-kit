"use client";

import * as React from "react";

import { Pagination } from "@/registry/ui/pagination";
import { BACK, FORWARD, tk } from "@/registry/ui/ui-transition";

const PER_PAGE = 3;
const TOTAL = 12;

const topics = [
  "Shared element morphs",
  "Directional slides",
  "Reduced motion",
  "Transition types",
  "Staggered lists",
  "Theme reveals",
  "Page exits",
  "Snapshot groups",
  "Layout shifts",
  "Spring easing",
  "Clip paths",
  "Nested boundaries",
];

const slide = {
  [BACK]: tk("tk-slide", "tk-back"),
  [FORWARD]: tk("tk-slide", "tk-forward"),
  default: "none",
};

export const PaginationDemo = () => {
  const [page, setPage] = React.useState(1);
  const [narrow, setNarrow] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      setNarrow((entry?.contentRect.width ?? 0) < 340);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="bg-card text-card-foreground flex w-full max-w-md flex-col gap-4 overflow-hidden rounded-xl border p-3 sm:p-4"
    >
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold">Articles</p>
        <p className="text-muted-foreground text-xs tabular-nums">
          Page {page} of {TOTAL}
        </p>
      </div>
      <React.ViewTransition
        key={page}
        default="none"
        enter={slide}
        exit={slide}
      >
        <ul className="grid gap-2">
          {Array.from({ length: PER_PAGE }, (_, index) => {
            const number = (page - 1) * PER_PAGE + index;
            return (
              <li
                key={number}
                className="bg-muted/50 flex items-center gap-3 rounded-lg px-3 py-2.5"
              >
                <span className="text-muted-foreground w-6 font-mono text-xs tabular-nums">
                  {String(number + 1).padStart(2, "0")}
                </span>
                <span className="truncate text-sm">
                  {topics[number % topics.length]}
                </span>
              </li>
            );
          })}
        </ul>
      </React.ViewTransition>
      <Pagination
        total={TOTAL}
        page={page}
        onPageChange={setPage}
        size={narrow ? "sm" : "md"}
        siblings={narrow ? 0 : 1}
        className="mx-auto"
      />
    </div>
  );
};
