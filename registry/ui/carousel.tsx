"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";
import {
  BACK,
  FORWARD,
  tk,
  useTransitionNames,
} from "@/registry/ui/ui-transition";
import type { TransitionNames } from "@/registry/ui/ui-transition";

type Direction = typeof FORWARD | typeof BACK;

interface CarouselApi {
  /** The slide on screen. */
  index: number;
  /** The number of `CarouselItem`s. */
  count: number;
  loop: boolean;
  /** Whether autoplay is running right now (not paused or disabled). */
  playing: boolean;
  canPrevious: boolean;
  canNext: boolean;
  /** Goes to a slide. When looping, it travels the shortest way round. */
  goTo: (index: number) => void;
  previous: () => void;
  next: () => void;
}

interface CarouselContextValue extends CarouselApi {
  name: TransitionNames;
  setCount: (count: number) => void;
}

const CarouselContext = React.createContext<CarouselContextValue | null>(null);
const CarouselItemContext = React.createContext<number | null>(null);

const useCarouselContext = () => {
  const context = React.useContext(CarouselContext);
  if (!context) {
    throw new Error("Carousel parts must be used within <Carousel>.");
  }
  return context;
};

/** State and controls of the surrounding `<Carousel>`, for custom parts. */
const useCarousel = (): CarouselApi => {
  const { name: _name, setCount: _setCount, ...api } = useCarouselContext();
  return api;
};

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

const subscribeVisibility = (onChange: () => void) => {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
};

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

const subscribeReducedMotion = (onChange: () => void) => {
  const query = window.matchMedia(reducedMotionQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

const slideClasses = ["tk-morph", "tk-push", "tk-clip", "tk-carousel-slide"];
const slideUpdate = {
  [BACK]: tk(...slideClasses, "tk-back"),
  [FORWARD]: tk(...slideClasses, "tk-forward"),
  default: "none",
};

const clamp = (index: number, count: number) =>
  Math.min(Math.max(index, 0), Math.max(count - 1, 0));

const Carousel = ({
  index: indexProp,
  defaultIndex = 0,
  onIndexChange,
  loop = false,
  autoplay,
  className,
  onKeyDown,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ...props
}: React.ComponentProps<"div"> & {
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  /** Wraps from the last slide to the first and back. */
  loop?: boolean;
  /** Advances every `autoplay` milliseconds. */
  autoplay?: number;
}) => {
  const [uncontrolled, setUncontrolled] = React.useState(defaultIndex);
  // Counts committed moves, so we know when every requested one has landed.
  const [moves, setMoves] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const [hovered, setHovered] = React.useState(false);
  const [keyboardFocus, setKeyboardFocus] = React.useState(false);
  const visible = React.useSyncExternalStore(
    subscribeVisibility,
    () => document.visibilityState === "visible",
    () => true
  );
  const reducedMotion = React.useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(reducedMotionQuery).matches,
    () => false
  );
  const name = useTransitionNames();
  const index = clamp(indexProp ?? uncontrolled, count);
  const playing =
    Boolean(autoplay) &&
    count > 1 &&
    visible &&
    !hovered &&
    !keyboardFocus &&
    !reducedMotion;

  // Read by the stable callbacks below, so a handler created before a render
  // never acts on a stale index.
  const latest = React.useRef({ count, index, loop, moves, onIndexChange });
  useIsomorphicLayoutEffect(() => {
    latest.current = { count, index, loop, moves, onIndexChange };
  });
  // Clicks can land before React commits the previous move (it waits for a
  // running transition to finish); they continue from the slide on its way in.
  const requested = React.useRef({ moves: 0, target: 0 });

  const go = React.useCallback((target: number, direction: Direction) => {
    requested.current = { moves: requested.current.moves + 1, target };
    React.startTransition(() => {
      React.addTransitionType(direction);
      setMoves((value) => value + 1);
      setUncontrolled(target);
      latest.current.onIndexChange?.(target);
    });
  }, []);

  // The slide the next move starts from.
  const base = React.useCallback(
    () =>
      requested.current.moves === latest.current.moves
        ? latest.current.index
        : requested.current.target,
    []
  );

  const step = React.useCallback(
    (delta: 1 | -1) => {
      const { count: total, loop: wraps } = latest.current;
      const from = base();
      const target = wraps
        ? (from + delta + total) % total
        : clamp(from + delta, total);
      if (total < 2 || target === from) {
        return;
      }
      go(target, delta > 0 ? FORWARD : BACK);
    },
    [base, go]
  );

  const goTo = React.useCallback(
    (to: number) => {
      const { count: total, loop: wraps } = latest.current;
      const from = base();
      const target = clamp(to, total);
      if (total < 2 || target === from) {
        return;
      }
      let forward = target > from;
      if (wraps) {
        const ahead = (target - from + total) % total;
        const behind = total - ahead;
        forward = ahead === behind ? target > from : ahead < behind;
      }
      go(target, forward ? FORWARD : BACK);
    },
    [base, go]
  );

  const previous = React.useCallback(() => step(-1), [step]);
  const next = React.useCallback(() => step(1), [step]);

  const advance = React.useCallback(() => {
    const { count: total, loop: wraps } = latest.current;
    if (!wraps && base() >= total - 1) {
      go(0, BACK);
    } else {
      step(1);
    }
  }, [base, go, step]);

  React.useEffect(() => {
    if (!playing || !autoplay) {
      return;
    }
    const timer = window.setTimeout(advance, autoplay);
    return () => window.clearTimeout(timer);
  }, [advance, autoplay, index, playing]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (
      event.defaultPrevented ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      (event.target instanceof HTMLElement &&
        (event.target.isContentEditable ||
          event.target.closest("input, textarea, select") !== null))
    ) {
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      previous();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      next();
    }
  };

  const context = React.useMemo<CarouselContextValue>(
    () => ({
      canNext: count > 1 && (loop || index < count - 1),
      canPrevious: count > 1 && (loop || index > 0),
      count,
      goTo,
      index,
      loop,
      name,
      next,
      playing,
      previous,
      setCount,
    }),
    [count, goTo, index, loop, name, next, playing, previous]
  );

  let autoplayState: "playing" | "paused" | undefined;
  if (autoplay) {
    autoplayState = playing ? "playing" : "paused";
  }

  return (
    <CarouselContext.Provider value={context}>
      <div
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        data-autoplay={autoplayState}
        onKeyDown={handleKeyDown}
        onPointerEnter={(event) => {
          onPointerEnter?.(event);
          setHovered(true);
        }}
        onPointerLeave={(event) => {
          onPointerLeave?.(event);
          setHovered(false);
        }}
        onFocus={(event) => {
          onFocus?.(event);
          // Keyboard focus pauses autoplay; a mouse click is covered by hover.
          setKeyboardFocus(event.target.matches(":focus-visible"));
        }}
        onBlur={(event) => {
          onBlur?.(event);
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setKeyboardFocus(false);
          }
        }}
        className={cn("relative flex flex-col gap-3", className)}
        {...props}
      />
    </CarouselContext.Provider>
  );
};

