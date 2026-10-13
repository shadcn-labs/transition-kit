"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";
import { useThemeTransition } from "@/registry/theme/theme-transition";

export interface ThemeToggleSwitchProps extends ComponentProps<"button"> {
  /** Style slug, e.g. `"circle-reveal"`. Defaults to the provider's `transition`. */
  transition?: string;
}

export const ThemeToggleSwitch = ({
  transition,
  className,
  onClick,
  ...props
}: ThemeToggleSwitchProps) => {
  const { mounted, resolvedTheme, toggleTheme } = useThemeTransition();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={mounted && resolvedTheme === "dark"}
      aria-label="Dark mode"
      data-slot="theme-toggle-switch"
      className={cn(
        "bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-primary inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent p-0.5 shadow-xs transition-[background-color,box-shadow] outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50",
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
      {/* The thumb follows the `dark` class on <html>, so it is right before hydration. */}
      <span
        data-slot="theme-toggle-switch-thumb"
        className="bg-background text-foreground pointer-events-none flex size-5 items-center justify-center rounded-full shadow-sm transition-transform duration-200 motion-reduce:transition-none dark:translate-x-5 [&_svg]:size-3"
      >
        <SunIcon aria-hidden="true" className="dark:hidden" />
        <MoonIcon aria-hidden="true" className="hidden dark:block" />
      </span>
    </button>
  );
};
