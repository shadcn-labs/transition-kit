"use client";

import { XIcon } from "lucide-react";
import * as React from "react";
import { startTransition, ViewTransition } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";
import { tk, useTransitionNames } from "@/registry/ui/ui-transition";
import type { TransitionNames } from "@/registry/ui/ui-transition";

interface ExpandableCardContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  names: TransitionNames;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const ExpandableCardContext =
  React.createContext<ExpandableCardContextValue | null>(null);

const useExpandableCardContext = () => {
  const context = React.useContext(ExpandableCardContext);
  if (!context) {
    throw new Error(
      "ExpandableCard parts must be used within <ExpandableCard>."
    );
  }
  return context;
};

/** Reads and animates the open state from inside an `<ExpandableCard>`. */
const useExpandableCard = () => {
  const { open, setOpen } = useExpandableCardContext();
  return { open, setOpen };
};

/**
 * Whether the parts below are on the visible end of the morph. Only that end
 * carries the shared names, so each name is rendered in exactly one place.
 */
const ActiveContext = React.createContext(false);
/** True inside the expanded dialog, where parts render as headings. */
const ExpandedContext = React.createContext(false);

const SURFACE = tk(
  "tk-morph",
  "tk-slow",
  "tk-top",
  "tk-expandable-card-surface"
);
const MEDIA = tk("tk-morph", "tk-slow", "tk-top", "tk-expandable-card-media");
const TEXT = tk("tk-morph", "tk-slow", "tk-top", "tk-text");

const Shared = ({
  name,
  share,
  children,
}: {
  name: string;
  share: string;
  children: React.ReactElement;
}) =>
  React.useContext(ActiveContext) ? (
    <ViewTransition name={name} default="none" share={share}>
      {children}
    </ViewTransition>
  ) : (
    children
  );

const ExpandableCard = ({
  onOpenChange,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  onOpenChange?: (open: boolean) => void;
}) => {
  // ponytail: uncontrolled only; add `open`/`defaultOpen` when someone needs them.
  const [open, setOpenState] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const names = useTransitionNames();

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (next === open) {
        return;
      }
      startTransition(() => {
        setOpenState(next);
        onOpenChange?.(next);
      });
    },
    [open, onOpenChange]
  );

  // The dialog takes focus when it opens; give it back to the card on close.
  const previous = React.useRef(open);
  React.useLayoutEffect(() => {
    if (previous.current !== open && !open) {
      triggerRef.current?.focus({ preventScroll: true });
    }
    previous.current = open;
  }, [open]);

  const context = React.useMemo(
    () => ({ names, open, setOpen, triggerRef }),
    [names, open, setOpen]
  );

  return (
    <ExpandableCardContext.Provider value={context}>
      <div
        data-slot="expandable-card"
        data-state={open ? "open" : "closed"}
        className={cn("relative", className)}
        {...props}
      />
    </ExpandableCardContext.Provider>
  );
};

const ExpandableCardTrigger = ({
  className,
  children,
  onClick,
  ...props
}: Omit<React.ComponentProps<"button">, "ref">) => {
  const { names, open, setOpen, triggerRef } = useExpandableCardContext();

  // While open the card stays in the layout, invisible, so the grid never jumps.
  return (
    <ActiveContext.Provider value={!open}>
      <Shared name={names("surface")} share={SURFACE}>
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          data-state={open ? "open" : "closed"}
          data-slot="expandable-card-trigger"
          onClick={(event) => {
            onClick?.(event);
            if (!event.defaultPrevented) {
              setOpen(true);
            }
          }}
          className={cn(
            "bg-card text-card-foreground ring-border flex w-full cursor-pointer flex-col gap-3 overflow-hidden rounded-xl p-3 text-left shadow-xs ring-1 transition-[box-shadow,scale] outline-none hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-[0.98] data-[state=open]:invisible",
            className
          )}
          {...props}
        >
          {children}
        </button>
      </Shared>
    </ActiveContext.Provider>
  );
};

