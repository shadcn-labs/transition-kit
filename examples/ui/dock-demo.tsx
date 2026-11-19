"use client";

import { Home, Inbox, Search, User } from "lucide-react";
import * as React from "react";

import { Dock, DockItem } from "@/registry/ui/dock";
import { tk } from "@/registry/ui/ui-transition";

const screens = {
  home: {
    detail: "3 things need your attention today.",
    title: "Good morning",
  },
  inbox: { detail: "12 unread, 2 flagged as urgent.", title: "Inbox" },
  profile: { detail: "Signed in on 2 devices.", title: "Your profile" },
  search: { detail: "Search people, files and messages.", title: "Search" },
} as const;

type Screen = keyof typeof screens;

export const DockDemo = () => {
  const [screen, setScreen] = React.useState<Screen>("home");
  const { detail, title } = screens[screen];

  return (
    <div className="bg-card text-card-foreground relative flex h-64 w-full max-w-sm flex-col overflow-hidden rounded-xl border">
      <React.ViewTransition
        key={screen}
        default="none"
        enter={tk("tk-blur")}
        exit={tk("tk-blur")}
      >
        <div className="flex flex-1 flex-col gap-1 p-5">
          <p className="text-lg font-semibold tracking-tight">{title}</p>
          <p className="text-muted-foreground text-sm">{detail}</p>
        </div>
      </React.ViewTransition>
      <Dock
        aria-label="App sections"
        value={screen}
        onValueChange={(next) => setScreen(next as Screen)}
        className="absolute bottom-3 left-1/2 -translate-x-1/2"
      >
        <DockItem value="home" icon={<Home />} label="Home" />
        <DockItem value="search" icon={<Search />} label="Search" />
        <DockItem value="inbox" icon={<Inbox />} label="Inbox" />
        <DockItem value="profile" icon={<User />} label="Profile" />
      </Dock>
    </div>
  );
};
