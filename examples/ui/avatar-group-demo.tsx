"use client";

import * as React from "react";

import { AvatarGroup } from "@/registry/ui/avatar-group";

const team = [
  { name: "Ada Lovelace" },
  { name: "Grace Hopper" },
  { name: "Alan Turing" },
  { name: "Katherine Johnson" },
  { name: "Linus Torvalds" },
  { name: "Margaret Hamilton" },
  { name: "Dennis Ritchie" },
  { name: "Barbara Liskov" },
];

export const AvatarGroupDemo = () => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className="bg-card text-card-foreground flex w-full max-w-sm flex-col gap-4 rounded-xl border p-4">
      <div>
        <p className="text-sm font-semibold">Launch review</p>
        <p className="text-muted-foreground text-xs">
          {expanded
            ? `All ${team.length} reviewers`
            : "Tap the count to see everyone"}
        </p>
      </div>
      <AvatarGroup
        aria-label="Reviewers"
        items={team}
        max={4}
        expanded={expanded}
        onExpandedChange={setExpanded}
      />
    </div>
  );
};
