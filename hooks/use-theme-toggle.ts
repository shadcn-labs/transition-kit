"use client";

import { useCallback, useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import { useFeedback } from "@/hooks/use-feedback";
import { useMetaColor } from "@/hooks/use-meta-color";
import type { ThemeTransitionOptions } from "@/registry/theme/theme-transition";
import { useThemeTransition } from "@/registry/theme/theme-transition";

export const useThemeToggle = () => {
  const { toggleTheme: toggleSiteTheme, resolvedTheme } = useThemeTransition();
  const { setMetaColor, metaColor } = useMetaColor();
  const feedbackOn = useFeedback({ sound: "toggleOn" });
  const feedbackOff = useFeedback({ sound: "toggleOff" });

  useEffect(() => {
    setMetaColor(metaColor);
  }, [metaColor, setMetaColor]);

  // One toggle implementation: the provider's, shared by every control.
  const toggleTheme = useCallback(
    (options?: ThemeTransitionOptions) => {
      if (resolvedTheme === "dark") {
        feedbackOn();
      } else {
        feedbackOff();
      }
      toggleSiteTheme(options);
    },
    [resolvedTheme, toggleSiteTheme, feedbackOn, feedbackOff]
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
