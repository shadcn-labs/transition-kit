"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { TextMorph } from "@/registry/ui/text-morph";

const words = ["transition", "transform", "translate", "station", "motion"];

export const TextMorphDemo = () => {
  const [index, setIndex] = React.useState(0);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) {
      return;
    }
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <div className="flex flex-col items-center gap-6">
      <TextMorph className="text-4xl font-semibold tracking-tight">
        {words[index]}
      </TextMorph>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setIndex((value) => (value + 1) % words.length)}
        >
          Next word
        </Button>
        <Button className="min-w-24" onClick={() => setCopied(true)}>
          <TextMorph>{copied ? "Copied!" : "Copy link"}</TextMorph>
        </Button>
      </div>
    </div>
  );
};
