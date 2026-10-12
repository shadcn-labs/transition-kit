"use client";

import { Check, Plus, ShoppingCart } from "lucide-react";
import * as React from "react";
import { addTransitionType, startTransition, ViewTransition } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";
import { tk, useTransitionNames } from "@/registry/ui/ui-transition";
import type { TransitionNames } from "@/registry/ui/ui-transition";

export interface CartItem {
  id: string;
  quantity: number;
}

interface Flight {
  id: number;
  phase: "lift" | "land";
  rect: { top: number; left: number; width: number; height: number };
  radius: string;
  content: React.ReactNode;
}

interface CommitOptions {
  /** Element the product image flies from, and what flies. */
  flight?: { from: HTMLElement; content: React.ReactNode };
  /** Extra state to update in the same transition. */
  onUpdate?: () => void;
  message?: (count: number) => string;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  add: (id: string, quantity?: number) => void;
  remove: (id: string) => void;
  clear: () => void;
}

interface CartFlightContextValue {
  flights: Flight[];
  /** The count on screen before the latest change, to tell which badge digits changed. */
  before: number;
  names: TransitionNames;
  commit: (
    change: (items: CartItem[]) => CartItem[],
    options?: CommitOptions
  ) => void;
  drop: (id: number) => void;
}

const FLIGHT = tk("tk-morph", "tk-slow", "tk-top", "tk-add-to-cart-flight");

const CartContext = React.createContext<CartContextValue | null>(null);
const CartFlightContext = React.createContext<CartFlightContextValue | null>(
  null
);

const useCart = () => {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within <CartProvider>.");
  }
  return context;
};

const useCartFlight = () => {
  const context = React.useContext(CartFlightContext);
  if (!context) {
    throw new Error("Cart parts must be used within <CartProvider>.");
  }
  return context;
};

const countOf = (items: CartItem[]) =>
  items.reduce((total, item) => total + item.quantity, 0);

const itemsLabel = (count: number) =>
  `${count} ${count === 1 ? "item" : "items"}`;

const addItem =
  (id: string, quantity: number) =>
  (items: CartItem[]): CartItem[] =>
    items.some((item) => item.id === id)
      ? items.map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      : [...items, { id, quantity }];

