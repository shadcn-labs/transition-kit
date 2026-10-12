"use client";

import {
  addTransitionType,
  startTransition,
  useLayoutEffect,
  useRef,
  ViewTransition,
} from "react";
import type { ComponentProps, ReactNode } from "react";

/** Transition type for backward navigations; reverses directional styles. */
export const PAGE_BACK_TYPE = "page-back";

/**
 * Runs a navigation as a React Transition so `<PageTransition>` animates it.
 * Works with any router whose navigation is a React state update, e.g.
 * `router.push` (Next.js), `navigate` (React Router) or plain `setState`.
 */
export const navigateWithTransition = (
  navigate: () => void,
  { direction = "forward" }: { direction?: "forward" | "back" } = {}
) => {
  startTransition(() => {
    if (direction === "back") {
      addTransitionType(PAGE_BACK_TYPE);
    }
    navigate();
  });
};

/**
 * Writes the viewport centre in the frame's own coordinates, so styles can
 * pivot around what the user sees instead of the middle of a long page.
 */
const writeCenter = (element: HTMLElement, phase: "enter" | "exit") => {
  const rect = element.getBoundingClientRect();
  const { style } = document.documentElement;
  style.setProperty(
    `--tk-${phase}-cx`,
    `${window.innerWidth / 2 - rect.left}px`
  );
  style.setProperty(
    `--tk-${phase}-cy`,
    `${window.innerHeight / 2 - rect.top}px`
  );
};

const PageTransitionFrame = (props: ComponentProps<"div">) => {
  const ref = useRef<HTMLDivElement>(null);

  // The new frame mounts and the old one unmounts inside React's view
  // transition update, before either snapshot is animated.
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    writeCenter(element, "enter");
    return () => writeCenter(element, "exit");
  }, []);

  return <div ref={ref} data-slot="page-transition" {...props} />;
};

export interface PageTransitionProps extends ComponentProps<"div"> {
  /** Identifies the current page, usually the pathname. A new id animates. */
  id: string;
  /** Style slug, e.g. `"slide"`. */
  transition?: string;
  /** Overrides the style's duration, in milliseconds. */
  duration?: number;
  /** Overrides the style's easing function. */
  easing?: string;
  children: ReactNode;
}

/**
 * Animates between pages with React's `<ViewTransition>`: the old page exits
 * and the new one enters whenever `id` changes inside a Transition.
 */
export const PageTransition = ({
  id,
  transition = "fade",
  duration,
  easing,
  children,
  ...props
}: PageTransitionProps) => {
  const base = `tk-page tk-page-${transition}`;

  useLayoutEffect(() => {
    const { style } = document.documentElement;
    if (duration === undefined) {
      style.removeProperty("--tk-page-duration");
    } else {
      style.setProperty("--tk-page-duration", `${duration}ms`);
    }
    if (easing === undefined) {
      style.removeProperty("--tk-page-easing");
    } else {
      style.setProperty("--tk-page-easing", easing);
    }
  }, [duration, easing]);

  return (
    <ViewTransition
      key={id}
      default="none"
      enter={{
        [PAGE_BACK_TYPE]: `${base} tk-page-enter tk-page-back`,
        default: `${base} tk-page-enter`,
      }}
      exit={{
        [PAGE_BACK_TYPE]: `${base} tk-page-exit tk-page-back`,
        default: `${base} tk-page-exit`,
      }}
    >
      <PageTransitionFrame {...props}>{children}</PageTransitionFrame>
    </ViewTransition>
  );
};
