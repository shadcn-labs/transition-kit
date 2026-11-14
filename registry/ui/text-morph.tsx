"use client";

import * as React from "react";
import { addTransitionType, startTransition, ViewTransition } from "react";

import { cn } from "@/lib/utils";
import { tk, useTransitionNames } from "@/registry/ui/ui-transition";

interface MorphChar {
  key: string;
  char: string;
}

const segmenter =
  typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : null;

const toChars = (text: string): MorphChar[] => {
  const graphemes = segmenter
    ? Array.from(segmenter.segment(text), (part) => part.segment)
    : [...text];
  const counts = new Map<string, number>();
  return graphemes.map((char) => {
    const count = counts.get(char) ?? 0;
    counts.set(char, count + 1);
    return { char, key: `${char}-${count}` };
  });
};

const TextMorph = ({
  children,
  className,
  ...props
}: Omit<React.ComponentProps<"span">, "children"> & { children: string }) => {
  const names = useTransitionNames();
  const [shown, setShown] = React.useState(children);
  const morph = names("morph");

  React.useEffect(() => {
    if (children === shown) {
      return;
    }
    startTransition(() => {
      addTransitionType(morph);
      setShown(children);
    });
  }, [children, shown, morph]);

  const glide = { [morph]: tk("tk-morph", "tk-text"), default: "none" };
  const presence = {
    [morph]: tk("tk-morph", "tk-text", "tk-text-morph-char"),
    default: "none",
  };

  return (
    <span
      data-slot="text-morph"
      className={cn("inline-flex whitespace-pre", className)}
      {...props}
    >
      <span className="sr-only">{children}</span>
      <span aria-hidden className="inline-flex">
        {toChars(shown).map(({ char, key }) => (
          <ViewTransition
            key={key}
            default="none"
            update={glide}
            enter={presence}
            exit={presence}
          >
            <span data-slot="text-morph-char" className="inline-block">
              {char}
            </span>
          </ViewTransition>
        ))}
      </span>
    </span>
  );
};

export { TextMorph };
