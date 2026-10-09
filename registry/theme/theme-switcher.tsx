"use client";

import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useRef } from "react";
import type { ComponentProps, KeyboardEvent } from "react";

import { cn } from "@/lib/utils";
import { useThemeTransition } from "@/registry/theme/theme-transition";
import type { Theme } from "@/registry/theme/theme-transition";

const OPTIONS = [
  { icon: MonitorIcon, label: "System", value: "system" },
  { icon: SunIcon, label: "Light", value: "light" },
  { icon: MoonIcon, label: "Dark", value: "dark" },
] as const satisfies { icon: typeof SunIcon; label: string; value: Theme }[];

export interface ThemeSwitcherProps extends ComponentProps<"div"> {
  /** Style slug, e.g. `"circle-reveal"`. Defaults to the provider's `transition`. */
  transition?: string;
}

export const ThemeSwitcher = ({
  transition,
  className,
  onKeyDown,
  ...props
}: ThemeSwitcherProps) => {
  const { mounted, theme, setTheme } = useThemeTransition();
  // The stored theme is unknown on the server: select nothing until hydrated.
  const selected = mounted ? theme : undefined;
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) {
      return;
    }
    const current = OPTIONS.findIndex((option) => option.value === selected);
    const last = OPTIONS.length - 1;
    let next: number;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown": {
        next = current >= last ? 0 : current + 1;
        break;
      }
      case "ArrowLeft":
      case "ArrowUp": {
        next = current <= 0 ? last : current - 1;
        break;
      }
      case "Home": {
        next = 0;
        break;
      }
      case "End": {
        next = last;
        break;
      }
      default: {
        return;
      }
    }
    event.preventDefault();
    const target = optionRefs.current[next];
    target?.focus();
    setTheme(OPTIONS[next].value, { origin: target ?? undefined, transition });
  };

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      data-slot="theme-switcher"
      className={cn(
        "border-border bg-background inline-flex items-center gap-0.5 rounded-full border p-0.5",
        className
      )}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {OPTIONS.map(({ icon: Icon, label, value }, index) => {
        const checked = selected === value;
        // Roving tabindex: the checked option, or the first one when none is.
        const focusable = selected === undefined ? index === 0 : checked;
        return (
          <button
            key={value}
            ref={(node) => {
              optionRefs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={label}
            title={label}
            tabIndex={focusable ? 0 : -1}
            data-slot="theme-switcher-option"
            data-state={checked ? "checked" : "unchecked"}
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 data-[state=checked]:bg-muted data-[state=checked]:text-foreground inline-flex size-7 cursor-pointer items-center justify-center rounded-full transition-[color,background-color,box-shadow] outline-none focus-visible:ring-[3px] [&_svg]:pointer-events-none [&_svg]:size-4"
            onClick={(event) => setTheme(value, { origin: event, transition })}
          >
            <Icon aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
};
