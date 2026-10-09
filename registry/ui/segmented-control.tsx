"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { tk, useTransitionNames } from "@/registry/ui/ui-transition";
import type { TransitionNames } from "@/registry/ui/ui-transition";

type Size = "sm" | "md" | "lg";

interface SegmentedControlContextValue {
  value: string;
  tabStop: string;
  size: Size;
  disabled: boolean;
  name: TransitionNames;
  select: (value: string) => void;
}

const SegmentedControlContext =
  React.createContext<SegmentedControlContextValue | null>(null);

const useSegmentedControl = () => {
  const context = React.useContext(SegmentedControlContext);
  if (!context) {
    throw new Error(
      "SegmentedControlItem must be used within <SegmentedControl>."
    );
  }
  return context;
};

const rootSizes: Record<Size, string> = {
  lg: "h-10 text-sm",
  md: "h-9 text-sm",
  sm: "h-8 text-xs [&_svg:not([class*='size-'])]:size-3.5",
};

const itemSizes: Record<Size, string> = {
  lg: "px-4 data-[icon-only]:min-w-[2.125rem] data-[icon-only]:px-0",
  md: "px-3 data-[icon-only]:min-w-[1.875rem] data-[icon-only]:px-0",
  sm: "px-2.5 data-[icon-only]:min-w-[1.625rem] data-[icon-only]:px-0",
};

const enabledItem = '[role="radio"]:not([disabled])';

const SegmentedControl = ({
  value: valueProp,
  defaultValue = "",
  onValueChange,
  name: inputName,
  form,
  size = "md",
  disabled = false,
  className,
  children,
  onKeyDown,
  ...props
}: Omit<React.ComponentProps<"div">, "defaultValue"> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Submits the selected value with this field name in a surrounding form. */
  name?: string;
  /** Associates the hidden input with a form elsewhere in the document. */
  form?: string;
  size?: Size;
  disabled?: boolean;
}) => {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const value = valueProp ?? uncontrolled;
  const [tabStop, setTabStop] = React.useState(value);
  const groupRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const name = useTransitionNames();

  // Roving tabindex: the checked item, or the first enabled one when nothing
  // (enabled) is checked, so the group is always reachable with Tab.
  React.useLayoutEffect(() => {
    const items = [
      ...(groupRef.current?.querySelectorAll<HTMLElement>(enabledItem) ?? []),
    ];
    const checked = items.find((item) => item.dataset.value === value);
    setTabStop((checked ?? items[0])?.dataset.value ?? value);
  });

  // Uncontrolled state follows a native form reset, like a real radio group.
  React.useEffect(() => {
    const owner = inputRef.current?.form;
    if (!owner || valueProp !== undefined) {
      return;
    }
    const reset = () => setUncontrolled(defaultValue);
    owner.addEventListener("reset", reset);
    return () => owner.removeEventListener("reset", reset);
  }, [defaultValue, valueProp]);

  const select = React.useCallback(
    (next: string) => {
      if (next === value || disabled) {
        return;
      }
      React.startTransition(() => {
        setUncontrolled(next);
        onValueChange?.(next);
      });
    },
    [disabled, onValueChange, value]
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || disabled) {
      return;
    }
    const items = [
      ...event.currentTarget.querySelectorAll<HTMLElement>(enabledItem),
    ];
    const index = items.indexOf(event.target as HTMLElement);
    if (index === -1) {
      return;
    }
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const step = (delta: number) =>
      items[(index + delta + items.length) % items.length];
    const target = {
      ArrowDown: step(1),
      ArrowLeft: step(rtl ? 1 : -1),
      ArrowRight: step(rtl ? -1 : 1),
      ArrowUp: step(-1),
      End: items.at(-1),
      Home: items[0],
    }[event.key];
    if (!target) {
      return;
    }
    event.preventDefault();
    target.focus();
    select(target.dataset.value ?? "");
  };

  const context = React.useMemo(
    () => ({ disabled, name, select, size, tabStop, value }),
    [disabled, name, select, size, tabStop, value]
  );

  return (
    <SegmentedControlContext.Provider value={context}>
      <div
        ref={groupRef}
        role="radiogroup"
        aria-orientation="horizontal"
        aria-disabled={disabled || undefined}
        data-slot="segmented-control"
        data-size={size}
        data-disabled={disabled ? "" : undefined}
        onKeyDown={handleKeyDown}
        className={cn(
          "bg-muted text-muted-foreground inline-flex w-fit items-stretch rounded-lg p-[3px] data-[disabled]:opacity-50",
          rootSizes[size],
          className
        )}
        {...props}
      >
        {children}
        {inputName ? (
          <input
            ref={inputRef}
            type="hidden"
            name={inputName}
            form={form}
            value={value}
            disabled={disabled}
          />
        ) : null}
      </div>
    </SegmentedControlContext.Provider>
  );
};

const SegmentedControlItem = ({
  value,
  icon,
  className,
  children,
  disabled: disabledProp,
  onClick,
  ...props
}: Omit<React.ComponentProps<"button">, "value"> & {
  value: string;
  /** Rendered before the label. Icon-only items need an `aria-label`. */
  icon?: React.ReactNode;
}) => {
  const context = useSegmentedControl();
  const { name, select, size, tabStop } = context;
  const checked = value === context.value;
  const disabled = context.disabled || disabledProp;
  const iconOnly = children === undefined || children === null;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      tabIndex={value === tabStop ? 0 : -1}
      disabled={disabled}
      data-value={value}
      data-state={checked ? "checked" : "unchecked"}
      data-icon-only={iconOnly ? "" : undefined}
      data-slot="segmented-control-item"
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          select(value);
        }
      }}
      className={cn(
        "relative inline-flex flex-1 cursor-pointer items-center justify-center rounded-md font-medium whitespace-nowrap transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:text-muted-foreground data-[state=checked]:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        itemSizes[size],
        className
      )}
      {...props}
    >
      {checked ? (
        // Rendered in the checked item only: the thumb leaving one item and
        // appearing in the next share a name, so it glides.
        <React.ViewTransition
          name={name("thumb")}
          default="none"
          share={tk("tk-morph", "tk-spring")}
        >
          <span
            aria-hidden
            data-slot="segmented-control-thumb"
            className="bg-background dark:bg-input/30 dark:ring-input absolute inset-0 rounded-md shadow-sm dark:ring-1"
          />
        </React.ViewTransition>
      ) : null}
      {/*
       * Every label is captured and raised with tk-top, so the gliding thumb
       * never covers one, whichever direction it travels. data-checked-value
       * changes with every selection, which is what makes React capture it.
       */}
      <React.ViewTransition default="none" update={tk("tk-morph", "tk-top")}>
        <span
          data-slot="segmented-control-label"
          data-checked-value={context.value}
          className="relative inline-flex items-center gap-1.5"
        >
          {icon}
          {children}
        </span>
      </React.ViewTransition>
    </button>
  );
};

export { SegmentedControl, SegmentedControlItem };
