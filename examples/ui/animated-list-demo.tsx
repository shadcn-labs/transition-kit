"use client";

import {
  ArrowDownWideNarrow,
  Bug,
  CreditCard,
  GitPullRequest,
  MessageSquare,
  Plus,
  Rocket,
  Shuffle,
  UserPlus,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  AnimatedList,
  AnimatedListItem,
  useAnimatedList,
} from "@/registry/ui/animated-list";

interface Notification {
  id: number;
  icon: LucideIcon;
  tone: string;
  title: string;
  detail: string;
  /** Minutes ago. */
  age: number;
}

const templates: Omit<Notification, "id" | "age">[] = [
  {
    detail: "feat: keyboard shortcuts for the editor",
    icon: GitPullRequest,
    title: "Maya opened a pull request",
    tone: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  },
  {
    detail: "Production is live at v2.14.0",
    icon: Rocket,
    title: "Deploy finished",
    tone: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  {
    detail: "“Can we ship this behind a flag?”",
    icon: MessageSquare,
    title: "Jonas replied in #design",
    tone: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  },
  {
    detail: "TypeError in checkout/summary.tsx",
    icon: Bug,
    title: "New issue in production",
    tone: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  },
  {
    detail: "Invoice #1042 for $240.00",
    icon: CreditCard,
    title: "Payment received",
    tone: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  {
    detail: "Priya joined the Acme workspace",
    icon: UserPlus,
    title: "New team member",
    tone: "bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400",
  },
];

const seed: Notification[] = [3, 12, 26, 48, 95, 180].map((age, index) => ({
  ...templates[index],
  age,
  id: index + 1,
}));

const formatAge = (age: number) => {
  if (age === 0) {
    return "now";
  }
  return age < 60 ? `${age}m` : `${Math.floor(age / 60)}h`;
};

export const AnimatedListDemo = () => {
  const { items, remove, set, sort } = useAnimatedList(seed);
  const nextId = React.useRef(seed.length + 1);
  const [announcement, setAnnouncement] = React.useState("");

  const addNotification = () => {
    const id = nextId.current;
    nextId.current += 1;
    // New notifications are "now"; everything else gets a minute older.
    set((previous) => [
      { ...templates[id % templates.length], age: 0, id },
      ...previous.map((item) => ({ ...item, age: item.age + 1 })),
    ]);
    setAnnouncement(
      `New notification: ${templates[id % templates.length].title}`
    );
  };

  const shuffle = () => {
    set((previous) => {
      const next = [...previous];
      for (let index = next.length - 1; index > 0; index -= 1) {
        const swap = Math.floor(Math.random() * (index + 1));
        [next[index], next[swap]] = [next[swap], next[index]];
      }
      return next;
    });
    setAnnouncement("Notifications shuffled");
  };

  const sortByTime = () => {
    sort((a, b) => a.age - b.age);
    setAnnouncement("Notifications sorted, newest first");
  };

  return (
    <div className="@container flex w-full max-w-md flex-col gap-3">
      <div className="flex items-center gap-2">
        <p className="mr-auto text-sm font-medium">
          Inbox{" "}
          <span className="text-muted-foreground tabular-nums">
            {items.length}
          </span>
        </p>
        <Button size="sm" variant="outline" onClick={shuffle}>
          <Shuffle />
          <span className="sr-only @sm:not-sr-only">Shuffle</span>
        </Button>
        <Button size="sm" variant="outline" onClick={sortByTime}>
          <ArrowDownWideNarrow />
          <span className="sr-only @sm:not-sr-only">Sort</span>
        </Button>
        <Button size="sm" onClick={addNotification}>
          <Plus />
          Add
        </Button>
      </div>
      <div className="relative">
        <AnimatedList
          aria-label="Notifications"
          className="bg-muted/40 h-72 overflow-y-auto overscroll-contain rounded-xl border p-2"
        >
          {items.map((item) => (
            <AnimatedListItem key={item.id} id={item.id} className="pr-1.5">
              <span
                className={`grid size-8 shrink-0 place-items-center rounded-md ${item.tone}`}
              >
                <item.icon aria-hidden className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{item.title}</span>
                <span className="text-muted-foreground block truncate text-xs">
                  {item.detail}
                </span>
              </span>
              <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                {formatAge(item.age)}
              </span>
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label={`Dismiss: ${item.title}`}
                className="text-muted-foreground size-7"
                onClick={() => {
                  remove(item.id);
                  setAnnouncement(`Dismissed: ${item.title}`);
                }}
              >
                <X />
              </Button>
            </AnimatedListItem>
          ))}
        </AnimatedList>
        {items.length === 0 ? (
          <p className="text-muted-foreground pointer-events-none absolute inset-0 grid place-items-center text-sm">
            You&apos;re all caught up.
          </p>
        ) : null}
      </div>
      <p role="status" className="sr-only">
        {announcement}
      </p>
    </div>
  );
};
