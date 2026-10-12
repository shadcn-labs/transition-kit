"use client";

import { useId } from "react";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";
import { useThemeTransition } from "@/registry/theme/theme-transition";

const RAYS = [
  "M12 1v2",
  "M12 21v2",
  "m4.22 4.22 1.42 1.42",
  "m18.36 18.36 1.42 1.42",
  "M1 12h2",
  "M21 12h2",
  "m4.22 19.78 1.42-1.42",
  "m18.36 5.64 1.42-1.42",
];

export interface AnimatedThemeTogglerProps extends ComponentProps<"button"> {
  /** Style slug, e.g. `"circle-reveal"`. Defaults to the provider's `transition`. */
  transition?: string;
}

export const AnimatedThemeToggler = ({
  transition,
  className,
  onClick,
  ...props
}: AnimatedThemeTogglerProps) => {
  const { mounted, resolvedTheme, toggleTheme } = useThemeTransition();
  const maskId = useId();

  let label = "Toggle theme";
  if (mounted) {
    label =
      resolvedTheme === "dark"
        ? "Switch to light theme"
        : "Switch to dark theme";
  }

  return (
    <button
      type="button"
      data-slot="animated-theme-toggler"
      aria-label={label}
      className={cn(
        "text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring/50 dark:hover:bg-accent/50 inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md transition-[color,background-color,box-shadow] outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          toggleTheme({ origin: event, transition });
        }
      }}
      {...props}
    >
      {/*
       * The morph follows the `dark` class on <html>, which the provider flips
       * inside the transition, so the icon is right before hydration and its
       * CSS transitions play in the live new snapshot as the style reveals it.
       */}
      <svg
        aria-hidden="true"
        data-slot="animated-theme-toggler-icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pointer-events-none size-5 shrink-0 [&_*]:origin-center [&_*]:transition-[translate,scale,rotate,opacity] [&_*]:duration-500 [&_*]:ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:[&_*]:transition-none"
      >
        <mask id={maskId}>
          <rect width="24" height="24" fill="white" />
          {/* Slides over the disc to carve the moon's crescent. */}
          <circle
            cx="19"
            cy="5"
            r="8"
            fill="black"
            className="translate-x-[12px] -translate-y-[12px] dark:translate-x-0 dark:translate-y-0"
          />
        </mask>
        <circle
          cx="12"
          cy="12"
          r="9"
          fill="currentColor"
          stroke="none"
          mask={`url(#${maskId})`}
          className="scale-[0.45] rotate-90 dark:scale-100 dark:rotate-0"
        />
        <g className="dark:scale-50 dark:rotate-90 dark:opacity-0">
          {RAYS.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
      </svg>
    </button>
  );
};
