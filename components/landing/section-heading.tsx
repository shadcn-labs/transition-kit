import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
export const Accent = ({ children }: { children: ReactNode }) => (
  <span className="text-brand text-glow">{children}</span>
);

export const SectionHeading = ({
  className,
  description,
  title,
}: {
  className?: string;
  description?: ReactNode;
  title: ReactNode;
}) => (
  <div
    className={cn(
      "grid border-b md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:divide-x",
      className
    )}
  >
    <h2 className="px-4 pt-10 pb-3 text-3xl font-normal tracking-tight text-balance sm:text-4xl md:px-8 md:py-14 lg:text-5xl">
      {title}
    </h2>
    {description && (
      <p className="text-muted-foreground flex items-end px-4 pb-10 text-sm leading-relaxed text-balance sm:text-base md:px-8 md:py-14">
        {description}
      </p>
    )}
  </div>
);
