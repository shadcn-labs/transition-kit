"use client";

import { SearchIcon, XIcon } from "lucide-react";
import * as React from "react";
import { addTransitionType, startTransition, ViewTransition } from "react";

import { cn } from "@/lib/utils";
import { tk, useTransitionNames } from "@/registry/ui/ui-transition";

const ExpandingSearch = ({
  value: valueProp,
  defaultValue = "",
  onValueChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onSubmit,
  placeholder = "Search…",
  label = "Search",
  className,
  ...props
}: Omit<
  React.ComponentProps<"div">,
  "defaultValue" | "onSubmit" | "onChange" | "role"
> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  label?: string;
}) => {
  const [uncontrolledValue, setUncontrolledValue] =
    React.useState(defaultValue);
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const value = valueProp ?? uncontrolledValue;
  const open = openProp ?? uncontrolledOpen;
  const names = useTransitionNames();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const restoreFocus = React.useRef(false);
  const toggle = names("toggle");

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (next === open) {
        return;
      }
      restoreFocus.current = true;
      startTransition(() => {
        addTransitionType(toggle);
        setUncontrolledOpen(next);
        onOpenChange?.(next);
      });
    },
    [open, onOpenChange, toggle]
  );

  const setValue = (next: string) => {
    setUncontrolledValue(next);
    onValueChange?.(next);
  };

  React.useLayoutEffect(() => {
    if (!restoreFocus.current) {
      return;
    }
    restoreFocus.current = false;
    (open ? inputRef.current : triggerRef.current)?.focus({
      preventScroll: true,
    });
  }, [open]);

  const surface = {
    [toggle]: tk("tk-morph", "tk-clip", "tk-expanding-search-surface"),
    default: "none",
  };
  const icon = { [toggle]: tk("tk-morph"), default: "none" };
  const fade = { [toggle]: tk("tk-fade"), default: "none" };

  const iconElement = (
    <ViewTransition name={names("icon")} default="none" share={icon}>
      <span
        aria-hidden
        data-slot="expanding-search-icon"
        className="relative inline-flex shrink-0 [&_svg]:size-4"
      >
        <SearchIcon />
      </span>
    </ViewTransition>
  );

  return (
    <div
      ref={rootRef}
      role={open ? "search" : undefined}
      data-slot="expanding-search"
      data-state={open ? "open" : "closed"}
      className={cn(
        "text-foreground relative isolate inline-flex h-9 max-w-full shrink-0 items-center overflow-hidden rounded-[var(--tk-ui-expanding-search-radius,9999px)] has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50",
        open ? "w-64 gap-2 pr-1 pl-3" : "w-9",
        className
      )}
      {...props}
    >
      <ViewTransition default="none" update={surface}>
        <span
          aria-hidden
          data-slot="expanding-search-surface"
          data-state={open ? "open" : "closed"}
          className="bg-muted absolute inset-0"
        />
      </ViewTransition>
      {open ? (
        iconElement
      ) : (
        <button
          ref={triggerRef}
          type="button"
          aria-label={label}
          aria-expanded={false}
          data-slot="expanding-search-trigger"
          onClick={() => setOpen(true)}
          className="relative inline-flex size-9 cursor-pointer items-center justify-center outline-none"
        >
          {iconElement}
        </button>
      )}
      {open ? (
        <ViewTransition default="none" enter={fade} exit={fade}>
          <input
            ref={inputRef}
            type="search"
            aria-label={label}
            placeholder={placeholder}
            value={value}
            data-slot="expanding-search-input"
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onSubmit?.(value);
              } else if (event.key === "Escape") {
                event.preventDefault();
                if (value) {
                  setValue("");
                } else {
                  setOpen(false);
                }
              }
            }}
            onBlur={(event) => {
              if (!value && !rootRef.current?.contains(event.relatedTarget)) {
                setOpen(false);
              }
            }}
            className="placeholder:text-muted-foreground relative min-w-0 flex-1 bg-transparent text-sm outline-none [&::-webkit-search-cancel-button]:hidden"
          />
        </ViewTransition>
      ) : null}
      {open ? (
        <ViewTransition default="none" enter={fade} exit={fade}>
          <button
            type="button"
            aria-label="Close search"
            data-slot="expanding-search-close"
            onClick={() => {
              setValue("");
              setOpen(false);
            }}
            className="text-muted-foreground hover:text-foreground relative inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors outline-none [&_svg]:size-4"
          >
            <XIcon aria-hidden />
          </button>
        </ViewTransition>
      ) : null}
    </div>
  );
};

export { ExpandingSearch };
