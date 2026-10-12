"use client";

import { Link, useLocation } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const MainNav = ({
  items,
  className,
  ...props
}: React.ComponentProps<"nav"> & {
  items: { href: string; label: string }[];
}) => {
  const pathname = useLocation({ select: (location) => location.pathname });

  return (
    <nav className={cn("items-center gap-0.5", className)} {...props}>
      {items.map((item) => (
        <Button key={item.href} variant="ghost" asChild size="sm" sound="click">
          <Link
            to={item.href}
            viewTransition={{ types: ["nav-forward"] }}
            className={cn(pathname === item.href && "text-primary")}
          >
            {item.label}
          </Link>
        </Button>
      ))}
    </nav>
  );
};
