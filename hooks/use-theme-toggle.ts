"use client";

import { useCallback, useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { useFeedback } from "@/hooks/use-feedback";
import { useMetaColor } from "@/hooks/use-meta-color";
import type { ThemeTransitionOptions } from "@/registry/theme/theme-transition";
import { useThemeTransition } from "@/registry/theme/theme-transition";

export const useThemeToggle = () => {
  const { setTheme, resolvedTheme } = useThemeTransition();
  const { setMetaColor, metaColor } = useMetaColor();
  const feedbackOn = useFeedback({ sound: "toggleOn" });
  const feedbackOff = useFeedback({ sound: "toggleOff" });

  useEffect(() => {
    setMetaColor(metaColor);
  }, [metaColor, setMetaColor]);

  const toggleTheme = useCallback(
    (options?: ThemeTransitionOptions) => {
      const next = resolvedTheme === "dark" ? "light" : "dark";
      if (next === "dark") {
        feedbackOff();
      } else {
        feedbackOn();
      }
      setTheme(next, options);
    },
    [resolvedTheme, setTheme, feedbackOn, feedbackOff]
  );

  useHotkeys(
    "d",
    () => toggleTheme(),
    {
      preventDefault: true,
    },
    [toggleTheme]
  );

  return { toggleTheme };
};
