"use client";

import * as React from "react";
import {
  Activity,
  addTransitionType,
  startTransition,
  ViewTransition,
} from "react";
import type { ViewTransitionClass } from "react";

import { cn } from "@/lib/utils";
import { tk, useTransitionNames } from "@/registry/ui/ui-transition";
import type { TransitionNames } from "@/registry/ui/ui-transition";

type Side = "top" | "bottom";
type Align = "start" | "center" | "end";

interface Placement {
  side: Side;
  align: Align;
}

interface MorphingPopoverContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  names: TransitionNames;
  /** Classes for the shared surface, carried by whichever end of the morph is mounted. */
  surface: ViewTransitionClass;
  titleId: string | undefined;
  setPlacement: React.Dispatch<React.SetStateAction<Placement>>;
  setTitleId: (id: string | undefined) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

const MorphingPopoverContext =
  React.createContext<MorphingPopoverContextValue | null>(null);

const useMorphingPopoverContext = () => {
  const context = React.useContext(MorphingPopoverContext);
  if (!context) {
    throw new Error(
      "MorphingPopover parts must be used within <MorphingPopover>."
    );
  }
  return context;
};

/** Reads and animates the open state from inside a `<MorphingPopover>`. */
const useMorphingPopover = () => {
  const { open, setOpen } = useMorphingPopoverContext();
  return { open, setOpen };
};

const fields =
  'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled]), [contenteditable="true"]';

const LABEL = tk("tk-morph", "tk-text");

const assignRef = <T,>(ref: React.Ref<T> | undefined, node: T | null) => {
  if (typeof ref === "function") {
    ref(node);
  } else if (ref) {
    ref.current = node;
  }
};

const MorphingPopover = ({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => {
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen);
  const [placement, setPlacement] = React.useState<Placement>({
    align: "start",
    side: "bottom",
  });
  const [titleId, setTitleId] = React.useState<string>();
  // Bumped by every request, so the popover re-renders and clears `pending`
  // even when a controlling parent keeps `open` as it is.
  const [, setRequest] = React.useState(0);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  // The panel's node; kept while the panel is hidden so focus can be checked.
  const contentRef = React.useRef<HTMLDivElement>(null);
  // The state a transition is about to commit, so a second request before
  // it lands (pointerdown, then focusout) doesn't report the change twice.
  const pending = React.useRef<boolean | null>(null);
  const names = useTransitionNames();
  const open = openProp ?? uncontrolled;

  React.useLayoutEffect(() => {
    pending.current = null;
  });

  const opening = names("open");
  const closing = names("close");

  const setOpen = React.useCallback(
    (next: boolean) => {
      if ((pending.current ?? open) === next) {
        return;
      }
      pending.current = next;
      startTransition(() => {
        addTransitionType(next ? opening : closing);
        setRequest((count) => count + 1);
        setUncontrolled(next);
        onOpenChange?.(next);
      });
    },
    [open, onOpenChange, opening, closing]
  );

  // Focus the first field on open; return focus to the trigger on close
  // unless the user already moved it somewhere else on the page.
  const previous = React.useRef(open);
  React.useLayoutEffect(() => {
    if (previous.current === open) {
      return;
    }
    previous.current = open;
    if (open) {
      const content = contentRef.current;
      const target =
        content?.querySelector<HTMLElement>("[data-autofocus]") ??
        content?.querySelector<HTMLElement>(fields) ??
        content;
      target?.focus({ preventScroll: true });
      return;
    }
    const active = document.activeElement;
    if (
      !active ||
      active === document.body ||
      contentRef.current?.contains(active)
    ) {
      triggerRef.current?.focus({ preventScroll: true });
    }
  }, [open]);

  React.useEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = (event: PointerEvent) => {
      const path = event.composedPath();
      if (
        (contentRef.current && path.includes(contentRef.current)) ||
        (triggerRef.current && path.includes(triggerRef.current))
      ) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, setOpen]);

  // Opening and closing are transition types, so the surface knows which way
  // it is folding whichever end of the morph it is on.
  const surface = React.useMemo(() => {
    const classes = [
      "tk-morph",
      "tk-morphing-popover-surface",
      placement.side === "top" && "tk-morphing-popover-top",
      placement.align !== "start" && `tk-morphing-popover-${placement.align}`,
    ];
    return {
      [opening]: tk(...classes, "tk-up"),
      [closing]: tk(...classes, "tk-down"),
      default: tk(...classes),
    };
  }, [placement, opening, closing]);

  const context = React.useMemo(
    () => ({
      contentRef,
      names,
      open,
      setOpen,
      setPlacement,
      setTitleId,
      surface,
      titleId,
      triggerRef,
    }),
    [names, open, setOpen, surface, titleId]
  );

  return (
    <MorphingPopoverContext.Provider value={context}>
      <div
        data-slot="morphing-popover"
        data-state={open ? "open" : "closed"}
        className={cn("relative inline-flex align-top", className)}
        {...props}
      />
    </MorphingPopoverContext.Provider>
  );
};