const CartProvider = ({
  items: itemsProp,
  defaultItems = [],
  onItemsChange,
  children,
}: {
  items?: CartItem[];
  defaultItems?: CartItem[];
  onItemsChange?: (items: CartItem[]) => void;
  children?: React.ReactNode;
}) => {
  const [uncontrolled, setUncontrolled] = React.useState(defaultItems);
  const [flights, setFlights] = React.useState<Flight[]>([]);
  const items = itemsProp ?? uncontrolled;
  const [before, setBefore] = React.useState(() => countOf(items));
  const [announcement, setAnnouncement] = React.useState("");
  // The latest items, including changes React hasn't committed yet, so quick
  // clicks add up.
  const itemsRef = React.useRef(items);
  const shownCount = React.useRef(countOf(items));
  const flightId = React.useRef(0);
  const names = useTransitionNames();

  React.useLayoutEffect(() => {
    itemsRef.current = items;
    shownCount.current = countOf(items);
  }, [items]);

  const commit = React.useCallback(
    (
      change: (items: CartItem[]) => CartItem[],
      { flight, onUpdate, message = itemsLabel }: CommitOptions = {}
    ) => {
      let id = 0;
      // Without view transitions, or with reduced motion, nothing flies.
      if (
        flight &&
        typeof document.startViewTransition === "function" &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        flightId.current += 1;
        id = flightId.current;
        const rect = flight.from.getBoundingClientRect();
        const lifted: Flight = {
          content: flight.content,
          id,
          phase: "lift",
          radius: getComputedStyle(flight.from).borderRadius,
          rect: {
            height: rect.height,
            left: rect.left,
            top: rect.top,
            width: rect.width,
          },
        };
        // An urgent update puts a copy exactly over the product image before
        // the transition captures the page, so the card itself never changes.
        // Copies that already landed (or never could) go now.
        setFlights((current) => [
          ...current.filter((item) => item.phase === "lift"),
          lifted,
        ]);
      }

      const previous = itemsRef.current;
      const next = change(previous);
      const from = countOf(previous);
      const to = countOf(next);
      itemsRef.current = next;

      startTransition(() => {
        if (from !== to) {
          addTransitionType(names(to > from ? "up" : "down"));
        }
        if (id) {
          addTransitionType(names("land"));
          // The copy leaves the page and its twin mounts in the cart icon:
          // one shared name, so the image flies between them.
          setFlights((current) =>
            current.map((item) =>
              item.id === id ? { ...item, phase: "land" } : item
            )
          );
        }
        setBefore(shownCount.current);
        setUncontrolled(next);
        if (next !== previous) {
          onItemsChange?.(next);
        }
        setAnnouncement(message(to));
        onUpdate?.();
      });
    },
    [names, onItemsChange]
  );

  const drop = React.useCallback(
    (id: number) =>
      setFlights((current) => current.filter((item) => item.id !== id)),
    []
  );

  const api = React.useMemo<CartContextValue>(
    () => ({
      add: (id, quantity = 1) => commit(addItem(id, quantity)),
      clear: () => commit((current) => (current.length ? [] : current)),
      count: countOf(items),
      items,
      remove: (id) =>
        commit((current) =>
          current.some((item) => item.id === id)
            ? current.filter((item) => item.id !== id)
            : current
        ),
    }),
    [commit, items]
  );

  const internal = React.useMemo(
    () => ({ before, commit, drop, flights, names }),
    [before, commit, drop, flights, names]
  );

  const lifting = flights.filter((flight) => flight.phase === "lift");

  return (
    <CartContext.Provider value={api}>
      <CartFlightContext.Provider value={internal}>
        {children}
        <span role="status" className="sr-only">
          {announcement}
        </span>
        {lifting.length > 0
          ? createPortal(
              lifting.map((flight) => (
                <ViewTransition
                  key={flight.id}
                  name={names("flight", flight.id)}
                  default="none"
                  share={FLIGHT}
                  // React reports the share on the copy that leaves; its twin
                  // in the cart is invisible, so drop it once the flight lands.
                  onShare={() => () => drop(flight.id)}
                >
                  <div
                    aria-hidden
                    data-slot="cart-flight"
                    className="pointer-events-none fixed z-50 overflow-hidden"
                    style={{ borderRadius: flight.radius, ...flight.rect }}
                  >
                    {flight.content}
                  </div>
                </ViewTransition>
              )),
              document.body
            )
          : null}
      </CartFlightContext.Provider>
    </CartContext.Provider>
  );
};

