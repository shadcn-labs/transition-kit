"use client";

import {
  CheckIcon,
  CopyIcon,
  MessageSquareIcon,
  Share2Icon,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MorphingPopover,
  MorphingPopoverClose,
  MorphingPopoverContent,
  MorphingPopoverTitle,
  MorphingPopoverTrigger,
  useMorphingPopover,
} from "@/registry/ui/morphing-popover";

const SendFeedback = () => {
  const { setOpen } = useMorphingPopover();
  return (
    <Button type="submit" size="sm" onClick={() => setOpen(false)}>
      Send
    </Button>
  );
};

const CopyLink = () => {
  const [copied, setCopied] = React.useState(false);
  return (
    <Button
      type="button"
      size="icon"
      variant="outline"
      aria-label={copied ? "Copied" : "Copy link"}
      onClick={() => {
        void navigator.clipboard?.writeText("https://acme.dev/q3-roadmap");
        setCopied(true);
      }}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </Button>
  );
};

export const MorphingPopoverDemo = () => (
  // Fixed-height stage: the panels open over it, the page never moves.
  <div className="flex h-64 w-full max-w-md items-start justify-between gap-3">
    <MorphingPopover>
      <MorphingPopoverTrigger>
        <MessageSquareIcon />
        Feedback
      </MorphingPopoverTrigger>
      <MorphingPopoverContent>
        <MorphingPopoverTitle>
          <MessageSquareIcon />
          Feedback
        </MorphingPopoverTitle>
        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => event.preventDefault()}
        >
          <textarea
            aria-label="Your feedback"
            placeholder="What could be better?"
            rows={4}
            className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
          />
          <div className="flex justify-end gap-2">
            <MorphingPopoverClose className="hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring/50 inline-flex h-8 cursor-pointer items-center rounded-md px-3 text-sm font-medium outline-none focus-visible:ring-[3px]">
              Cancel
            </MorphingPopoverClose>
            <SendFeedback />
          </div>
        </form>
      </MorphingPopoverContent>
    </MorphingPopover>

    <MorphingPopover>
      <MorphingPopoverTrigger>
        <Share2Icon />
        Share
      </MorphingPopoverTrigger>
      <MorphingPopoverContent align="end">
        <MorphingPopoverTitle>
          <Share2Icon />
          Share
        </MorphingPopoverTitle>
        <p className="text-muted-foreground text-xs">
          Anyone with the link can view the Q3 roadmap.
        </p>
        <div className="flex gap-2">
          <Input
            aria-label="Link"
            readOnly
            value="https://acme.dev/q3-roadmap"
            className="h-9 text-xs"
          />
          <CopyLink />
        </div>
      </MorphingPopoverContent>
    </MorphingPopover>
  </div>
);
