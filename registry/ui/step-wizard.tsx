"use client";

import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";
import {
  BACK,
  FORWARD,
  tk,
  useTransitionNames,
} from "@/registry/ui/ui-transition";
import type { TransitionNames } from "@/registry/ui/ui-transition";

type Direction = typeof FORWARD | typeof BACK;

/** `false` blocks Next; a function runs when Next is pressed and blocks it by returning `false`. */
type CanAdvance = boolean | (() => boolean);

interface StepMeta {
  label?: string;
  canAdvance?: CanAdvance;
}

interface StepWizardContextValue {
  step: number;
  count: number;
  labels: string[];
  blocked: boolean;
  direction: Direction;
  name: TransitionNames;
  focusTarget: React.RefObject<number | null>;
  goTo: (step: number) => void;
  next: () => void;
  previous: () => void;
  register: (steps: StepMeta[]) => void;
}

const StepWizardContext = React.createContext<StepWizardContextValue | null>(
  null
);
const StepIndexContext = React.createContext<number | null>(null);

const useStepWizardContext = () => {
  const context = React.useContext(StepWizardContext);
  if (!context) {
    throw new Error("StepWizard parts must be used within <StepWizard>.");
  }
  return context;
};

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

const sameItems = <T,>(a: T[], b: T[]) =>
  a.length === b.length && a.every((item, index) => item === b[index]);

const buttonBase =
  "inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md px-4 text-sm font-medium whitespace-nowrap transition-colors outline-none has-[>svg]:px-3 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

/** The step viewport's slide, in the direction the wizard moves. */
const slideStep = (direction: Direction) =>
  tk("tk-morph", "tk-slide", "tk-step-wizard-viewport", direction);

const StepWizard = ({
  step: stepProp,
  defaultStep = 0,
  onStepChange,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  step?: number;
  defaultStep?: number;
  onStepChange?: (step: number) => void;
}) => {
  const [uncontrolled, setUncontrolled] = React.useState(defaultStep);
  const [labels, setLabels] = React.useState<string[]>([]);
  const [blockedSteps, setBlockedSteps] = React.useState<boolean[]>([]);
  const rules = React.useRef<(CanAdvance | undefined)[]>([]);
  const focusTarget = React.useRef<number | null>(null);
  const name = useTransitionNames();

  const count = labels.length;
  const requested = Math.max(0, stepProp ?? uncontrolled);
  const step = count > 0 ? Math.min(requested, count - 1) : requested;

  // Navigation inside the wizard tags its transition FORWARD or BACK. The
  // direction derived here covers a controlled `step` changed from outside.
  const [previousStep, setPreviousStep] = React.useState(step);
  const [direction, setDirection] = React.useState<Direction>(FORWARD);
  if (previousStep !== step) {
    setPreviousStep(step);
    setDirection(step > previousStep ? FORWARD : BACK);
  }

  const register = React.useCallback((steps: StepMeta[]) => {
    rules.current = steps.map((meta) => meta.canAdvance);
    const nextLabels = steps.map(
      (meta, index) => meta.label ?? `Step ${index + 1}`
    );
    const nextBlocked = steps.map((meta) => meta.canAdvance === false);
    setLabels((current) =>
      sameItems(current, nextLabels) ? current : nextLabels
    );
    setBlockedSteps((current) =>
      sameItems(current, nextBlocked) ? current : nextBlocked
    );
  }, []);

  const goTo = React.useCallback(
    (target: number) => {
      if (target === step || target < 0 || target >= count) {
        return;
      }
      focusTarget.current = target;
      React.startTransition(() => {
        React.addTransitionType(target > step ? FORWARD : BACK);
        setUncontrolled(target);
        onStepChange?.(target);
      });
    },
    [count, onStepChange, step]
  );

  const next = React.useCallback(() => {
    const rule = rules.current[step];
    if (rule === false || (typeof rule === "function" && !rule())) {
      return;
    }
    goTo(step + 1);
  }, [goTo, step]);

  const previous = React.useCallback(() => goTo(step - 1), [goTo, step]);

  const blocked = blockedSteps[step] ?? false;
  const context = React.useMemo(
    () => ({
      blocked,
      count,
      direction,
      focusTarget,
      goTo,
      labels,
      name,
      next,
      previous,
      register,
      step,
    }),
    [
      blocked,
      count,
      direction,
      goTo,
      labels,
      name,
      next,
      previous,
      register,
      step,
    ]
  );

  return (
    <StepWizardContext.Provider value={context}>
      {/* The card resizes with the step; its parts animate on their own. */}
      <React.ViewTransition
        default="none"
        update={tk("tk-morph", "tk-step-wizard-fill")}
      >
        <div
          data-slot="step-wizard"
          data-step={step}
          className={cn(
            "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border p-6 shadow-sm",
            className
          )}
          {...props}
        />
      </React.ViewTransition>
    </StepWizardContext.Provider>
  );
};

