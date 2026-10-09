"use client";

import { useCallback, useId } from "react";

/** Transition types for directional animations, see `addTransitionType`. */
export const FORWARD = "tk-forward";
export const BACK = "tk-back";

/**
 * A View Transition Class for `<ViewTransition>` props: the `tk-ui` base class
 * plus the given `ui-transition.css` classes, e.g. `tk("tk-morph", "tk-top")`.
 */
export const tk = (...classes: (string | false | null | undefined)[]) =>
  ["tk-ui", ...classes].filter(Boolean).join(" ");

const unsafeIdent = /[^\w-]/g;

/** Builds a `<ViewTransition name>` unique to one component instance. */
export type TransitionNames = (...parts: (string | number)[]) => string;

/**
 * Returns a function that builds `<ViewTransition name>`s unique to this
 * component instance, so two instances on one page never pair up. Only use
 * names for shared elements; React names everything else automatically.
 */
export const useTransitionNames = (): TransitionNames => {
  const id = useId().replace(unsafeIdent, "");
  return useCallback(
    (...parts) => `tk-${id}-${parts.join("-").replace(unsafeIdent, "_")}`,
    [id]
  );
};