const ExpandableCardClose = ({
  onClick,
  ...props
}: React.ComponentProps<"button">) => {
  const { setOpen } = useExpandableCardContext();
  return (
    <button
      type="button"
      data-slot="expandable-card-close"
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

const ExpandableCardContent = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { names, open, setOpen } = useExpandableCardContext();

  if (!open) {
    return null;
  }

  // A modal <dialog> brings the top layer, focus trap and inert page for free.
  // Escape and the backdrop go through `setOpen` so closing animates too.
  return createPortal(
    <dialog
      ref={(node) => {
        // Runs in React's commit, before the new snapshot is taken.
        if (node && !node.open) {
          node.showModal();
        }
      }}
      aria-labelledby={names("title")}
      data-slot="expandable-card-dialog"
      onCancel={(event) => {
        event.preventDefault();
        setOpen(false);
      }}
      // Some browsers close anyway after repeated Escapes; keep state in sync.
      onClose={() => setOpen(false)}
      className="fixed inset-0 m-0 flex size-full max-h-none max-w-none items-center justify-center border-0 bg-transparent p-4 text-inherit backdrop:bg-transparent"
    >
      {/* Fades in and out with the page's own crossfade. */}
      <div
        aria-hidden="true"
        data-slot="expandable-card-backdrop"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />
      <ActiveContext.Provider value>
        <ExpandedContext.Provider value>
          <Shared name={names("surface")} share={SURFACE}>
            <div
              data-slot="expandable-card-content"
              className={cn(
                "bg-card text-card-foreground ring-border relative flex max-h-full w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-xl p-4 shadow-2xl ring-1",
                className
              )}
              {...props}
            >
              {children}
              <ExpandableCardClose
                aria-label="Close"
                className="bg-background/80 text-foreground hover:bg-background focus-visible:ring-ring/50 absolute top-6 right-6 inline-flex size-8 cursor-pointer items-center justify-center rounded-full shadow-sm backdrop-blur outline-none focus-visible:ring-[3px]"
              >
                <XIcon className="size-4" />
              </ExpandableCardClose>
            </div>
          </Shared>
        </ExpandedContext.Provider>
      </ActiveContext.Provider>
    </dialog>,
    document.body
  );
};

/** Image, video or artwork. It grows from the card into the dialog. */
const ExpandableCardMedia = ({
  className,
  ...props
}: React.ComponentProps<"span">) => {
  const { names } = useExpandableCardContext();
  return (
    <Shared name={names("media")} share={MEDIA}>
      <span
        data-slot="expandable-card-media"
        className={cn(
          "bg-muted relative block aspect-[4/3] w-full overflow-hidden rounded-lg [&>img]:size-full [&>img]:object-cover",
          className
        )}
        {...props}
      />
    </Shared>
  );
};

const ExpandableCardTitle = ({
  className,
  ...props
}: Omit<React.ComponentProps<"span">, "ref">) => {
  const { names } = useExpandableCardContext();
  const expanded = React.useContext(ExpandedContext);
  const Comp = expanded ? "h2" : "span";
  return (
    <Shared name={names("title-text")} share={TEXT}>
      <Comp
        id={expanded ? names("title") : undefined}
        data-slot="expandable-card-title"
        className={cn(
          "block w-fit font-semibold tracking-tight",
          expanded ? "text-xl" : "text-base",
          className
        )}
        {...props}
      />
    </Shared>
  );
};

const ExpandableCardDescription = ({
  className,
  ...props
}: React.ComponentProps<"span">) => {
  const { names } = useExpandableCardContext();
  return (
    <Shared name={names("description")} share={TEXT}>
      <span
        data-slot="expandable-card-description"
        className={cn("text-muted-foreground block w-fit text-sm", className)}
        {...props}
      />
    </Shared>
  );
};

/** Content only the dialog shows. It is revealed as the surface grows. */
const ExpandableCardBody = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    data-slot="expandable-card-body"
    className={cn("text-muted-foreground text-sm leading-relaxed", className)}
    {...props}
  />
);

export {
  ExpandableCard,
  ExpandableCardBody,
  ExpandableCardClose,
  ExpandableCardContent,
  ExpandableCardDescription,
  ExpandableCardMedia,
  ExpandableCardTitle,
  ExpandableCardTrigger,
  useExpandableCard,
};