const CarouselContent = ({
  className,
  children,
  onPointerDown,
  onClickCapture,
  ...props
}: React.ComponentProps<"div">) => {
  const { name, next, playing, previous, setCount } = useCarouselContext();
  const items = React.Children.toArray(children).filter(React.isValidElement);
  const swiped = React.useRef(false);

  useIsomorphicLayoutEffect(() => {
    setCount(items.length);
  }, [items.length, setCount]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerDown?.(event);
    swiped.current = false;
    if (
      event.defaultPrevented ||
      !event.isPrimary ||
      (event.pointerType === "mouse" && event.button !== 0)
    ) {
      return;
    }
    const { clientX: startX, clientY: startY, pointerId } = event;
    // A swipe counts past 15% of the width, capped at 48px for wide slides.
    const threshold = Math.min(48, event.currentTarget.clientWidth * 0.15);
    const end = (up: PointerEvent) => {
      if (up.pointerId !== pointerId) {
        return;
      }
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      const dx = up.clientX - startX;
      const dy = up.clientY - startY;
      if (
        up.type === "pointercancel" ||
        Math.abs(dx) < threshold ||
        Math.abs(dx) < Math.abs(dy)
      ) {
        return;
      }
      swiped.current = true;
      if (dx < 0) {
        next();
      } else {
        previous();
      }
    };
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
  };

  return (
    // Every slide shares this box, so the old slide and the new one are one
    // group: the old image pushes out while the new one pushes in, clipped.
    <React.ViewTransition default="none" update={slideUpdate}>
      <div
        id={name("content")}
        aria-live={playing ? "off" : "polite"}
        data-slot="carousel-content"
        onPointerDown={handlePointerDown}
        onClickCapture={(event) => {
          onClickCapture?.(event);
          // A swipe that ends on a link or button must not also click it.
          if (swiped.current) {
            swiped.current = false;
            event.preventDefault();
            event.stopPropagation();
          }
        }}
        className={cn("grid touch-pan-y", className)}
        {...props}
      >
        {items.map((item, index) => (
          <CarouselItemContext.Provider key={item.key ?? index} value={index}>
            {item}
          </CarouselItemContext.Provider>
        ))}
      </div>
    </React.ViewTransition>
  );
};