const StepWizardIndicator = ({
  className,
  "aria-label": ariaLabel = "Progress",
  ...props
}: React.ComponentProps<"nav">) => {
  const { count, goTo, labels, name, step } = useStepWizardContext();
  // Track and fill run between the centres of the first and last columns.
  const inset = count > 0 ? `${50 / count}%` : "0%";

  return (
    <React.ViewTransition default="none" update={tk("tk-morph")}>
      <nav
        aria-label={ariaLabel}
        data-slot="step-wizard-indicator"
        className={cn("min-h-14", className)}
        {...props}
      >
        <ol
          className="relative grid"
          style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
        >
          <span
            aria-hidden
            className="bg-border absolute top-3.5 h-0.5 -translate-y-1/2 rounded-full"
            style={{ left: inset, right: inset }}
          />
          <React.ViewTransition
            default="none"
            update={tk("tk-morph", "tk-step-wizard-fill")}
          >
            <span
              aria-hidden
              data-slot="step-wizard-fill"
              className="bg-primary absolute top-3.5 h-0.5 -translate-y-1/2 rounded-full"
              style={{
                left: inset,
                width: count > 0 ? `${(step / count) * 100}%` : 0,
              }}
            />
          </React.ViewTransition>
          {labels.map((label, index) => {
            let state = "upcoming";
            if (index < step) {
              state = "complete";
            } else if (index === step) {
              state = "current";
            }
            return (
              <li
                key={index}
                aria-current={state === "current" ? "step" : undefined}
                data-state={state}
                className="flex justify-center"
              >
                <button
                  type="button"
                  disabled={index >= step}
                  onClick={() => goTo(index)}
                  className="group/step flex min-w-0 cursor-pointer flex-col items-center gap-2 rounded-md px-1 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-default"
                >
                  <span className="relative grid size-7 place-items-center">
                    {/* Rendered in one step at a time: React pairs the old and new marker. */}
                    {state === "current" ? (
                      <React.ViewTransition
                        name={name("marker")}
                        default="none"
                        share={tk("tk-morph", "tk-spring")}
                      >
                        <span
                          aria-hidden
                          data-slot="step-wizard-marker"
                          className="bg-primary ring-primary/15 absolute inset-0 rounded-full ring-4"
                        />
                      </React.ViewTransition>
                    ) : null}
                    {/* tk-step-wizard-dot keeps the number above the gliding marker. */}
                    <React.ViewTransition
                      default="none"
                      update={tk("tk-morph", "tk-step-wizard-dot")}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "relative grid size-7 place-items-center rounded-full text-xs font-medium tabular-nums transition-colors",
                          state === "complete" &&
                            "bg-primary text-primary-foreground group-hover/step:bg-primary/85",
                          state === "current" && "text-primary-foreground",
                          state === "upcoming" &&
                            "bg-background text-muted-foreground border"
                        )}
                      >
                        {state === "complete" ? (
                          <Check className="size-3.5" strokeWidth={3} />
                        ) : (
                          index + 1
                        )}
                      </span>
                    </React.ViewTransition>
                  </span>
                  <span
                    className={cn(
                      "max-w-full truncate text-xs font-medium",
                      state === "upcoming"
                        ? "text-muted-foreground"
                        : "text-foreground"
                    )}
                  >
                    {label}
                    {state === "complete" ? (
                      <span className="sr-only"> (completed)</span>
                    ) : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </React.ViewTransition>
  );
};

const StepWizardContent = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { direction, register } = useStepWizardContext();
  const steps = React.Children.toArray(children).filter(
    React.isValidElement<StepMeta>
  );

  useIsomorphicLayoutEffect(() => {
    register(
      steps.map(({ props: { canAdvance, label } }) => ({ canAdvance, label }))
    );
  });

  // Steps stay mounted (form fields keep their values), so a step change is an
  // update of this one boundary: the old step slides out, the new one in.
  return (
    <React.ViewTransition
      default="none"
      update={{
        [BACK]: slideStep(BACK),
        [FORWARD]: slideStep(FORWARD),
        default: slideStep(direction),
      }}
    >
      <div
        data-slot="step-wizard-content"
        className={cn("relative", className)}
        {...props}
      >
        {steps.map((child, index) => (
          <StepIndexContext.Provider key={child.key ?? index} value={index}>
            {child}
          </StepIndexContext.Provider>
        ))}
      </div>
    </React.ViewTransition>
  );
};

const StepWizardStep = ({
  label,
  canAdvance: _canAdvance,
  className,
  "aria-label": ariaLabel,
  ...props
}: React.ComponentProps<"div"> & {
  /** Shown in the indicator and used as the step's accessible name. */
  label?: string;
  /** Read by `StepWizardContent`: `false` disables Next, a function can veto it. */
  canAdvance?: CanAdvance;
}) => {
  const { count, focusTarget, step } = useStepWizardContext();
  const index = React.useContext(StepIndexContext);
  if (index === null) {
    throw new Error("StepWizardStep must be a child of <StepWizardContent>.");
  }
  const ref = React.useRef<HTMLDivElement>(null);
  const active = index === step;

  useIsomorphicLayoutEffect(() => {
    if (!active || focusTarget.current !== index) {
      return;
    }
    focusTarget.current = null;
    const element = ref.current;
    const target =
      element?.querySelector<HTMLElement>('[data-slot="step-wizard-title"]') ??
      element;
    target?.focus({ preventScroll: true });
  }, [active, focusTarget, index]);

  return (
    <div
      ref={ref}
      role="group"
      aria-label={ariaLabel ?? `${label ?? "Step"} (${index + 1} of ${count})`}
      // Inactive steps stay mounted, so form fields keep their values.
      hidden={!active}
      tabIndex={-1}
      data-slot="step-wizard-step"
      data-state={active ? "active" : "inactive"}
      className={cn("flex flex-col gap-4 outline-none", className)}
      {...props}
    />
  );
};

const StepWizardTitle = ({
  className,
  ...props
}: React.ComponentProps<"h3">) => (
  <h3
    tabIndex={-1}
    data-slot="step-wizard-title"
    className={cn("leading-none font-semibold outline-none", className)}
    {...props}
  />
);

const StepWizardDescription = ({
  className,
  ...props
}: React.ComponentProps<"p">) => (
  <p
    data-slot="step-wizard-description"
    className={cn("text-muted-foreground -mt-2 text-sm", className)}
    {...props}
  />
);

const StepWizardPrevious = ({
  className,
  children,
  onClick,
  ...props
}: React.ComponentProps<"button">) => {
  const { previous, step } = useStepWizardContext();
  return (
    <React.ViewTransition default="none" update={tk("tk-morph")}>
      <button
        type="button"
        disabled={step === 0}
        data-slot="step-wizard-previous"
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) {
            previous();
          }
        }}
        className={cn(
          buttonBase,
          "bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 border shadow-xs",
          className
        )}
        {...props}
      >
        {children ?? (
          <>
            <ArrowLeft />
            Back
          </>
        )}
      </button>
    </React.ViewTransition>
  );
};

