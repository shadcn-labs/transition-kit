"use client";

import { ChevronDownIcon } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";
import { tk, useTransitionNames } from "@/registry/ui/ui-transition";
import type { TransitionNames } from "@/registry/ui/ui-transition";

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

/** Returns the next open items, or the same array when nothing changes. */
type Update = (open: string[]) => string[];

interface AccordionContextValue {
  value: string[];
  name: TransitionNames;
  rootRef: React.RefObject<HTMLDivElement | null>;
  /** Opens or closes an item inside a view transition. */
  toggle: (item: string) => void;
  /** Opens an item instantly, e.g. when find-in-page matches its content. */
  reveal: (item: string) => void;
}

const AccordionContext = React.createContext<AccordionContextValue | null>(
  null
);

const useAccordion = () => {
  const context = React.useContext(AccordionContext);
  if (!context) {
    throw new Error("Accordion parts must be used within <Accordion>.");
  }
  return context;
};

interface AccordionItemContextValue {
  value: string;
  open: boolean;
  disabled: boolean;
}

const AccordionItemContext =
  React.createContext<AccordionItemContextValue | null>(null);

const useAccordionItem = () => {
  const context = React.useContext(AccordionItemContext);
  if (!context) {
    throw new Error(
      "AccordionTrigger and AccordionContent must be used within <AccordionItem>."
    );
  }
  return context;
};

interface AccordionSingleProps {
  type: "single";
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Lets the open item close, leaving none open. */
  collapsible?: boolean;
}

interface AccordionMultipleProps {
  type: "multiple";
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  collapsible?: never;
}

type AccordionProps = Omit<
  React.ComponentProps<"div">,
  "defaultValue" | "value"
> &
  (AccordionSingleProps | AccordionMultipleProps);

const toItems = (value: string | string[] | undefined) => {
  if (value === undefined) {
    return;
  }
  if (Array.isArray(value)) {
    return value;
  }
  return value ? [value] : [];
};

const Accordion = ({
  type,
  value: valueProp,
  defaultValue,
  onValueChange,
  collapsible = false,
  className,
  ...props
}: AccordionProps) => {
  const [uncontrolled, setUncontrolled] = React.useState<string[]>(
    () => toItems(defaultValue) ?? []
  );
  const rootRef = React.useRef<HTMLDivElement>(null);
  const name = useTransitionNames();
  const controlled = toItems(valueProp);
  const value = controlled ?? uncontrolled;

  // Updated as soon as a toggle is requested, so a second click before React
  // commits the first one builds on it instead of on a stale render.
  const valueRef = React.useRef(value);
  useIsomorphicLayoutEffect(() => {
    valueRef.current = value;
  });

  const commit = React.useCallback(
    (update: Update) => {
      const next = update(valueRef.current);
      if (next === valueRef.current) {
        return;
      }
      valueRef.current = next;
      setUncontrolled(next);
      if (type === "single") {
        onValueChange?.(next[0] ?? "");
      } else {
        onValueChange?.(next);
      }
    },
    [type, onValueChange]
  );

  const toggleUpdate = React.useCallback(
    (item: string): Update =>
      (open) => {
        if (!open.includes(item)) {
          return type === "single" ? [item] : [...open, item];
        }
        if (type === "single" && !collapsible) {
          return open;
        }
        return open.filter((openItem) => openItem !== item);
      },
    [type, collapsible]
  );

  const toggle = React.useCallback(
    (item: string) => {
      const update = toggleUpdate(item);
      // Guard no-ops, e.g. the open item of a non-collapsible accordion.
      if (update(valueRef.current) === valueRef.current) {
        return;
      }
      React.startTransition(() => commit(update));
    },
    [commit, toggleUpdate]
  );

  const reveal = React.useCallback(
    (item: string) =>
      commit((open) => {
        if (open.includes(item)) {
          return open;
        }
        return type === "single" ? [item] : [...open, item];
      }),
    [commit, type]
  );

  const context = React.useMemo(
    () => ({ name, reveal, rootRef, toggle, value }),
    [name, reveal, toggle, value]
  );

  return (
    <AccordionContext.Provider value={context}>
      <div
        ref={rootRef}
        data-slot="accordion"
        className={cn("w-full", className)}
        {...props}
      />
    </AccordionContext.Provider>
  );
};

