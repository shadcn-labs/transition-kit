"use client";

import { MoonIcon, SunIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useThemeTransition } from "@/registry/theme/theme-transition";

export const ThemeTransitionDemo = ({ transition }: { transition: string }) => {
  const { toggleTheme } = useThemeTransition();

  return (
    <Button
      type="button"
      variant="outline"
      onClick={(event) => toggleTheme({ origin: event, transition })}
    >
      <SunIcon className="dark:hidden" aria-hidden />
      <MoonIcon className="hidden dark:block" aria-hidden />
      Toggle theme
    </Button>
  );
};
