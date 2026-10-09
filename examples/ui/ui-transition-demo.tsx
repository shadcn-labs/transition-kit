"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import {
  addTransitionType,
  startTransition,
  useState,
  ViewTransition,
} from "react";

import { Button } from "@/components/ui/button";
import { BACK, FORWARD, tk } from "@/registry/ui/ui-transition";

const notes = [
  {
    body: "Wrap a part in <ViewTransition> and pick its triggers: update, enter, exit or share.",
    details:
      'Only the triggers you list animate. default="none" keeps everything else still.',
    title: "Boundaries",
  },
  {
    body: "Compose tk-* classes with tk(): tk-morph moves and resizes, tk-slide slides, tk-pop pops.",
    details:
      "tk() always adds the tk-ui base class, which the core uses for reduced motion.",
    title: "Classes",
  },
  {
    body: "addTransitionType(FORWARD) or BACK inside startTransition picks the direction.",
    details:
      "Exiting content keeps its old props, so direction comes from the transition type, not from state.",
    title: "Direction",
  },
];

const slide = {
  [BACK]: tk("tk-slide", "tk-back"),
  [FORWARD]: tk("tk-slide", "tk-forward"),
  default: "none",
};

export const UiTransitionDemo = () => {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const note = notes[index];

  const go = (step: 1 | -1) =>
    startTransition(() => {
      addTransitionType(step === 1 ? FORWARD : BACK);
      setIndex((current) => (current + step + notes.length) % notes.length);
    });

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-4">
      {/* The card resizes as its content changes: morph its box. */}
      <ViewTransition
        default="none"
        update={tk("tk-morph", "tk-spring", "tk-clip")}
      >
        <div className="bg-card w-full overflow-hidden rounded-xl border p-5 shadow-sm">
          {/* A new note per index: the old one exits and the new one enters. */}
          <ViewTransition
            key={index}
            default="none"
            enter={slide}
            exit={slide}
            update={tk("tk-morph", "tk-text")}
          >
            <div className="flex flex-col gap-2">
              <p className="text-muted-foreground font-mono text-xs">
                {index + 1} / {notes.length}
              </p>
              <h3 className="font-semibold">{note.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {note.body}
              </p>
              {open && (
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {note.details}
                </p>
              )}
            </div>
          </ViewTransition>
        </div>
      </ViewTransition>
      {/* The controls move down as the card grows: morph them too. */}
      <ViewTransition default="none" update={tk("tk-morph")}>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Previous note"
            onClick={() => go(-1)}
          >
            <ChevronLeftIcon aria-hidden />
          </Button>
          <Button
            type="button"
            variant="outline"
            aria-expanded={open}
            onClick={() => startTransition(() => setOpen((value) => !value))}
          >
            {open ? "Less" : "More"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Next note"
            onClick={() => go(1)}
          >
            <ChevronRightIcon aria-hidden />
          </Button>
        </div>
      </ViewTransition>
    </div>
  );
};
