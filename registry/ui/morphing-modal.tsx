"use client";

import { X } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";
import { BACK, FORWARD, tk } from "@/registry/ui/ui-transition";

interface MorphingModalContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const MorphingModalContext =
  React.createContext<MorphingModalContextValue | null>(null);

const useMorphingModalContext = () => {
  const context = React.useContext(MorphingModalContext);
  if (!context) {
    throw new Error("MorphingModal parts must be used within <MorphingModal>.");
  }
  return context;
};

const assignRef = <T,>(ref: React.Ref<T> | undefined, node: T | null) => {
  if (typeof ref === "function") {
    return ref(node);
  }
  if (ref) {
    ref.current = node;
  }
};

const focusable =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const useMorphingModal = () => {
  const { open, setOpen } = useMorphingModalContext();
  return { open, setOpen };
};

const view = {
  [BACK]: tk("tk-slide", "tk-back"),
  [FORWARD]: tk("tk-slide", "tk-forward"),
  default: tk("tk-blur"),
};

const MorphingModal = ({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  children,
}: {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}) => {
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen);
  const open = openProp ?? uncontrolled;
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const pending = React.useRef<boolean | null>(null);

  React.useLayoutEffect(() => {
    pending.current = null;
  });

  const setOpen = React.useCallback(
    (next: boolean) => {
      if ((pending.current ?? open) === next) {
        return;
      }
      pending.current = next;
      React.startTransition(() => {
        setUncontrolled(next);
        onOpenChange?.(next);
      });
    },
    [open, onOpenChange]
  );

  const previous = React.useRef(open);
  React.useLayoutEffect(() => {
    if (previous.current !== open && !open) {
      triggerRef.current?.focus({ preventScroll: true });
    }
    previous.current = open;
  }, [open]);

  const context = React.useMemo(
    () => ({ open, setOpen, triggerRef }),
    [open, setOpen]
  );

  return (
    <MorphingModalContext.Provider value={context}>
      {children}
    </MorphingModalContext.Provider>
  );
};

const MorphingModalTrigger = ({
  onClick,
  ...props
}: React.ComponentProps<"button">) => {
  const { open, setOpen, triggerRef } = useMorphingModalContext();
  return (
    <button
      ref={triggerRef}
      type="button"
      aria-haspopup="dialog"
      aria-expanded={open}
      data-slot="morphing-modal-trigger"
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          setOpen(true);
        }
      }}
      {...props}
    />
  );
};

const MorphingModalContent = ({
  className,
  children,
  showClose = true,
  ref,
  onCancel,
  onClose,
  onPointerDown,
  ...props
}: React.ComponentProps<"dialog"> & {
  showClose?: boolean;
}) => {
  const { open, setOpen } = useMorphingModalContext();

  const show = React.useCallback(
    (node: HTMLDialogElement | null) => {
      if (node && !node.open) {
        node.showModal();
      }
      const cleanup = assignRef(ref, node);
      return typeof cleanup === "function" ? cleanup : undefined;
    },
    [ref]
  );

  if (!open) {
    return null;
  }

  return (
    <React.ViewTransition
      default="none"
      enter={tk("tk-pop")}
      exit={tk("tk-pop")}
      update={tk("tk-morph", "tk-morphing-modal-panel")}
    >
      <dialog
        ref={show}
        data-slot="morphing-modal-content"
        onCancel={(event) => {
          onCancel?.(event);
          const handled = event.defaultPrevented;
          event.preventDefault();
          if (!handled) {
            setOpen(false);
          }
        }}
        onClose={(event) => {
          onClose?.(event);
          setOpen(false);
        }}
        onPointerDown={(event) => {
          onPointerDown?.(event);
          if (event.defaultPrevented || event.target !== event.currentTarget) {
            return;
          }
          const box = event.currentTarget.getBoundingClientRect();
          const inside =
            event.clientX >= box.left &&
            event.clientX <= box.right &&
            event.clientY >= box.top &&
            event.clientY <= box.bottom;
          if (!inside) {
            setOpen(false);
          }
        }}
        className={cn(
          "bg-popover text-popover-foreground m-auto w-[calc(100%-2rem)] max-w-md overflow-hidden rounded-2xl border p-0 shadow-xl backdrop:bg-black/40",
          className
        )}
        {...props}
      >
        <div className="relative p-6">
          {children}
          {showClose ? (
            <button
              type="button"
              aria-label="Close"
              data-slot="morphing-modal-close"
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-ring/50 absolute end-3 top-3 flex size-8 cursor-pointer items-center justify-center rounded-md outline-none transition-colors focus-visible:ring-[3px] [&_svg]:size-4"
            >
              <X aria-hidden />
            </button>
          ) : null}
        </div>
      </dialog>
    </React.ViewTransition>
  );
};

const MorphingModalView = ({
  id,
  className,
  ref,
  ...props
}: React.ComponentProps<"div"> & { id: string }) => {
  const viewRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    const node = viewRef.current;
    const dialog = node?.closest("dialog");
    if (!node || !dialog || dialog.contains(document.activeElement)) {
      return;
    }
    const target =
      node.querySelector<HTMLElement>('[data-slot="morphing-modal-title"]') ??
      node.querySelector<HTMLElement>(focusable);
    if (target) {
      target.focus({ preventScroll: true });
      return;
    }
    node.tabIndex = -1;
    node.focus({ preventScroll: true });
  }, []);

  return (
    <React.ViewTransition key={id} default="none" enter={view} exit={view}>
      <div
        ref={(node) => {
          viewRef.current = node;
          const cleanup = assignRef(ref, node);
          return typeof cleanup === "function" ? cleanup : undefined;
        }}
        data-slot="morphing-modal-view"
        data-view={id}
        className={cn("flex flex-col gap-4 outline-none", className)}
        {...props}
      />
    </React.ViewTransition>
  );
};

const MorphingModalTitle = ({
  className,
  ...props
}: React.ComponentProps<"h2">) => (
  <h2
    tabIndex={-1}
    data-slot="morphing-modal-title"
    className={cn(
      "pe-8 text-lg leading-none font-semibold outline-none",
      className
    )}
    {...props}
  />
);

const MorphingModalDescription = ({
  className,
  ...props
}: React.ComponentProps<"p">) => (
  <p
    data-slot="morphing-modal-description"
    className={cn("text-muted-foreground text-sm", className)}
    {...props}
  />
);

export {
  MorphingModal,
  MorphingModalContent,
  MorphingModalDescription,
  MorphingModalTitle,
  MorphingModalTrigger,
  MorphingModalView,
  useMorphingModal,
};
