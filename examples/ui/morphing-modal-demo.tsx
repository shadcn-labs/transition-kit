"use client";

import { ChevronLeft, Link2, Mail, UserPlus } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  MorphingModal,
  MorphingModalContent,
  MorphingModalDescription,
  MorphingModalTitle,
  MorphingModalTrigger,
  MorphingModalView,
} from "@/registry/ui/morphing-modal";
import { BACK, FORWARD } from "@/registry/ui/ui-transition";

type View = "menu" | "invite" | "link" | "email";

const actions = [
  {
    description: "Add teammates by name",
    icon: <UserPlus />,
    label: "Invite people",
    view: "invite",
  },
  {
    description: "Anyone with it can view",
    icon: <Link2 />,
    label: "Copy link",
    view: "link",
  },
  {
    description: "Send a read-only copy",
    icon: <Mail />,
    label: "Email a copy",
    view: "email",
  },
] as const;

const people = [
  "Ada Lovelace",
  "Grace Hopper",
  "Alan Turing",
  "Katherine Johnson",
];

export const MorphingModalDemo = () => {
  const [open, setOpen] = React.useState(false);
  const [view, setView] = React.useState<View>("menu");

  const go = (next: View) => {
    React.startTransition(() => {
      React.addTransitionType(next === "menu" ? BACK : FORWARD);
      setView(next);
    });
  };

  const back = (
    <button
      type="button"
      onClick={() => go("menu")}
      className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 -ms-1 flex w-fit cursor-pointer items-center gap-1 rounded-sm text-sm outline-none focus-visible:ring-[3px] [&_svg]:size-4"
    >
      <ChevronLeft aria-hidden />
      Back
    </button>
  );

  return (
    <MorphingModal
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setView("menu");
        }
      }}
    >
      <MorphingModalTrigger className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring/50 h-9 cursor-pointer rounded-md px-4 text-sm font-medium outline-none transition-colors focus-visible:ring-[3px]">
        Share project
      </MorphingModalTrigger>
      <MorphingModalContent aria-label="Share project">
        {view === "menu" ? (
          <MorphingModalView id="menu">
            <div className="grid gap-1.5">
              <MorphingModalTitle>Share project</MorphingModalTitle>
              <MorphingModalDescription>
                Choose how you want to share “Launch plan”.
              </MorphingModalDescription>
            </div>
            <div className="grid gap-1">
              {actions.map((action) => (
                <button
                  key={action.view}
                  type="button"
                  onClick={() => go(action.view)}
                  className="hover:bg-accent focus-visible:ring-ring/50 flex cursor-pointer items-center gap-3 rounded-lg p-2.5 text-left outline-none focus-visible:ring-[3px] [&_svg]:size-4"
                >
                  <span className="bg-muted flex size-9 items-center justify-center rounded-md">
                    {action.icon}
                  </span>
                  <span className="grid">
                    <span className="text-sm font-medium">{action.label}</span>
                    <span className="text-muted-foreground text-xs">
                      {action.description}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </MorphingModalView>
        ) : null}
        {view === "invite" ? (
          <MorphingModalView id="invite">
            {back}
            <MorphingModalTitle>Invite people</MorphingModalTitle>
            <ul className="grid gap-2">
              {people.map((person) => (
                <li
                  key={person}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  {person}
                  <Button size="sm" variant="outline">
                    Invite
                  </Button>
                </li>
              ))}
            </ul>
          </MorphingModalView>
        ) : null}
        {view === "link" ? (
          <MorphingModalView id="link">
            {back}
            <MorphingModalTitle>Copy link</MorphingModalTitle>
            <div className="bg-muted text-muted-foreground truncate rounded-md px-3 py-2 font-mono text-xs">
              https://example.com/p/launch-plan
            </div>
          </MorphingModalView>
        ) : null}
        {view === "email" ? (
          <MorphingModalView id="email">
            {back}
            <MorphingModalTitle>Email a copy</MorphingModalTitle>
            <MorphingModalDescription>
              Recipients get a read-only PDF of the current version.
            </MorphingModalDescription>
            <input
              type="email"
              placeholder="name@company.com"
              aria-label="Recipient email"
              className="border-input focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px]"
            />
            <Button className="w-full">Send copy</Button>
          </MorphingModalView>
        ) : null}
      </MorphingModalContent>
    </MorphingModal>
  );
};
