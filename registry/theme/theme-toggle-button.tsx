"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";
import { useThemeTransition } from "@/registry/theme/theme-transition";

export interface ThemeToggleButtonProps extends ComponentProps<"button"> {
  /** Style slug, e.g. `"circle-reveal"`. Defaults to the provider's `transition`. */
  transition?: string;
}

export const ThemeToggleButton = ({
  transition,
  className,
  onClick,
  ...props
}: ThemeToggleButtonProps) => {
  const { mounted, resolvedTheme, toggleTheme } = useThemeTransition();

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
      data-slot="theme-toggle-button"
      aria-label={label}
      className={cn(
        "border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50 inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md border shadow-xs transition-[color,background-color,box-shadow] outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
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
      {/* The icons follow the `dark` class on <html>, so they are right before hydration. */}
      <SunIcon
        aria-hidden="true"
        data-slot="theme-toggle-button-sun"
        className="dark:hidden"
      />
      <MoonIcon
        aria-hidden="true"
        data-slot="theme-toggle-button-moon"
        className="hidden dark:block"
      />
    </button>
  );
};
