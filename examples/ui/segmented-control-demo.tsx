"use client";

import { AlignCenter, AlignJustify, AlignLeft, AlignRight } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@/registry/ui/segmented-control";

const views = {
  day: { cells: 1, columns: "grid-cols-1", summary: "Wednesday, October 7" },
  month: { cells: 35, columns: "grid-cols-7", summary: "October 2026" },
  week: { cells: 7, columns: "grid-cols-7", summary: "October 5 – 11" },
  year: { cells: 12, columns: "grid-cols-6", summary: "2026" },
} as const;

type View = keyof typeof views;

const alignments = [
  { icon: <AlignLeft />, label: "Align left", value: "left" },
  { icon: <AlignCenter />, label: "Align center", value: "center" },
  { icon: <AlignRight />, label: "Align right", value: "right" },
  { icon: <AlignJustify />, label: "Justify", value: "justify" },
] as const;

const alignClasses: Record<string, string> = {
  center: "text-center",
  justify: "text-justify",
  left: "text-left",
  right: "text-right",
};

export const SegmentedControlDemo = () => {
  const [view, setView] = React.useState<View>("week");
  const [align, setAlign] = React.useState("left");
  const [saved, setSaved] = React.useState<string | null>(null);
  const { cells, columns, summary } = views[view];

  return (
    <form
      className="@container bg-card text-card-foreground w-full max-w-md space-y-4 rounded-xl border p-4"
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(
          Array.from(
            new FormData(event.currentTarget),
            ([key, value]) => `${key}=${String(value)}`
          ).join("&")
        );
      }}
    >
      <div className="flex flex-col gap-3 @sm:flex-row @sm:items-center @sm:justify-between">
        <div>
          <p className="text-sm font-semibold">Calendar</p>
          <p className="text-muted-foreground text-xs tabular-nums">
            {summary}
          </p>
        </div>
        <SegmentedControl
          name="view"
          aria-label="Calendar view"
          value={view}
          onValueChange={(next) => setView(next as View)}
          className="w-full @sm:w-fit"
        >
          <SegmentedControlItem value="day">Day</SegmentedControlItem>
          <SegmentedControlItem value="week">Week</SegmentedControlItem>
          <SegmentedControlItem value="month">Month</SegmentedControlItem>
          <SegmentedControlItem value="year">Year</SegmentedControlItem>
        </SegmentedControl>
      </div>

      <div
        aria-hidden
        className={`grid h-20 gap-1 ${columns} ${cells > 12 ? "grid-rows-5" : ""}`}
      >
        {Array.from({ length: cells }, (_, index) => (
          <div
            key={index}
            className={
              index === Math.min(2, cells - 1)
                ? "bg-primary/80 rounded-sm"
                : "bg-muted rounded-sm"
            }
          />
        ))}
      </div>

      <div className="flex items-start gap-3">
        <p
          className={`text-muted-foreground min-w-0 flex-1 text-xs leading-relaxed ${alignClasses[align]}`}
        >
          Weekly planning sync with design and engineering. Bring open questions
          about the launch checklist.
        </p>
        <SegmentedControl
          name="align"
          size="sm"
          aria-label="Text alignment"
          defaultValue="left"
          onValueChange={setAlign}
        >
          {alignments.map((item) => (
            <SegmentedControlItem
              key={item.value}
              value={item.value}
              icon={item.icon}
              aria-label={item.label}
              title={item.label}
            />
          ))}
        </SegmentedControl>
      </div>

      <div className="flex items-center justify-between gap-3 border-t pt-3">
        <output className="text-muted-foreground truncate font-mono text-xs">
          {saved ?? "Not saved yet"}
        </output>
        <Button type="submit" size="sm">
          Save
        </Button>
      </div>
    </form>
  );
};