const AccordionItem = ({
  value,
  disabled = false,
  className,
  ...props
}: React.ComponentProps<"div"> & { value: string; disabled?: boolean }) => {
  const { value: open } = useAccordion();
  const isOpen = open.includes(value);
  const context = React.useMemo(
    () => ({ disabled, open: isOpen, value }),
    [disabled, isOpen, value]
  );

  return (
    <AccordionItemContext.Provider value={context}>
      {/* One group per item: the opened one grows, the ones below glide. The
          snapshots keep their natural size, so text is clipped, never stretched. */}
      <React.ViewTransition
        default="none"
        update={tk("tk-morph", "tk-clip", "tk-text")}
      >
        <div
          data-slot="accordion-item"
          data-state={isOpen ? "open" : "closed"}
          data-disabled={disabled ? "" : undefined}
          // The divider sits on top of each item so it travels with the item below.
          className={cn("border-t first:border-t-0", className)}
          {...props}
        />
      </React.ViewTransition>
    </AccordionItemContext.Provider>
  );
};

const AccordionTrigger = ({
  className,
  children,
  onClick,
  onKeyDown,
  ...props
}: React.ComponentProps<"button">) => {
  const { name, rootRef, toggle } = useAccordion();
  const { disabled, open, value } = useAccordionItem();

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) {
      return;
    }
    const root = rootRef.current;
    // This accordion's triggers only: skip disabled ones and nested accordions.
    const triggers = [
      ...(root?.querySelectorAll<HTMLButtonElement>(
        '[data-slot="accordion-trigger"]:not([disabled])'
      ) ?? []),
    ].filter((trigger) => trigger.closest('[data-slot="accordion"]') === root);
    const index = triggers.indexOf(event.currentTarget);
    const target = {
      ArrowDown: triggers[(index + 1) % triggers.length],
      ArrowUp: triggers[(index - 1 + triggers.length) % triggers.length],
      End: triggers.at(-1),
      Home: triggers[0],
    }[event.key];
    if (!target) {
      return;
    }
    event.preventDefault();
    target.focus();
  };

  return (
    <h3 data-slot="accordion-header" className="flex">
      <button
        type="button"
        id={name("trigger", value)}
        aria-expanded={open}
        aria-controls={name("content", value)}
        aria-disabled={disabled || undefined}
        disabled={disabled}
        data-state={open ? "open" : "closed"}
        data-slot="accordion-trigger"
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) {
            toggle(value);
          }
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex flex-1 cursor-pointer items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...props}
      >
        {children}
        {/* Its own group, after the item: the browser turns it from the old
            rotation to the new one above the item, with no ghosted copy. */}
        <React.ViewTransition default="none" update={tk("tk-morph")}>
          <ChevronDownIcon
            aria-hidden
            data-state={open ? "open" : "closed"}
            className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 not-supports-[view-transition-name:none]:transition-transform not-supports-[view-transition-name:none]:duration-200 motion-reduce:transition-none"
          />
        </React.ViewTransition>
      </button>
    </h3>
  );
};

const AccordionContent = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { name, reveal } = useAccordion();
  const { open, value } = useAccordionItem();
  const ref = React.useRef<HTMLDivElement>(null);

  // Closed content stays in the DOM as `hidden="until-found"` where supported,
  // so find-in-page can match it; the browser fires `beforematch` and we open it.
  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (open || !element || !("onbeforematch" in element)) {
      return;
    }
    element.setAttribute("hidden", "until-found");
    const handleBeforeMatch = () => reveal(value);
    element.addEventListener("beforematch", handleBeforeMatch);
    return () => element.removeEventListener("beforematch", handleBeforeMatch);
  }, [open, reveal, value]);

  return (
    <div
      ref={ref}
      role="region"
      id={name("content", value)}
      aria-labelledby={name("trigger", value)}
      hidden={!open}
      data-state={open ? "open" : "closed"}
      data-slot="accordion-content"
      className="overflow-hidden text-sm"
      {...props}
    >
      <div className={cn("pt-0 pb-4", className)}>{children}</div>
    </div>
  );
};

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
