"use client";

import { ChevronLeft } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";
import {
  BACK,
  FORWARD,
  tk,
  useTransitionNames,
} from "@/registry/ui/ui-transition";

type StackParams = Record<string, unknown>;

interface StackEntry<P extends StackParams = StackParams> {
  /** Unique per entry, so the same screen can sit in the stack twice. */
  key: string;
  screen: string;
  params: P;
}

type Direction = typeof FORWARD | typeof BACK;

type ScreenSlot<P extends StackParams> =
  | React.ReactNode
  | ((params: P) => React.ReactNode);

interface StackScreenProps<P extends StackParams = StackParams> {
  name: string;
  /** Header title. Morphs into the back button when a screen is pushed on top. */
  title?: ScreenSlot<P>;
  /** Trailing header content, e.g. an icon button. */
  actions?: ScreenSlot<P>;
  render: (params: P) => React.ReactNode;
}

interface StackApi {
  stack: StackEntry[];
  push: (screen: string, params?: StackParams) => void;
  pop: () => void;
  popToRoot: () => void;
}

type Navigate = (
  owner: string | null,
  direction: Direction,
  update: (stack: StackEntry[]) => StackEntry[]
) => boolean;

const StackContext = React.createContext<{
  stack: StackEntry[];
  navigate: Navigate;
} | null>(null);

/** Key of the entry a hook is rendered under; null in the header or outside screens. */
const EntryContext = React.createContext<string | null>(null);

let entryCount = 0;

// The screen area pushes in the direction of the navigation.
const viewportUpdate = {
  [BACK]: tk("tk-morph", "tk-push", "tk-clip", "tk-back"),
  [FORWARD]: tk("tk-morph", "tk-push", "tk-clip", "tk-forward"),
  default: "none",
};
// Header parts: titles morph into the back button and back, the rest fades.
const titleClass = tk("tk-morph", "tk-text", "tk-fade");
const fadeClass = tk("tk-morph", "tk-fade");

const resolve = <P extends StackParams>(slot: ScreenSlot<P>, params: P) =>
  typeof slot === "function" ? slot(params) : slot;

/** Defines a screen. Rendered by `<StackNavigator>`, which reads its props. */
const StackScreen = <P extends StackParams = StackParams>(
  _props: StackScreenProps<P>
): React.ReactNode => null;

/**
 * Navigation for the screen it's rendered in. Calls from a screen that is no
 * longer on top are ignored, so double clicks and rapid taps can't push twice.
 */
const useStack = (): StackApi => {
  const context = React.useContext(StackContext);
  const owner = React.useContext(EntryContext);
  if (!context) {
    throw new Error("useStack must be used within <StackNavigator>.");
  }
  const { navigate, stack } = context;
  return React.useMemo(
    () => ({
      pop: () => {
        navigate(owner, BACK, (prev) =>
          prev.length > 1 ? prev.slice(0, -1) : prev
        );
      },
      popToRoot: () => {
        navigate(owner, BACK, (prev) =>
          prev.length > 1 ? prev.slice(0, 1) : prev
        );
      },
      push: (screen, params = {}) => {
        entryCount += 1;
        const key = `stack-${entryCount}`;
        navigate(owner, FORWARD, (prev) => [...prev, { key, params, screen }]);
      },
      stack,
    }),
    [navigate, owner, stack]
  );
};

const focusOptions = { preventScroll: true };

