"use client";

import { XIcon } from "lucide-react";
import * as React from "react";
import { startTransition, ViewTransition } from "react";

import { cn } from "@/lib/utils";
import { tk, useTransitionNames } from "@/registry/ui/ui-transition";
import type { TransitionNames } from "@/registry/ui/ui-transition";

type ToastId = number;

interface ToastOptions {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  /** Milliseconds before the toast dismisses itself. `Infinity` keeps it open. */
  duration?: number;
}

interface ToastData extends ToastOptions {
  id: ToastId;
}

interface ToastContextValue {
  toasts: ToastData[];
  toast: (options: ToastOptions) => ToastId;
  dismiss: (id?: ToastId) => void;
  names: TransitionNames;
  duration: number;
  paused: boolean;
  setPaused: (paused: boolean) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

const useToastContext = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error(
      "useToast and ToastViewport must be used within <ToastProvider>."
    );
  }
  return context;
};

/** Shows and dismisses toasts from anywhere inside a `<ToastProvider>`. */
const useToast = () => {
  const { dismiss, toast, toasts } = useToastContext();
  return { dismiss, toast, toasts };
};

const ToastProvider = ({
  limit = 3,
  duration = 4000,
  children,
}: {
  limit?: number;
  duration?: number;
  children?: React.ReactNode;
}) => {
  const [toasts, setToasts] = React.useState<ToastData[]>([]);
  const [paused, setPaused] = React.useState(false);
  const nextId = React.useRef(1);
  const names = useTransitionNames();

  const toast = React.useCallback(
    (options: ToastOptions) => {
      const id = nextId.current;
      nextId.current += 1;
      startTransition(() => {
        setToasts((previous) =>
          [...previous, { ...options, id }].slice(-limit)
        );
      });
      return id;
    },
    [limit]
  );

  const dismiss = React.useCallback((id?: ToastId) => {
    startTransition(() => {
      setToasts((previous) => {
        const next =
          id === undefined ? [] : previous.filter((item) => item.id !== id);
        return next.length === previous.length ? previous : next;
      });
    });
  }, []);

  const context = React.useMemo(
    () => ({ dismiss, duration, names, paused, setPaused, toast, toasts }),
    [dismiss, duration, names, paused, toast, toasts]
  );

  return (
    <ToastContext.Provider value={context}>{children}</ToastContext.Provider>
  );
};

const ToastItem = ({ id, title, description, action, duration }: ToastData) => {
  const { dismiss, duration: fallback, names, paused } = useToastContext();
  const total = duration ?? fallback;
  const remaining = React.useRef(total);

  React.useEffect(() => {
    if (paused || !Number.isFinite(remaining.current)) {
      return;
    }
    const started = Date.now();
    const timer = setTimeout(() => dismiss(id), remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current -= Date.now() - started;
    };
  }, [paused, dismiss, id]);

  return (
    <ViewTransition
      name={names("toast", id)}
      default="none"
      update={tk("tk-morph")}
      enter={tk("tk-toast-stack-enter")}
      exit={tk("tk-toast-stack-exit")}
    >
      <li
        data-slot="toast"
        className="bg-popover text-popover-foreground relative flex items-start gap-3 rounded-lg border p-4 pr-10 text-sm shadow-lg"
      >
        <div className="grid min-w-0 flex-1 gap-0.5">
          <p data-slot="toast-title" className="font-medium">
            {title}
          </p>
          {description ? (
            <p data-slot="toast-description" className="text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {action}
        <button
          type="button"
          aria-label="Dismiss notification"
          data-slot="toast-close"
          onClick={() => dismiss(id)}
          className="text-muted-foreground hover:text-foreground absolute top-3 right-3 inline-flex size-6 cursor-pointer items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 [&_svg]:size-4"
        >
          <XIcon aria-hidden />
        </button>
      </li>
    </ViewTransition>
  );
};

const ToastViewport = ({
  className,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ...props
}: React.ComponentProps<"ol">) => {
  const { setPaused, toasts } = useToastContext();

  return (
    <section aria-label="Notifications" data-slot="toast-viewport">
      <ol
        aria-live="polite"
        data-slot="toast-list"
        onPointerEnter={(event) => {
          onPointerEnter?.(event);
          setPaused(true);
        }}
        onPointerLeave={(event) => {
          onPointerLeave?.(event);
          setPaused(false);
        }}
        onFocus={(event) => {
          onFocus?.(event);
          setPaused(true);
        }}
        onBlur={(event) => {
          onBlur?.(event);
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setPaused(false);
          }
        }}
        className={cn("flex w-full max-w-sm flex-col gap-2", className)}
        {...props}
      >
        {toasts.map((item) => (
          <ToastItem key={item.id} {...item} />
        ))}
      </ol>
    </section>
  );
};

export { ToastProvider, ToastViewport, useToast };
export type { ToastId, ToastOptions };
