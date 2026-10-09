"use client";

import type { ToasterProps } from "sonner";
import { Toaster as Sonner } from "sonner";

import { useThemeTransition } from "@/registry/theme/theme-transition";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useThemeTransition();

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-border": "var(--border)",
          "--normal-text": "var(--popover-foreground)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
