"use client";

import {
  addTransitionType,
  createContext,
  startTransition,
  use,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  ViewTransition,
} from "react";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

/** Transition type added to every theme change, see `addTransitionType`. */
export const THEME_TRANSITION_TYPE = "theme-transition";

/**
 * Where the transition starts. Pass the click event to start at the pointer
 * (keyboard clicks fall back to the button's centre), an element to start at
 * its centre, or nothing to start at the centre of the viewport.
 */
export type ThemeTransitionOrigin =
  | {
      clientX: number;
      clientY: number;
      currentTarget?: EventTarget | null;
    }
  | Element;

export interface ThemeTransitionOptions {
  /** Style slug, e.g. `"circle-reveal"`. Defaults to the provider's `transition`. */
  transition?: string;
  origin?: ThemeTransitionOrigin;
}

interface ThemeTransitionContextValue {
  /** `false` on the server and until the stored theme has been read. */
  mounted: boolean;
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme, options?: ThemeTransitionOptions) => void;
  toggleTheme: (options?: ThemeTransitionOptions) => void;
}

const ThemeTransitionContext =
  createContext<ThemeTransitionContextValue | null>(null);

const DARK_QUERY = "(prefers-color-scheme: dark)";

const isTheme = (value: unknown): value is Theme =>
  value === "light" || value === "dark" || value === "system";

/**
 * Inline script that applies the stored theme before the first paint. Render
 * it in `<head>` through `<ThemeTransitionScript />`.
 */
export const getThemeScript = (
  storageKey = "theme",
  defaultTheme: Theme = "system"
) =>
  `(function(){try{var t=localStorage.getItem(${JSON.stringify(storageKey)})||${JSON.stringify(defaultTheme)};var d=t==="dark"||(t==="system"&&matchMedia(${JSON.stringify(DARK_QUERY)}).matches);var r=document.documentElement;r.classList.remove("light","dark");r.classList.add(d?"dark":"light");r.style.colorScheme=d?"dark":"light"}catch(e){}})()`;

export const ThemeTransitionScript = ({
  storageKey,
  defaultTheme,
  nonce,
}: {
  storageKey?: string;
  defaultTheme?: Theme;
  nonce?: string;
}) => (
  <script
    nonce={nonce}
    suppressHydrationWarning
    // oxlint-disable-next-line react/no-danger -- runs before hydration to avoid a flash of the wrong theme
    dangerouslySetInnerHTML={{
      __html: getThemeScript(storageKey, defaultTheme),
    }}
  />
);

/**
 * Writes the transition geometry to the root element (view transition
 * pseudo-elements inherit from it), in the coordinate space of the snapshot
 * (the provider's element), so styles can place masks and clip paths relative
 * to what the user sees. Also writes the optional duration/easing overrides.
 */
const writeTransitionVars = (
  element: HTMLElement,
  origin: ThemeTransitionOrigin | undefined,
  duration: number | undefined,
  easing: string | undefined
) => {
  const rect = element.getBoundingClientRect();
  const width = window.innerWidth;
  const height = window.innerHeight;

  let x = width / 2;
  let y = height / 2;
  if (origin instanceof Element) {
    const box = origin.getBoundingClientRect();
    x = box.left + box.width / 2;
    y = box.top + box.height / 2;
  } else if (origin) {
    const target = origin.currentTarget;
    // Keyboard activation reports a (0, 0) click; use the control instead.
    if (
      origin.clientX === 0 &&
      origin.clientY === 0 &&
      target instanceof Element
    ) {
      const box = target.getBoundingClientRect();
      x = box.left + box.width / 2;
      y = box.top + box.height / 2;
    } else {
      x = origin.clientX;
      y = origin.clientY;
    }
  }

  const radius = Math.hypot(Math.max(x, width - x), Math.max(y, height - y));
  const { style } = document.documentElement;
  style.setProperty("--tk-x", `${x - rect.left}px`);
  style.setProperty("--tk-y", `${y - rect.top}px`);
  style.setProperty("--tk-left", `${-rect.left}px`);
  style.setProperty("--tk-top", `${-rect.top}px`);
  style.setProperty("--tk-cx", `${width / 2 - rect.left}px`);
  style.setProperty("--tk-cy", `${height / 2 - rect.top}px`);
  style.setProperty("--tk-r", `${radius}px`);
  if (duration === undefined) {
    style.removeProperty("--tk-theme-duration");
  } else {
    style.setProperty("--tk-theme-duration", `${duration}ms`);
  }
  if (easing === undefined) {
    style.removeProperty("--tk-theme-easing");
  } else {
    style.setProperty("--tk-theme-easing", easing);
  }
};

