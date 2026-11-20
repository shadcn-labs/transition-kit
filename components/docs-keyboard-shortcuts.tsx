"use client";

import { useNavigate } from "@tanstack/react-router";
import { useHotkeys } from "react-hotkeys-hook";

import { useFeedback } from "@/hooks/use-feedback";

export const DocsKeyboardShortcuts = ({
  previous,
  next,
}: {
  previous: string | null;
  next: string | null;
}) => {
  const navigateTo = useNavigate();
  const playClick = useFeedback({ sound: "click" });

  const options = {
    ignoreEventWhen: (event: KeyboardEvent) =>
      event.defaultPrevented || Boolean(document.querySelector("dialog:modal")),
    preventDefault: true,
  };

  const navigate = (
    href: string | null,
    direction: "nav-forward" | "nav-back"
  ) => {
    if (href) {
      playClick();
      void navigateTo({ to: href, viewTransition: { types: [direction] } });
    }
  };

  useHotkeys(
    "ArrowRight",
    () => {
      navigate(next, "nav-forward");
    },
    options
  );

  useHotkeys(
    "ArrowLeft",
    () => {
      navigate(previous, "nav-back");
    },
    options
  );

  return null;
};
