"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export const ScrollFade = ({
  children,
  className,
  viewportClassName,
}: {
  children: React.ReactNode;
  className?: string;
  viewportClassName?: string;
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [atEnd, setAtEnd] = useState(false);

  const update = useCallback(() => {
    const el = viewportRef.current;
    if (el) {
      setAtEnd(el.scrollHeight - el.scrollTop - el.clientHeight < 4);
    }
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) {
      return;
    }
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    for (const child of el.children) {
      observer.observe(child);
    }
    return () => observer.disconnect();
  }, [update]);

  return (
    <div className={cn("relative flex min-h-0 flex-col", className)}>
      <div
        ref={viewportRef}
        onScroll={update}
        className={cn(
          "no-scrollbar min-h-0 flex-1 overflow-y-auto",
          viewportClassName
        )}
      >
        {children}
      </div>
      <div
        aria-hidden="true"
        data-hidden={atEnd}
        className="from-background pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-linear-to-t to-transparent mask-[linear-gradient(to_top,#000_35%,transparent)] backdrop-blur-[2px] transition-opacity duration-200 data-[hidden=true]:opacity-0"
      />
    </div>
  );
};