const CarouselItem = ({ className, ...props }: React.ComponentProps<"div">) => {
  const position = React.useContext(CarouselItemContext);
  const { count, index } = useCarouselContext();
  if (position === null) {
    throw new Error("CarouselItem must be used within <CarouselContent>.");
  }
  const active = position === index;

  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={`${position + 1} of ${count}`}
      aria-hidden={active ? undefined : true}
      data-slot="carousel-item"
      data-state={active ? "active" : "inactive"}
      // Every slide shares one grid cell, so the tallest sets the height.
      className={cn(
        "col-start-1 row-start-1 min-w-0 overflow-hidden rounded-xl",
        !active && "invisible",
        className
      )}
      {...props}
    />
  );
};

const arrowClassName =
  "inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-foreground shadow-xs outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:hover:bg-background dark:border-input dark:bg-input/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

const CarouselArrow = ({
  delta,
  className,
  children,
  onClick,
  ...props
}: React.ComponentProps<"button"> & { delta: 1 | -1 }) => {
  const { canNext, canPrevious, index, name, next, previous } =
    useCarouselContext();
  const enabled = delta > 0 ? canNext : canPrevious;

  return (
    // Captured and raised so arrows laid over the slide aren't covered by it.
    <React.ViewTransition default="none" update={tk("tk-morph", "tk-top")}>
      <button
        type="button"
        aria-controls={name("content")}
        // aria-disabled keeps focus on the button at either end.
        aria-disabled={enabled ? undefined : true}
        // Changes with every move, which is what makes React capture the arrow.
        data-index={index}
        onClick={(event) => {
          onClick?.(event);
          if (enabled && !event.defaultPrevented) {
            (delta > 0 ? next : previous)();
          }
        }}
        className={cn(arrowClassName, className)}
        {...props}
      >
        {children ?? (delta > 0 ? <ChevronRight /> : <ChevronLeft />)}
      </button>
    </React.ViewTransition>
  );
};

const CarouselPrevious = (props: React.ComponentProps<"button">) => (
  <CarouselArrow
    delta={-1}
    aria-label="Previous slide"
    data-slot="carousel-previous"
    {...props}
  />
);

const CarouselNext = (props: React.ComponentProps<"button">) => (
  <CarouselArrow
    delta={1}
    aria-label="Next slide"
    data-slot="carousel-next"
    {...props}
  />
);

const CarouselDots = ({ className, ...props }: React.ComponentProps<"div">) => {
  const { count, goTo, index, name } = useCarouselContext();

  return (
    // Raised like the arrows, for dots laid over the slide.
    <React.ViewTransition default="none" update={tk("tk-morph", "tk-top")}>
      <div
        role="group"
        aria-label="Choose slide"
        data-slot="carousel-dots"
        className={cn("flex h-6 items-center justify-center", className)}
        {...props}
      >
        {Array.from({ length: count }, (_, position) => {
          const active = position === index;
          return (
            <button
              // oxlint-disable-next-line no-array-index-key -- dots are positions
              key={position}
              type="button"
              aria-label={`Slide ${position + 1}`}
              aria-current={active ? "true" : undefined}
              aria-controls={name("content")}
              data-state={active ? "active" : "inactive"}
              data-slot="carousel-dot"
              onClick={() => goTo(position)}
              className="group/dot relative grid size-6 cursor-pointer place-items-center rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <span className="size-1.5 rounded-full bg-foreground/25 transition-colors group-hover/dot:bg-foreground/50" />
              {active ? (
                // One indicator, rendered only in the active dot: the one
                // leaving and the one appearing share a name, so it glides.
                <React.ViewTransition
                  name={name("dot")}
                  default="none"
                  share={tk("tk-morph", "tk-top")}
                >
                  <span
                    aria-hidden
                    data-slot="carousel-dot-indicator"
                    className="absolute inset-0 m-auto h-1.5 w-3.5 rounded-full bg-foreground"
                  />
                </React.ViewTransition>
              ) : null}
            </button>
          );
        })}
      </div>
    </React.ViewTransition>
  );
};

export {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel,
};
