"use client";

import { PanelLeftCloseIcon, PanelLeftOpenIcon } from "lucide-react";
import * as React from "react";
import { addTransitionType, startTransition, ViewTransition } from "react";

import { cn } from "@/lib/utils";
import { tk, useTransitionNames } from "@/registry/ui/ui-transition";
import type { TransitionNames } from "@/registry/ui/ui-transition";

interface CollapsibleSidebarContextValue {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  value: string;
  select: (value: string) => void;
  names: TransitionNames;
  toggle: string;
  choose: string;
}

const CollapsibleSidebarContext =
  React.createContext<CollapsibleSidebarContextValue | null>(null);

const useCollapsibleSidebarContext = () => {
  const context = React.useContext(CollapsibleSidebarContext);
  if (!context) {
    throw new Error(
      "CollapsibleSidebar parts must be used within <CollapsibleSidebarProvider>."
    );
  }
  return context;
};

/** Reads and animates the sidebar's collapsed state and active item. */
const useCollapsibleSidebar = () => {
  const { collapsed, select, setCollapsed, value } =
    useCollapsibleSidebarContext();
  return { collapsed, select, setCollapsed, value };
};

const CollapsibleSidebarProvider = ({
  collapsed: collapsedProp,
  defaultCollapsed = false,
  onCollapsedChange,
  value: valueProp,
  defaultValue = "",
  onValueChange,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "defaultValue"> & {
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}) => {
  const [uncontrolledCollapsed, setUncontrolledCollapsed] =
    React.useState(defaultCollapsed);
  const [uncontrolledValue, setUncontrolledValue] =
    React.useState(defaultValue);
  const collapsed = collapsedProp ?? uncontrolledCollapsed;
  const value = valueProp ?? uncontrolledValue;
  const names = useTransitionNames();
  const toggle = names("toggle");
  const choose = names("choose");

  const setCollapsed = React.useCallback(
    (next: boolean) => {
      if (next === collapsed) {
        return;
      }
      startTransition(() => {
        addTransitionType(toggle);
        setUncontrolledCollapsed(next);
        onCollapsedChange?.(next);
      });
    },
    [collapsed, onCollapsedChange, toggle]
  );

  const select = React.useCallback(
    (next: string) => {
      if (next === value) {
        return;
      }
      startTransition(() => {
        addTransitionType(choose);
        setUncontrolledValue(next);
        onValueChange?.(next);
      });
    },
    [value, onValueChange, choose]
  );

  const context = React.useMemo(
    () => ({ choose, collapsed, names, select, setCollapsed, toggle, value }),
    [choose, collapsed, names, select, setCollapsed, toggle, value]
  );

  return (
    <CollapsibleSidebarContext.Provider value={context}>
      <div
        data-slot="collapsible-sidebar-provider"
        data-state={collapsed ? "collapsed" : "expanded"}
        className={cn("flex w-full gap-3", className)}
        {...props}
      />
    </CollapsibleSidebarContext.Provider>
  );
};

const useGlide = () => {
  const { choose, toggle } = useCollapsibleSidebarContext();
  const glide = tk("tk-morph");
  return { [choose]: glide, [toggle]: glide, default: "none" };
};

const CollapsibleSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"nav">) => {
  const { collapsed, toggle } = useCollapsibleSidebarContext();

  return (
    <nav
      data-slot="collapsible-sidebar"
      data-state={collapsed ? "collapsed" : "expanded"}
      className={cn(
        "relative isolate flex shrink-0 flex-col gap-1 overflow-hidden rounded-[var(--tk-ui-collapsible-sidebar-radius,0.75rem)] p-2",
        collapsed ? "w-[3.25rem]" : "w-52",
        className
      )}
      {...props}
    >
      <ViewTransition
        default="none"
        update={{
          [toggle]: tk("tk-morph", "tk-clip", "tk-collapsible-sidebar-surface"),
          default: "none",
        }}
      >
        <span
          aria-hidden
          data-slot="collapsible-sidebar-surface"
          data-state={collapsed ? "collapsed" : "expanded"}
          className="bg-muted absolute inset-0"
        />
      </ViewTransition>
      {children}
    </nav>
  );
};