const MorphingPopoverTrigger = ({
  className,
  children,
  onClick,
  ref,
  ...props
}: React.ComponentProps<"button">) => {
  const { names, open, setOpen, surface, triggerRef } =
    useMorphingPopoverContext();

  const label = (
    <span
      data-slot="morphing-popover-label"
      className="inline-flex items-center gap-2"
    >
      {children}
    </span>
  );

  const button = (
    <button
      ref={(node) => {
        triggerRef.current = node;
        assignRef(ref, node);
      }}
      type="button"
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={names("content")}
      data-state={open ? "open" : "closed"}
      data-slot="morphing-popover-trigger"
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          setOpen(true);
        }
      }}
      className={cn(
        "bg-popover text-popover-foreground ring-border inline-flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-xl px-3.5 text-sm font-medium whitespace-nowrap shadow-xs ring-1 transition-[color,background-color,box-shadow] outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[state=open]:invisible [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {/* Nested in the surface, so it paints above the growing box. It shares
          the title's name and glides into it. */}
      {open ? (
        label
      ) : (
        <ViewTransition name={names("label")} default="none" share={LABEL}>
          {label}
        </ViewTransition>
      )}
    </button>
  );

  // While closed the trigger is the surface. Opening unmounts this boundary
  // and reveals the panel's, which has the same name, so one grows into the
  // other. The invisible trigger keeps its space in the layout.
  return open ? (
    button
  ) : (
    <ViewTransition name={names("surface")} default="none" share={surface}>
      {button}
    </ViewTransition>
  );
};

const MorphingPopoverContent = ({
  side = "bottom",
  align = "start",
  className,
  onKeyDown,
  onBlur,
  ref,
  ...props
}: React.ComponentProps<"div"> & {
  /** `bottom` grows down from the trigger's top edge, `top` grows up from its bottom edge. */
  side?: Side;
  /** Which trigger edge the panel lines up with. */
  align?: Align;
}) => {
  const {
    contentRef,
    names,
    open,
    setOpen,
    setPlacement,
    surface,
    titleId,
    triggerRef,
  } = useMorphingPopoverContext();

  React.useLayoutEffect(() => {
    setPlacement((current) =>
      current.side === side && current.align === align
        ? current
        : { align, side }
    );
  }, [align, side, setPlacement]);

  // A hidden Activity keeps the panel's state (typed text, scroll) while it
  // is closed and takes its boundary out of the page, so the name is free
  // for the trigger.
  return (
    <Activity mode={open ? "visible" : "hidden"}>
      <ViewTransition name={names("surface")} default="none" share={surface}>
        <div
          ref={(node) => {
            // React clears refs while the panel is hidden; keep the node so
            // closing can tell whether focus was inside it.
            if (node) {
              contentRef.current = node;
            }
            assignRef(ref, node);
          }}
          id={names("content")}
          role="dialog"
          aria-labelledby={titleId}
          tabIndex={-1}
          data-state={open ? "open" : "closed"}
          data-side={side}
          data-align={align}
          data-slot="morphing-popover-content"
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (event.key === "Escape" && !event.defaultPrevented) {
              event.preventDefault();
              setOpen(false);
            }
          }}
          onBlur={(event) => {
            onBlur?.(event);
            const next = event.relatedTarget;
            // Tabbing out closes it; focus that simply disappears does not.
            if (
              next instanceof Node &&
              !event.currentTarget.contains(next) &&
              !triggerRef.current?.contains(next)
            ) {
              setOpen(false);
            }
          }}
          className={cn(
            "bg-popover text-popover-foreground ring-border absolute z-50 flex w-72 flex-col gap-3 rounded-xl p-3 text-sm shadow-lg ring-1 outline-none",
            side === "top" ? "bottom-0" : "top-0",
            align === "start" && "start-0",
            align === "end" && "end-0",
            align === "center" && "left-1/2 -translate-x-1/2",
            className
          )}
          {...props}
        />
      </ViewTransition>
    </Activity>
  );
};

const MorphingPopoverTitle = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { names, setTitleId } = useMorphingPopoverContext();
  const id = names("title");

  React.useLayoutEffect(() => {
    setTitleId(id);
    return () => setTitleId(undefined);
  }, [id, setTitleId]);

  return (
    <div
      id={id}
      data-slot="morphing-popover-title"
      className={cn(
        "flex items-center text-sm leading-none font-medium [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {/* Shares the trigger label's name, so the label glides into the title. */}
      <ViewTransition name={names("label")} default="none" share={LABEL}>
        <span className="inline-flex items-center gap-2">{children}</span>
      </ViewTransition>
    </div>
  );
};

const MorphingPopoverClose = ({
  onClick,
  ...props
}: React.ComponentProps<"button">) => {
  const { setOpen } = useMorphingPopoverContext();
  return (
    <button
      type="button"
      data-slot="morphing-popover-close"
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          setOpen(false);
        }
      }}
      {...props}
    />
  );
};

export {
  MorphingPopover,
  MorphingPopoverClose,
  MorphingPopoverContent,
  MorphingPopoverTitle,
  MorphingPopoverTrigger,
  useMorphingPopover,
};
