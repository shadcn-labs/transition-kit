"use client";

import * as React from "react";
import { addTransitionType, startTransition, ViewTransition } from "react";

import { cn } from "@/lib/utils";
import { tk, useTransitionNames } from "@/registry/ui/ui-transition";

interface FlipPart {
  /** Stable identity: digits count from the decimal point, symbols from the right. */
  key: string;
  char: string;
  digit: boolean;
  /** Orders digits right to left for the stagger (lower rolls first). */
  weight: number;
}

interface Formatted {
  value: number;
  text: string;
  parts: FlipPart[];
}

interface Shown extends Formatted {
  /** The parts this number replaced, to tell which digits changed. */
  before: FlipPart[];
}

const toParts = (formatted: Intl.NumberFormatPart[]): FlipPart[] => {
  const chars = formatted.flatMap((part) =>
    part.type === "integer" || part.type === "fraction"
      ? Array.from(part.value, (char) => ({ char, type: part.type }))
      : [{ char: part.value, type: part.type }]
  );
  const counts = new Map<string, number>();
  const keyed: FlipPart[] = [];
  // Integer digits and symbols are keyed from the right, so a new leading
  // digit (999 -> 1,000) doesn't shift every other key.
  for (let index = chars.length - 1; index >= 0; index -= 1) {
    const { char, type } = chars[index];
    if (type === "fraction") {
      continue;
    }
    const count = counts.get(type) ?? 0;
    counts.set(type, count + 1);
    keyed[index] = {
      char,
      digit: type === "integer",
      key: `${type}-${count}`,
      weight: count,
    };
  }
  // Fraction digits are keyed from the decimal point.
  let fraction = 0;
  for (const [index, { char, type }] of chars.entries()) {
    if (type === "fraction") {
      keyed[index] = {
        char,
        digit: true,
        key: `fraction-${fraction}`,
        weight: -1 - fraction,
      };
      fraction += 1;
    }
  }
  return keyed;
};

const charMap = (parts: FlipPart[] | null) =>
  new Map(parts?.map((part) => [part.key, part.char]));

/** Rank of each changed digit, counted from the right, for `tk-delay-N`. */
const staggerRanks = (a: FlipPart[], b: FlipPart[] | null) => {
  const before = charMap(b);
  const after = charMap(a);
  const changed = new Map<string, number>();
  for (const part of [...a, ...(b ?? [])]) {
    if (part.digit && before.get(part.key) !== after.get(part.key)) {
      changed.set(part.key, part.weight);
    }
  }
  const ranks = new Map<string, number>();
  for (const [index, [key]] of [...changed]
    .toSorted((x, y) => x[1] - y[1])
    .entries()) {
    ranks.set(key, Math.min(index, 8));
  }
  return ranks;
};

const NumberFlip = ({
  value,
  format,
  locales = "en-US",
  stagger = false,
  className,
  ...props
}: Omit<React.ComponentProps<"span">, "children"> & {
  value: number;
  format?: Intl.NumberFormatOptions;
  locales?: Intl.LocalesArgument;
  stagger?: boolean;
}) => {
  const names = useTransitionNames();
  const formatKey = JSON.stringify(format ?? {});
  const localeKey = JSON.stringify(locales ?? null);

  const target = React.useMemo<Formatted>(() => {
    const formatted = new Intl.NumberFormat(
      JSON.parse(localeKey) ?? undefined,
      JSON.parse(formatKey)
    ).formatToParts(value);
    return {
      parts: toParts(formatted),
      text: formatted.map((part) => part.value).join(""),
      value,
    };
  }, [value, formatKey, localeKey]);

  // What is on screen. It follows `target` inside a React Transition, so a
  // plain `setState` in the parent still animates.
  const [shown, setShown] = React.useState<Shown>(() => ({
    ...target,
    before: target.parts,
  }));

  // Direction types are scoped to this instance, so counters that change in
  // the same transition each roll their own way.
  const up = names("up");
  const down = names("down");

  React.useEffect(() => {
    if (target.text === shown.text) {
      return;
    }
    startTransition(() => {
      addTransitionType(target.value < shown.value ? down : up);
      setShown({ ...target, before: shown.parts });
    });
  }, [target, shown, up, down]);

  const before = charMap(shown.before);
  const ranks = stagger ? staggerRanks(shown.parts, shown.before) : null;
  // Characters only animate in this instance's transitions; in any other
  // transition they stay part of their parent's snapshot.
  const still = tk("tk-morph", "tk-text");
  const glide = { [up]: still, [down]: still, default: "none" };

  return (
    <span
      data-slot="number-flip"
      className={cn("inline-flex whitespace-pre tabular-nums", className)}
      {...props}
    >
      <span className="sr-only">{target.text}</span>
      <span aria-hidden className="inline-flex">
        {shown.parts.map((part) => {
          const rank = ranks?.get(part.key) ?? 0;
          const delay = rank > 0 && `tk-delay-${rank}`;
          const rolls = {
            [up]: tk("tk-morph", "tk-roll", "tk-clip", "tk-up", delay),
            [down]: tk("tk-morph", "tk-roll", "tk-clip", "tk-down", delay),
            default: "none",
          };
          // Changed digits roll in their own box; separators and unchanged
          // digits only glide when the number's width moves them.
          const changed = part.digit && before.get(part.key) !== part.char;
          return (
            <ViewTransition
              key={part.key}
              default="none"
              update={changed ? rolls : glide}
              enter={part.digit ? rolls : glide}
              exit={part.digit ? rolls : glide}
            >
              <span data-slot="number-flip-char" className="inline-block">
                {part.char}
              </span>
            </ViewTransition>
          );
        })}
      </span>
    </span>
  );
};

export { NumberFlip };