const StepWizardNext = ({
  className,
  children,
  onClick,
  ...props
}: React.ComponentProps<"button">) => {
  const { blocked, count, next, step } = useStepWizardContext();
  return (
    <React.ViewTransition default="none" update={tk("tk-morph")}>
      <button
        type="button"
        disabled={count > 0 && step >= count - 1}
        // aria-disabled keeps a blocked button focusable and announced.
        aria-disabled={blocked || undefined}
        data-slot="step-wizard-next"
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) {
            next();
          }
        }}
        className={cn(
          buttonBase,
          "bg-primary text-primary-foreground hover:bg-primary/90 aria-disabled:hover:bg-primary shadow-xs",
          className
        )}
        {...props}
      >
        {children ?? (
          <>
            Continue
            <ArrowRight />
          </>
        )}
      </button>
    </React.ViewTransition>
  );
};

/** Current step and navigation, for custom controls inside `<StepWizard>`. */
const useStepWizard = () => {
  const { count, goTo, next, previous, step } = useStepWizardContext();
  return {
    count,
    goTo,
    isFirst: step === 0,
    isLast: count > 0 && step === count - 1,
    next,
    previous,
    step,
  };
};

export {
  StepWizard,
  StepWizardContent,
  StepWizardDescription,
  StepWizardIndicator,
  StepWizardNext,
  StepWizardPrevious,
  StepWizardStep,
  StepWizardTitle,
  useStepWizard,
};
