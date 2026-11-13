"use client";

import { Link } from "@tanstack/react-router";

import { ROUTES } from "@/constants/routes";
import { useFeedback } from "@/hooks/use-feedback";
import { cn } from "@/lib/utils";
export const MainNav = ({
  items,
  className,
  ...props
}: React.ComponentProps<"nav"> & {
  items: { href: string; label: string }[];
}) => {
  const playClick = useFeedback({ sound: "click" });

  return (
    <nav className={cn("items-stretch", className)} {...props}>
      {items.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          onClick={playClick}
          viewTransition={{ types: ["nav-forward"] }}
          // /docs must not match its children.
          activeOptions={{ exact: item.href === ROUTES.DOCS }}
          className="text-muted-foreground hover:bg-muted/50 hover:text-foreground aria-[current=page]:text-foreground focus-visible:ring-ring/50 flex items-center border-r px-4 text-sm transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-inset"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
};
