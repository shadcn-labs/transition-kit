import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export const ComponentPreview = ({
  bare = false,
  className,
  children,
}: {
  /**
   * Render children directly, without the bordered preview container. Use it
   * when the demo already draws its own window, like the page demos.
   */
  bare?: boolean;
  /** Unused, kept so existing pages keep working; the code lives under Installation. */
  name?: string;
  src?: string;
  title?: string;
  className?: string;
  children: ReactNode;
}) => {
  if (bare) {
    return <div className="mt-6">{children}</div>;
  }
  return (
    <div
      data-slot="component-preview"
      className={cn(
        "@container bg-background mt-6 flex min-h-96 w-full items-center justify-center rounded-xl border p-4 sm:p-10",
        className
      )}
    >
      {children}
    </div>
  );
};
