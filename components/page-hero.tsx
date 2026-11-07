import type { ReactNode } from "react";

import { Announcement } from "@/components/announcement";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  description: ReactNode;
  descriptionClassName?: string;
  showAnnouncement?: boolean;
  title: ReactNode;
  titleClassName?: string;
}

export const PageHero = ({
  description,
  descriptionClassName,
  showAnnouncement = false,
  title,
  titleClassName,
}: PageHeroProps) => (
  <header className="relative flex flex-col items-center gap-4 text-center">
    {showAnnouncement && (
      <div className="absolute bottom-full left-1/2 mb-4 flex -translate-x-1/2">
        <div className="rise">
          <Announcement />
        </div>
      </div>
    )}
    <h1
      className={cn(
        "rise [--i:1] from-foreground to-foreground/70 bg-linear-to-b bg-clip-text pb-1 text-5xl font-semibold tracking-[-0.045em] text-transparent sm:text-6xl md:text-7xl",
        titleClassName
      )}
    >
      {title}
    </h1>
    <p
      className={cn(
        "rise [--i:2] text-muted-foreground max-w-lg text-base leading-relaxed text-balance",
        descriptionClassName
      )}
    >
      {description}
    </p>
  </header>
);