export interface ThemeTransitionProviderProps extends Omit<
  ComponentProps<"div">,
  "children"
> {
  children: ReactNode;
  /** Style used when `setTheme` is called without one. */
  transition?: string;
  defaultTheme?: Theme;
  storageKey?: string;
  /** Overrides every style's duration, in milliseconds. */
  duration?: number;
  /** Overrides every style's easing function. */
  easing?: string;
}

/**
 * Owns the theme and animates every change with React's `<ViewTransition>`.
 *
 * Wrap everything the user sees: the element it renders is what gets
 * snapshotted. Updates inside `children` never animate through it; only theme
 * changes do.
 */
export const ThemeTransitionProvider = ({
  children,
  transition = "circle-reveal",
  defaultTheme = "system",
  storageKey = "theme",
  duration,
  easing,
  className,
  ...props
}: ThemeTransitionProviderProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<{
    theme: Theme;
    transition: string;
  } | null>(null);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>("light");

  useEffect(() => {
    const query = window.matchMedia(DARK_QUERY);
    const sync = () => setSystemTheme(query.matches ? "dark" : "light");
    sync();
    query.addEventListener("change", sync);

    const stored = window.localStorage.getItem(storageKey);
    setState({
      theme: isTheme(stored) ? stored : defaultTheme,
      transition,
    });

    const onStorage = (event: StorageEvent) => {
      if (event.key === storageKey && isTheme(event.newValue)) {
        const theme = event.newValue;
        setState((current) => ({
          theme,
          transition: current?.transition ?? transition,
        }));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      query.removeEventListener("change", sync);
      window.removeEventListener("storage", onStorage);
    };
    // Read the stored theme once; later prop changes only affect new transitions.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const theme = state?.theme ?? defaultTheme;
  const resolvedTheme = theme === "system" ? systemTheme : theme;

  // Layout effects run inside React's view transition update, so the root
  // class is already flipped when the browser captures the new snapshot.
  useLayoutEffect(() => {
    if (!state) {
      return;
    }
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme, state]);

  const setTheme = useCallback(
    (next: Theme, options: ThemeTransitionOptions = {}) => {
      window.localStorage.setItem(storageKey, next);
      if (ref.current) {
        writeTransitionVars(ref.current, options.origin, duration, easing);
      }
      startTransition(() => {
        addTransitionType(THEME_TRANSITION_TYPE);
        setState({ theme: next, transition: options.transition ?? transition });
      });
    },
    [duration, easing, storageKey, transition]
  );

  const toggleTheme = useCallback(
    (options?: ThemeTransitionOptions) =>
      setTheme(resolvedTheme === "dark" ? "light" : "dark", options),
    [resolvedTheme, setTheme]
  );

  const mounted = state !== null;
  const value = useMemo(
    () => ({ mounted, resolvedTheme, setTheme, theme, toggleTheme }),
    [mounted, resolvedTheme, setTheme, theme, toggleTheme]
  );

  const activeTransition = state?.transition ?? transition;

  return (
    <ThemeTransitionContext value={value}>
      <ViewTransition
        default="none"
        update={{
          [THEME_TRANSITION_TYPE]: `tk-theme tk-theme-${activeTransition}`,
          default: "none",
        }}
      >
        <div
          ref={ref}
          data-slot="theme-transition"
          data-theme={state ? resolvedTheme : undefined}
          className={cn("bg-background text-foreground min-h-svh", className)}
          {...props}
        >
          <ViewTransition update="none">{children}</ViewTransition>
        </div>
      </ViewTransition>
    </ThemeTransitionContext>
  );
};

export const useThemeTransition = () => {
  const context = use(ThemeTransitionContext);
  if (!context) {
    throw new Error(
      "useThemeTransition must be used within <ThemeTransitionProvider>."
    );
  }
  return context;
};