const CartButton = ({
  className,
  children,
  "aria-label": ariaLabel,
  ...props
}: React.ComponentProps<"button">) => {
  const { count } = useCart();
  const { before, flights, names } = useCartFlight();
  const digits = [...String(count)];
  const previous = String(before);
  const landing = flights.filter((flight) => flight.phase === "land");
  // Digits roll only in the cart's own transitions.
  const roll = {
    [names("up")]: tk("tk-roll", "tk-up", "tk-clip"),
    [names("down")]: tk("tk-roll", "tk-down", "tk-clip"),
    default: "none",
  };

  return (
    <button
      type="button"
      data-slot="cart-button"
      aria-label={ariaLabel ?? `Cart, ${itemsLabel(count)}`}
      className={cn(
        "relative inline-flex h-9 min-w-9 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md border bg-background px-2.5 text-sm font-medium whitespace-nowrap shadow-xs transition-colors outline-none hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 dark:border-input dark:bg-input/30 dark:hover:bg-input/50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {/* The icon bumps when an image lands in it. */}
      <ViewTransition
        default="none"
        update={{
          [names("land")]: tk("tk-morph", "tk-add-to-cart-bump"),
          default: tk("tk-morph"),
        }}
      >
        <span data-slot="cart-icon" className="relative inline-flex">
          <ShoppingCart />
          {landing.map((flight) => (
            <ViewTransition
              key={flight.id}
              name={names("flight", flight.id)}
              default="none"
              share={FLIGHT}
            >
              <span
                aria-hidden
                data-slot="cart-ghost"
                className="pointer-events-none absolute inset-0 m-auto size-4 overflow-hidden rounded-sm opacity-0"
              >
                {flight.content}
              </span>
            </ViewTransition>
          ))}
        </span>
      </ViewTransition>
      {children}
      {count > 0 ? (
        <ViewTransition
          default="none"
          enter={tk("tk-pop")}
          exit={tk("tk-pop")}
          update={tk("tk-morph")}
        >
          <span
            aria-hidden
            data-slot="cart-badge"
            className="bg-primary text-primary-foreground absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] leading-none font-semibold tabular-nums"
          >
            {digits.map((digit, index) => {
              const place = digits.length - 1 - index;
              const changed = previous.at(-1 - place) !== digit;
              return (
                // Nested in the badge, so the digits paint above it.
                <ViewTransition
                  key={place}
                  default="none"
                  update={changed ? roll : tk("tk-morph")}
                  enter={roll}
                  exit={roll}
                >
                  <span className="inline-block">{digit}</span>
                </ViewTransition>
              );
            })}
          </span>
        </ViewTransition>
      ) : null}
    </button>
  );
};

const AddToCartButton = ({
  productId,
  quantity = 1,
  image,
  src,
  source,
  addedLabel = "Added",
  resetAfter = 1500,
  children = "Add to cart",
  className,
  onClick,
  ...props
}: React.ComponentProps<"button"> & {
  productId: string;
  quantity?: number;
  /** What flies into the cart, e.g. the product artwork. */
  image?: React.ReactNode;
  /** Image URL to fly into the cart when `image` isn't given. */
  src?: string;
  /** The product image to fly from. Defaults to the button itself. */
  source?: React.RefObject<HTMLElement | null>;
  addedLabel?: React.ReactNode;
  /** Milliseconds before the label returns to its idle text. */
  resetAfter?: number;
}) => {
  const { commit } = useCartFlight();
  const names = useTransitionNames();
  // Only this button's label swaps blur; other transitions leave it alone.
  const swap = names("label");
  const [added, setAdded] = React.useState(false);
  const timer = React.useRef(0);

  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) {
      return;
    }
    const content =
      image ??
      (src ? (
        <img src={src} alt="" className="size-full object-cover" />
      ) : null);
    const from = source?.current ?? event.currentTarget;
    commit(addItem(productId, quantity), {
      flight: content ? { content, from } : undefined,
      message: (count) => `Added to cart. ${itemsLabel(count)} in cart.`,
      onUpdate: () => {
        addTransitionType(swap);
        setAdded(true);
      },
    });

    // React holds this transition until a running flight has landed.
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(
      () =>
        startTransition(() => {
          addTransitionType(swap);
          setAdded(false);
        }),
      resetAfter
    );
  };

  const idle = (
    <>
      <Plus />
      {children}
    </>
  );
  const done = (
    <>
      <Check />
      {addedLabel}
    </>
  );

  return (
    <button
      type="button"
      data-slot="add-to-cart-button"
      data-state={added ? "added" : "idle"}
      onClick={handleClick}
      className={cn(
        "bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-md px-4 text-sm font-medium whitespace-nowrap shadow-xs transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {/* Both labels share one grid cell, so the button keeps its width. */}
      <span className="grid place-items-center">
        <ViewTransition
          default="none"
          update={{
            [swap]: tk("tk-morph", "tk-text", "tk-blur"),
            default: "none",
          }}
        >
          <span className="inline-flex items-center gap-1.5 [grid-area:1/1]">
            {added ? done : idle}
          </span>
        </ViewTransition>
        <span
          aria-hidden
          className="invisible inline-flex items-center gap-1.5 [grid-area:1/1]"
        >
          {added ? idle : done}
        </span>
      </span>
    </button>
  );
};

export { AddToCartButton, CartButton, CartProvider, useCart };
