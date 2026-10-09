"use client";

import { CheckIcon, Loader2Icon, XIcon } from "lucide-react";
import * as React from "react";
import { startTransition, ViewTransition } from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { tk } from "@/registry/ui/ui-transition";

type StatusButtonStatus = "idle" | "pending" | "success" | "error";

type ButtonVariantProps = NonNullable<Parameters<typeof buttonVariants>[0]>;
type ButtonVariant = NonNullable<ButtonVariantProps["variant"]>;

type PerStatus<T> = Partial<Record<StatusButtonStatus, T>>;

const defaultIcons: PerStatus<React.ReactNode> = {
  error: <XIcon />,
  pending: <Loader2Icon className="animate-spin" />,
  success: <CheckIcon />,
};

const defaultVariants: PerStatus<ButtonVariant> = { error: "destructive" };

const isThenable = (value: unknown): value is PromiseLike<unknown> =>
  typeof (value as PromiseLike<unknown> | null)?.then === "function";

interface StatusButtonProps extends Omit<
  React.ComponentProps<"button">,
  "children" | "onClick"
> {
  /** The status to show. Pair with `onStatusChange` to control it. */
  status?: StatusButtonStatus;
  defaultStatus?: StatusButtonStatus;
  onStatusChange?: (status: StatusButtonStatus) => void;
  /** Return a promise to run pending, then success or error, automatically. */
  onClick?: (
    event: React.MouseEvent<HTMLButtonElement>
    // oxlint-disable-next-line typescript/no-invalid-void-type -- plain click handlers return void
  ) => void | PromiseLike<unknown>;
  /** Milliseconds before success or error returns to idle; `false` keeps it. */
  resetAfter?: number | false;
  labels?: PerStatus<React.ReactNode>;
  icons?: PerStatus<React.ReactNode>;
  variants?: PerStatus<ButtonVariant>;
  variant?: ButtonVariant;
  size?: ButtonVariantProps["size"];
  /** The idle label, or a function that returns the label for each status. */
  children?:
    | React.ReactNode
    | ((status: StatusButtonStatus) => React.ReactNode);
}

const StatusButton = ({
  status: statusProp,
  defaultStatus = "idle",
  onStatusChange,
  onClick,
  resetAfter = 2000,
  labels,
  icons,
  variants,
  variant = "default",
  size,
  type = "button",
  className,
  children,
  ...props
}: StatusButtonProps) => {
  const [uncontrolled, setUncontrolled] = React.useState(defaultStatus);
  const status = statusProp ?? uncontrolled;
  const controlled = statusProp !== undefined;
  // What is on screen. It follows `status` inside a React Transition, so
  // controlled and uncontrolled changes animate the same way.
  const [shown, setShown] = React.useState(status);
  const requested = React.useRef(status);
  const running = React.useRef(false);
  const statusChange = React.useRef(onStatusChange);

  React.useEffect(() => {
    statusChange.current = onStatusChange;
  });

  const setStatus = React.useCallback(
    (next: StatusButtonStatus) => {
      if (!controlled) {
        setUncontrolled(next);
      }
      statusChange.current?.(next);
    },
    [controlled]
  );

  React.useEffect(() => {
    if (requested.current === status) {
      return;
    }
    requested.current = status;
    startTransition(() => setShown(status));
  }, [status]);

  React.useEffect(() => {
    if (resetAfter === false || (status !== "success" && status !== "error")) {
      return;
    }
    const timer = window.setTimeout(() => setStatus("idle"), resetAfter);
    return () => window.clearTimeout(timer);
  }, [status, resetAfter, setStatus]);

  const pending = status === "pending";

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Pending stays focusable (aria-disabled), so swallow the click here.
    if (pending || running.current) {
      event.preventDefault();
      return;
    }
    const result = onClick?.(event);
    if (!isThenable(result)) {
      return;
    }
    running.current = true;
    setStatus("pending");
    const settle = async () => {
      let next: StatusButtonStatus = "success";
      try {
        await result;
      } catch {
        next = "error";
      }
      running.current = false;
      setStatus(next);
    };
    void settle();
  };

  const label =
    typeof children === "function"
      ? children(shown)
      : {
          error: "Failed",
          idle: children,
          pending: children,
          success: "Done",
          ...labels,
        }[shown];
  const icon = { ...defaultIcons, ...icons }[shown];
  const currentVariant = { ...defaultVariants, ...variants }[shown] ?? variant;

  return (
    <>
      {/* The button is the morphing surface. Its icon and label are nested
          boundaries, so they leave its snapshot and paint above it. */}
      <ViewTransition
        default="none"
        update={tk("tk-morph", "tk-status-button-surface")}
      >
        <button
          type={type}
          aria-disabled={pending || undefined}
          aria-busy={pending || undefined}
          data-slot="status-button"
          data-status={shown}
          data-variant={currentVariant}
          data-size={size}
          onClick={handleClick}
          className={cn(
            buttonVariants({ size, variant: currentVariant }),
            "aria-busy:cursor-progress",
            className
          )}
          {...props}
        >
          {icon ? (
            <ViewTransition
              default="none"
              enter={tk("tk-pop")}
              exit={tk("tk-pop")}
              update={tk("tk-morph", "tk-blur")}
            >
              <span
                aria-hidden
                data-slot="status-button-icon"
                className="inline-flex"
              >
                {icon}
              </span>
            </ViewTransition>
          ) : null}
          {label === null || label === undefined || label === false ? null : (
            <ViewTransition
              default="none"
              enter={tk("tk-blur")}
              exit={tk("tk-blur")}
              update={tk("tk-morph", "tk-text", "tk-blur")}
            >
              <span data-slot="status-button-label">{label}</span>
            </ViewTransition>
          )}
        </button>
      </ViewTransition>
      <span role="status" aria-live="polite" className="sr-only">
        {shown === "idle" ? null : label}
      </span>
    </>
  );
};

export { StatusButton };
export type { StatusButtonProps, StatusButtonStatus };
