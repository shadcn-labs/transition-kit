import { GitPullRequest } from "lucide-react";

import {
  LayoutSwitcher,
  LayoutSwitcherItem,
  LayoutSwitcherItemContent,
  LayoutSwitcherItemDescription,
  LayoutSwitcherItemMedia,
  LayoutSwitcherItemMeta,
  LayoutSwitcherItems,
  LayoutSwitcherItemTitle,
  LayoutSwitcherToggle,
} from "@/registry/ui/layout-switcher";

const members = [
  {
    gradient: "from-neutral-400 to-neutral-300",
    id: "ava",
    name: "Ava Chen",
    pulls: 42,
    role: "Design Engineer",
  },
  {
    gradient: "from-neutral-400 to-neutral-400",
    id: "marcus",
    name: "Marcus Reid",
    pulls: 87,
    role: "Staff Engineer",
  },
  {
    gradient: "from-neutral-400 to-neutral-300",
    id: "priya",
    name: "Priya Patel",
    pulls: 23,
    role: "Product Designer",
  },
  {
    gradient: "from-neutral-400 to-neutral-300",
    id: "diego",
    name: "Diego Alvarez",
    pulls: 64,
    role: "Frontend Engineer",
  },
];

export const LayoutSwitcherDemo = () => (
  // A fixed height keeps the toggle still while the list grows below it.
  <LayoutSwitcher className="h-[19rem] w-full max-w-xl">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">Team</p>
        <p className="text-muted-foreground text-xs">
          {members.length} members
        </p>
      </div>
      <LayoutSwitcherToggle />
    </div>
    <LayoutSwitcherItems aria-label="Team members" className="@lg:grid-cols-4">
      {members.map((member) => (
        <LayoutSwitcherItem key={member.id} value={member.id}>
          <LayoutSwitcherItemMedia>
            <span
              aria-hidden
              className={`flex items-center justify-center bg-linear-to-br text-xs font-semibold text-white ${member.gradient}`}
            >
              {member.name
                .split(" ")
                .map((part) => part[0])
                .join("")}
            </span>
          </LayoutSwitcherItemMedia>
          <LayoutSwitcherItemContent>
            <LayoutSwitcherItemTitle>{member.name}</LayoutSwitcherItemTitle>
            <LayoutSwitcherItemDescription>
              {member.role}
            </LayoutSwitcherItemDescription>
          </LayoutSwitcherItemContent>
          <LayoutSwitcherItemMeta>
            <GitPullRequest aria-hidden />
            {member.pulls} merged
          </LayoutSwitcherItemMeta>
        </LayoutSwitcherItem>
      ))}
    </LayoutSwitcherItems>
  </LayoutSwitcher>
);
