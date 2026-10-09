"use client";

import { Minus, Plus, Shuffle } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NumberFlip } from "@/registry/ui/number-flip";

const formats = {
  compact: {
    compactDisplay: "short",
    currency: "USD",
    maximumFractionDigits: 1,
    notation: "compact",
    style: "currency",
  },
  currency: { currency: "USD", style: "currency" },
} satisfies Record<string, Intl.NumberFormatOptions>;

type FormatName = keyof typeof formats;

const round = (value: number) => Math.max(0, Math.round(value * 100) / 100);

export const NumberFlipDemo = () => {
  const [revenue, setRevenue] = React.useState(48_219.5);
  const [customers, setCustomers] = React.useState(1287);
  const [mode, setMode] = React.useState<FormatName>("currency");

  const change = (delta: number) => {
    setRevenue((value) => round(value + delta));
    setCustomers((value) => Math.max(0, value + Math.sign(delta)));
  };

  return (
    <div className="@container w-full max-w-sm">
      <div className="bg-card text-card-foreground rounded-xl border p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="text-muted-foreground text-sm">Monthly revenue</p>
          <div
            role="radiogroup"
            aria-label="Number format"
            className="bg-muted inline-flex h-7 rounded-md p-0.5 text-xs"
          >
            {(Object.keys(formats) as FormatName[]).map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={mode === option}
                onClick={() => setMode(option)}
                className={cn(
                  "text-muted-foreground cursor-pointer rounded-[5px] px-2 font-medium capitalize outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  mode === option && "bg-background text-foreground shadow-sm"
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <NumberFlip
          value={revenue}
          format={formats[mode]}
          stagger
          className="mt-3 text-4xl font-semibold tracking-tight @sm:text-5xl"
        />
        <p className="text-muted-foreground mt-2 text-sm">
          <NumberFlip
            value={customers}
            className="text-foreground font-medium"
          />{" "}
          paying customers
        </p>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Button variant="outline" size="sm" onClick={() => change(-249.99)}>
          <Minus />
          249.99
        </Button>
        <Button variant="outline" size="sm" onClick={() => change(1250)}>
          <Plus />
          1,250
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setRevenue(round(5000 + Math.random() * 995_000));
            setCustomers(Math.round(100 + Math.random() * 9900));
          }}
        >
          <Shuffle />
          Random
        </Button>
      </div>
    </div>
  );
};