const CollapsibleSidebarTrigger = ({
  className,
  onClick,
  ...props
}: React.ComponentProps<"button">) => {
  const { collapsed, setCollapsed } = useCollapsibleSidebarContext();
  const glide = useGlide();
  const Icon = collapsed ? PanelLeftOpenIcon : PanelLeftCloseIcon;

  return (
    <button
      type="button"
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      aria-expanded={!collapsed}
      data-slot="collapsible-sidebar-trigger"
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          setCollapsed(!collapsed);
        }
      }}
      className={cn(
        "text-muted-foreground hover:text-foreground relative inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        className
      )}
      {...props}
    >
      <ViewTransition default="none" update={glide}>
        <span
          aria-hidden
          data-state={collapsed ? "collapsed" : "expanded"}
          className="inline-flex [&_svg]:size-4"
        >
          <Icon />
        </span>
      </ViewTransition>
    </button>
  );
};

const CollapsibleSidebarItem = ({
  value,
  icon,
  className,
  children,
  onClick,
  ...props
}: Omit<React.ComponentProps<"button">, "value"> & {
  value: string;
  icon: React.ReactNode;
}) => {
  const {
    choose,
    collapsed,
    names,
    select,
    toggle,
    value: active,
  } = useCollapsibleSidebarContext();
  const glide = useGlide();
  const selected = value === active;
  const label = {
    [toggle]: tk("tk-collapsible-sidebar-label"),
    default: "none",
  };

  return (
    <button
      type="button"
      aria-current={selected ? "page" : undefined}
      title={collapsed && typeof children === "string" ? children : undefined}
      data-slot="collapsible-sidebar-item"
      data-state={selected ? "active" : "inactive"}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          select(value);
        }
      }}
      className={cn(
        "text-muted-foreground hover:text-foreground data-[state=active]:text-foreground relative flex h-9 w-full shrink-0 cursor-pointer items-center gap-3 rounded-md px-2.5 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
        className
      )}
      {...props}
    >
      {selected ? (
        <ViewTransition
          name={names("indicator")}
          default="none"
          update={glide}
          share={{ [choose]: tk("tk-morph"), default: "none" }}
        >
          <span
            aria-hidden
            data-slot="collapsible-sidebar-indicator"
            className="bg-background dark:bg-input/40 absolute inset-0 rounded-md shadow-sm"
          />
        </ViewTransition>
      ) : null}
      <ViewTransition default="none" update={glide}>
        <span
          aria-hidden
          data-slot="collapsible-sidebar-icon"
          data-snapshot={`${collapsed}-${active}`}
          className="relative inline-flex shrink-0 [&_svg]:size-4"
        >
          {icon}
        </span>
      </ViewTransition>
      {collapsed ? (
        <span className="sr-only">{children}</span>
      ) : (
        <ViewTransition
          default="none"
          update={glide}
          enter={label}
          exit={label}
        >
          <span
            data-slot="collapsible-sidebar-label"
            data-snapshot={active}
            className="relative truncate"
          >
            {children}
          </span>
        </ViewTransition>
      )}
    </button>
  );
};

const CollapsibleSidebarInset = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  const { collapsed, toggle } = useCollapsibleSidebarContext();

  return (
    <ViewTransition
      default="none"
      update={{ [toggle]: tk("tk-morph", "tk-text"), default: "none" }}
    >
      <div
        data-slot="collapsible-sidebar-inset"
        data-state={collapsed ? "collapsed" : "expanded"}
        className={cn("min-w-0 flex-1", className)}
        {...props}
      />
    </ViewTransition>
  );
};

export {
  CollapsibleSidebar,
  CollapsibleSidebarInset,
  CollapsibleSidebarItem,
  CollapsibleSidebarProvider,
  CollapsibleSidebarTrigger,
  useCollapsibleSidebar,
};
