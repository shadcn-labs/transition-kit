"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";
import { tk, useTransitionNames } from "@/registry/ui/ui-transition";

interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

const LABEL = tk("tk-morph", "tk-text", "tk-top");

const Select = ({
  options,
  value: valueProp,
  defaultValue,
  onValueChange,
  placeholder = "Select…",
  name: inputName,
  form,
  disabled = false,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: Omit<React.ComponentProps<"div">, "defaultValue"> & {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  name?: string;
  form?: string;
  disabled?: boolean;
}) => {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const value = valueProp ?? uncontrolled;
  const [open, setOpen] = React.useState(false);
  const [active, setActiveState] = React.useState(0);
  const activeRef = React.useRef(0);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const typed = React.useRef({ at: 0, text: "" });
  const pending = React.useRef<boolean | null>(null);
  const names = useTransitionNames();
  const selected = options.find((option) => option.value === value);
  const opening = names("open");
  const closing = names("close");

  React.useLayoutEffect(() => {
    pending.current = null;
  });

  const setActive = (index: number) => {
    activeRef.current = index;
    setActiveState(index);
  };

  const enabled = React.useCallback(
    (index: number) => options[index] && !options[index].disabled,
    [options]
  );

  const toggle = React.useCallback(
    (next: boolean, commit?: string) => {
      if ((pending.current ?? open) === next && commit === undefined) {
        return;
      }
      pending.current = next;
      React.startTransition(() => {
        React.addTransitionType(next ? opening : closing);
        setOpen(next);
        if (commit !== undefined && commit !== value) {
          setUncontrolled(commit);
          onValueChange?.(commit);
        }
      });
    },
    [closing, onValueChange, open, opening, value]
  );

  const show = () => {
    if (disabled) {
      return;
    }
    const index = options.findIndex((option) => option.value === value);
    setActive(index === -1 ? options.findIndex((_, i) => enabled(i)) : index);
    toggle(true);
  };

  const previous = React.useRef(open);
  React.useLayoutEffect(() => {
    if (previous.current === open) {
      return;
    }
    previous.current = open;
    if (open) {
      listRef.current?.focus({ preventScroll: true });
    } else if (
      !document.activeElement ||
      document.activeElement === document.body
    ) {
      triggerRef.current?.focus({ preventScroll: true });
    }
  }, [open]);

  React.useLayoutEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = (event: PointerEvent) => {
      if (listRef.current && event.composedPath().includes(listRef.current)) {
        return;
      }
      toggle(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, toggle]);

  const move = (from: number, step: number) => {
    for (let offset = 1; offset <= options.length; offset += 1) {
      const index = (from + step * offset + options.length) % options.length;
      if (enabled(index)) {
        return index;
      }
    }
    return from;
  };

  const commit = () => {
    const option = options[activeRef.current];
    if (option && !option.disabled) {
      toggle(false, option.value);
    }
  };

  const handleListKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, () => void> = {
      " ": commit,
      ArrowDown: () => setActive(move(activeRef.current, 1)),
      ArrowUp: () => setActive(move(activeRef.current, -1)),
      End: () => setActive(move(0, -1)),
      Enter: commit,
      Escape: () => toggle(false),
      Home: () => setActive(move(options.length - 1, 1)),
    };
    if (event.key === "Tab") {
      toggle(false);
      return;
    }
    const action = keys[event.key];
    if (action) {
      event.preventDefault();
      action();
      return;
    }
    if (event.key.length === 1 && !event.metaKey && !event.ctrlKey) {
      const now = Date.now();
      const text =
        (now - typed.current.at < 600 ? typed.current.text : "") +
        event.key.toLowerCase();
      typed.current = { at: now, text };
      const match = options.findIndex(
        (option, index) =>
          enabled(index) && option.label.toLowerCase().startsWith(text)
      );
      if (match !== -1) {
        setActive(match);
      }
    }
  };

  const surface = {
    [closing]: tk("tk-morph", "tk-select-surface", "tk-down"),
    [opening]: tk("tk-morph", "tk-select-surface", "tk-up"),
    default: tk("tk-morph", "tk-select-surface"),
  };

  const optionId = (index: number) => names("option", index);

  const trigger = (
    <button
      ref={triggerRef}
      type="button"
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={open ? names("list") : undefined}
      id={names("trigger")}
      aria-label={ariaLabel}
      aria-labelledby={
        ariaLabelledBy ? `${ariaLabelledBy} ${names("trigger")}` : undefined
      }
      disabled={disabled}
      data-state={open ? "open" : "closed"}
      data-slot="select-trigger"
      onClick={show}
      onKeyDown={(event) => {
        if (["ArrowDown", "ArrowUp"].includes(event.key)) {
          event.preventDefault();
          show();
        }
      }}
      className="bg-popover text-popover-foreground ring-border hover:bg-accent focus-visible:ring-ring/50 flex h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-3 text-sm shadow-xs ring-1 outline-none transition-colors focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[state=open]:invisible [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
    >
      {selected && !open ? (
        <React.ViewTransition
          name={names("label", selected.value)}
          default="none"
          share={LABEL}
        >
          <span className="flex min-w-0 items-center gap-2">
            {selected.icon}
            <span className="truncate">{selected.label}</span>
          </span>
        </React.ViewTransition>
      ) : (
        <span
          className={cn(
            "flex min-w-0 items-center gap-2",
            !selected && "text-muted-foreground"
          )}
        >
          {selected?.icon}
          <span className="truncate">{selected?.label ?? placeholder}</span>
        </span>
      )}
      <ChevronsUpDown className="text-muted-foreground" aria-hidden />
    </button>
  );

  return (
    <div
      data-slot="select"
      data-state={open ? "open" : "closed"}
      className={cn("relative w-56", className)}
      {...props}
    >
      {open ? (
        trigger
      ) : (
        <React.ViewTransition
          name={names("surface")}
          default="none"
          share={surface}
        >
          {trigger}
        </React.ViewTransition>
      )}
      {open ? (
        <React.ViewTransition
          name={names("surface")}
          default="none"
          share={surface}
        >
          <div
            ref={listRef}
            id={names("list")}
            role="listbox"
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-activedescendant={optionId(active)}
            tabIndex={-1}
            data-slot="select-content"
            onKeyDown={handleListKeyDown}
            onBlur={(event) => {
              if (
                event.relatedTarget instanceof Node &&
                !event.currentTarget.contains(event.relatedTarget)
              ) {
                toggle(false);
              }
            }}
            className="bg-popover text-popover-foreground ring-border absolute start-0 top-0 z-50 flex max-h-72 w-full min-w-max flex-col overflow-y-auto rounded-lg p-1 text-sm shadow-lg ring-1 outline-none"
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;
              return (
                <div
                  key={option.value}
                  id={optionId(index)}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={option.disabled || undefined}
                  data-active={index === active ? "" : undefined}
                  data-slot="select-item"
                  onPointerMove={() => {
                    if (!option.disabled && index !== active) {
                      setActive(index);
                    }
                  }}
                  onClick={() => {
                    if (!option.disabled) {
                      toggle(false, option.value);
                    }
                  }}
                  className="data-[active]:bg-accent data-[active]:text-accent-foreground flex h-8 cursor-pointer items-center justify-between gap-3 rounded-md px-2 select-none aria-disabled:cursor-not-allowed aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                >
                  {index === active ? (
                    <React.ViewTransition
                      name={names("label", option.value)}
                      default="none"
                      share={LABEL}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        {option.icon}
                        <span className="truncate">{option.label}</span>
                      </span>
                    </React.ViewTransition>
                  ) : (
                    <span className="flex min-w-0 items-center gap-2">
                      {option.icon}
                      <span className="truncate">{option.label}</span>
                    </span>
                  )}
                  {isSelected ? (
                    <Check className="text-foreground" aria-hidden />
                  ) : null}
                </div>
              );
            })}
          </div>
        </React.ViewTransition>
      ) : null}
      {inputName ? (
        <input
          type="hidden"
          name={inputName}
          form={form}
          value={value ?? ""}
          disabled={disabled}
        />
      ) : null}
    </div>
  );
};

export { Select };
export type { SelectOption };
