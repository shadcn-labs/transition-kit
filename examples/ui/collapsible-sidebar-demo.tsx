"use client";

import {
  ChartBarIcon,
  HouseIcon,
  InboxIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";

import {
  CollapsibleSidebar,
  CollapsibleSidebarInset,
  CollapsibleSidebarItem,
  CollapsibleSidebarProvider,
  CollapsibleSidebarTrigger,
  useCollapsibleSidebar,
} from "@/registry/ui/collapsible-sidebar";

const links = [
  { icon: <HouseIcon />, label: "Home", value: "home" },
  { icon: <InboxIcon />, label: "Inbox", value: "inbox" },
  { icon: <ChartBarIcon />, label: "Analytics", value: "analytics" },
  { icon: <UsersIcon />, label: "Team", value: "team" },
  { icon: <SettingsIcon />, label: "Settings", value: "settings" },
];

const Content = () => {
  const { value } = useCollapsibleSidebar();
  const link = links.find((item) => item.value === value);

  return (
    <CollapsibleSidebarInset className="flex flex-col gap-3 rounded-xl border p-4">
      <p className="text-sm font-semibold">{link?.label}</p>
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4].map((card) => (
          <div key={card} className="bg-muted/60 h-16 rounded-lg" />
        ))}
      </div>
      <div className="bg-muted/60 h-20 rounded-lg" />
    </CollapsibleSidebarInset>
  );
};

export const CollapsibleSidebarDemo = () => (
  <CollapsibleSidebarProvider
    defaultValue="home"
    className="h-72 w-full max-w-xl"
  >
    <CollapsibleSidebar aria-label="Main">
      <CollapsibleSidebarTrigger className="mb-1" />
      {links.map((link) => (
        <CollapsibleSidebarItem
          key={link.value}
          value={link.value}
          icon={link.icon}
        >
          {link.label}
        </CollapsibleSidebarItem>
      ))}
    </CollapsibleSidebar>
    <Content />
  </CollapsibleSidebarProvider>
);
