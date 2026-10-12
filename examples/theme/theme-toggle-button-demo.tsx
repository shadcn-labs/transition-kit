"use client";

import { ThemeToggleButton } from "@/registry/theme/theme-toggle-button";

export const ThemeToggleButtonDemo = () => (
  <div className="flex items-center gap-3">
    <ThemeToggleButton />
    <ThemeToggleButton transition="circle-blur" />
    <ThemeToggleButton transition="polygon-reveal" />
  </div>
);
