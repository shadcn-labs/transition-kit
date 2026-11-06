"use client";

import { useFeedback } from "@/hooks/use-feedback";
import { cn } from "@/lib/utils";
import { getItem } from "@/registry/items";
import { useThemeTransition } from "@/registry/theme/theme-transition";

const STYLES = [
  "circle-reveal",
  "clock-wipe",
  "star-reveal",
  "wave-reveal",
  "venetian-blinds",
  "checkerboard-reveal",
];

/** Flips the whole site's theme with the chosen style, so visitors feel it first. */
export const HomeThemeTry = ({ className }: { className?: string }) => {
  const { toggleTheme } = useThemeTransition();
  const feedback = useFeedback({ sound: "toggleOn" });

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-1.5",
        className
      )}
    >
      <span className="text-muted-foreground mr-1 text-xs">Try it</span>
      {STYLES.map((slug) => (
        <button
          key={slug}
          type="button"
          onClick={(event) => {
            feedback();
            toggleTheme({ origin: event, transition: slug });
          }}
          className="text-muted-foreground hover:text-foreground hover:border-foreground/20 focus-visible:ring-ring/50 h-7 cursor-pointer rounded-full border px-3 text-xs transition-colors outline-none focus-visible:ring-[3px]"
        >
          <span className="sr-only">Switch theme with </span>
          {getItem(`theme/${slug}`)?.title ?? slug}
        </button>
      ))}
    </div>
  );
};