const StackNavigator = ({
  stack: stackProp,
  onStackChange,
  initialScreen,
  initialParams,
  className,
  children,
  onKeyDown,
  ...props
}: React.ComponentProps<"div"> & {
  /** Controlled stack, root first. */
  stack?: StackEntry[];
  onStackChange?: (stack: StackEntry[]) => void;
  /** Uncontrolled root screen. Defaults to the first `<StackScreen>`. */
  initialScreen?: string;
  initialParams?: StackParams;
}) => {
  const screens = new Map<string, StackScreenProps>();
  const rest: React.ReactNode[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.type === StackScreen) {
      const screen = child.props as StackScreenProps;
      screens.set(screen.name, screen);
    } else {
      rest.push(child);
    }
  });

  const [uncontrolled, setUncontrolled] = React.useState<StackEntry[]>(() => [
    {
      key: "root",
      params: initialParams ?? {},
      screen: initialScreen ?? screens.keys().next().value ?? "",
    },
  ]);
  // Counts committed navigations, so we know when every requested one landed.
  const [navigations, setNavigations] = React.useState(0);
  const stack = stackProp ?? uncontrolled;
  const names = useTransitionNames();

  const rootRef = React.useRef<HTMLDivElement>(null);
  const screenRefs = React.useRef(new Map<string, HTMLElement>());
  const focusMemory = React.useRef(new Map<string, HTMLElement>());
  const moveFocus = React.useRef(false);
  // The stack after every requested navigation. React commits transitions
  // later (after a running one finishes), so rapid calls build on this
  // instead of the last render.
  const intended = React.useRef(stack);
  const requested = React.useRef(0);

  React.useLayoutEffect(() => {
    if (navigations === requested.current) {
      intended.current = stack;
    }
  }, [navigations, stack]);

  const navigate = React.useCallback<Navigate>(
    (owner, nextDirection, update) => {
      const prev = intended.current;
      const top = prev.at(-1);
      if (owner !== null && top?.key !== owner) {
        return false;
      }
      const next = update(prev);
      if (next === prev) {
        return false;
      }
      intended.current = next;
      requested.current += 1;

      const active = document.activeElement;
      moveFocus.current =
        active === null ||
        active === document.body ||
        Boolean(rootRef.current?.contains(active));
      const topScreen = top && screenRefs.current.get(top.key);
      if (
        nextDirection === FORWARD &&
        top &&
        active instanceof HTMLElement &&
        topScreen?.contains(active)
      ) {
        focusMemory.current.set(top.key, active);
      }

      React.startTransition(() => {
        React.addTransitionType(nextDirection);
        setNavigations((count) => count + 1);
        setUncontrolled(next);
        onStackChange?.(next);
      });
      return true;
    },
    [onStackChange]
  );

  const topEntry = stack.at(-1);
  const topKey = topEntry?.key;

  // Runs in React's commit, inside the view transition, so focus lands before
  // the new snapshot: into the pushed screen, or back on the row that pushed it.
  React.useLayoutEffect(() => {
    const keys = new Set(stack.map((entry) => entry.key));
    for (const key of focusMemory.current.keys()) {
      if (!keys.has(key)) {
        focusMemory.current.delete(key);
      }
    }
    if (!moveFocus.current || topKey === undefined) {
      return;
    }
    moveFocus.current = false;
    const screen = screenRefs.current.get(topKey);
    const remembered = focusMemory.current.get(topKey);
    focusMemory.current.delete(topKey);
    if (remembered?.isConnected && screen?.contains(remembered)) {
      remembered.focus(focusOptions);
    } else {
      screen?.focus(focusOptions);
    }
  }, [topKey, stack]);

  const context = React.useMemo(() => ({ navigate, stack }), [navigate, stack]);

  const back = () =>
    navigate(null, BACK, (prev) =>
      prev.length > 1 ? prev.slice(0, -1) : prev
    );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.key === "Escape" && !event.defaultPrevented && back()) {
      event.preventDefault();
    }
  };

  const previous = stack.at(-2);
  const previousScreen = previous && screens.get(previous.screen);
  const previousTitle =
    previous && resolve(previousScreen?.title, previous.params);
  const topScreen = topEntry && screens.get(topEntry.screen);
  const title = topEntry && resolve(topScreen?.title, topEntry.params);
  const actions = topEntry && resolve(topScreen?.actions, topEntry.params);
  const headingId = names("heading");

  return (
    <StackContext.Provider value={context}>
      <div
        ref={rootRef}
        data-slot="stack-navigator"
        onKeyDown={handleKeyDown}
        className={cn(
          "bg-card text-card-foreground relative flex h-96 w-full flex-col overflow-hidden rounded-xl border text-sm",
          className
        )}
        {...props}
      >
        <header
          data-slot="stack-header"
          className="@container/stack-header grid h-12 shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 border-b px-2"
        >
          <div className="flex min-w-0 justify-start">
            {previous ? (
              // Fades in with the first push and out with the last pop; the
              // title inside keeps its own name, so it morphs instead. React
              // only runs enter/exit on a boundary placed above the DOM node.
              <React.ViewTransition
                default="none"
                enter={fadeClass}
                exit={fadeClass}
              >
                <button
                  type="button"
                  data-slot="stack-back"
                  aria-label={
                    typeof previousTitle === "string"
                      ? `Back to ${previousTitle}`
                      : "Back"
                  }
                  onClick={back}
                  className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 flex h-8 max-w-full min-w-0 cursor-pointer items-center gap-0.5 rounded-md pr-2 pl-1 font-medium transition-colors outline-none focus-visible:ring-[3px]"
                >
                  <ChevronLeft aria-hidden className="size-5 shrink-0" />
                  {previousTitle ? (
                    // Shares its name with the title of the screen below, so
                    // a push morphs the title into here and a pop morphs it back.
                    <React.ViewTransition
                      key={previous.key}
                      name={names("title", previous.key)}
                      default="none"
                      share={titleClass}
                      enter={titleClass}
                      exit={titleClass}
                    >
                      <span className="truncate">{previousTitle}</span>
                    </React.ViewTransition>
                  ) : null}
                </button>
              </React.ViewTransition>
            ) : null}
          </div>
          {title && topEntry ? (
            <React.ViewTransition
              key={topEntry.key}
              name={names("title", topEntry.key)}
              default="none"
              share={titleClass}
              enter={titleClass}
              exit={titleClass}
            >
              <div
                id={headingId}
                data-slot="stack-title"
                className="max-w-[50cqw] truncate font-semibold"
              >
                {title}
              </div>
            </React.ViewTransition>
          ) : (
            <div />
          )}
          <div className="flex min-w-0 items-center justify-end">
            {actions && topEntry ? (
              <EntryContext.Provider value={topEntry.key}>
                <React.ViewTransition
                  key={topEntry.key}
                  default="none"
                  enter={fadeClass}
                  exit={fadeClass}
                >
                  <div
                    data-slot="stack-actions"
                    className="flex items-center gap-1"
                  >
                    {actions}
                  </div>
                </React.ViewTransition>
              </EntryContext.Provider>
            ) : null}
          </div>
        </header>
        {/* The header stays put; only the screen area below it pushes. The
            old and new top screens share this box, so they are one group. */}
        <React.ViewTransition default="none" update={viewportUpdate}>
          <div
            data-slot="stack-viewport"
            className="relative min-h-0 flex-1 rounded-b-[inherit]"
          >
            {stack.map((entry) => {
              const screen = screens.get(entry.screen);
              if (!screen) {
                throw new Error(`No <StackScreen name="${entry.screen}">.`);
              }
              const active = entry.key === topKey;
              return (
                // Lower screens stay mounted, hidden, so drafts and scroll survive a pop.
                <section
                  key={entry.key}
                  ref={(element) => {
                    if (element) {
                      screenRefs.current.set(entry.key, element);
                    } else {
                      screenRefs.current.delete(entry.key);
                    }
                  }}
                  tabIndex={-1}
                  aria-labelledby={active && title ? headingId : undefined}
                  data-slot="stack-screen"
                  data-state={active ? "active" : "inactive"}
                  className={cn(
                    "bg-card absolute inset-0 overflow-y-auto overscroll-contain rounded-b-[inherit] outline-none",
                    !active && "invisible"
                  )}
                >
                  <EntryContext.Provider value={entry.key}>
                    {screen.render(entry.params)}
                  </EntryContext.Provider>
                </section>
              );
            })}
          </div>
        </React.ViewTransition>
        {rest}
      </div>
    </StackContext.Provider>
  );
};

export { StackNavigator, StackScreen, useStack };
export type { StackEntry, StackParams, StackScreenProps };
