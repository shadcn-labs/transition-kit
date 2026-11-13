import { Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";

import { getItem, items } from "@/registry/items";

const announced =
  items.find((item) => item.isNew && item.kind === "style") ??
  getItem("theme/clock-wipe");
export const HeroBadge = () =>
  announced ? (
    <Link
      to="/docs/$"
      params={{ _splat: `components/${announced.name}` }}
      viewTransition={{ types: ["nav-forward"] }}
      className="group bg-background/60 hover:bg-muted/50 focus-visible:ring-ring/50 inline-flex items-center gap-2.5 rounded-full border p-1 pr-3 text-sm backdrop-blur transition-colors outline-none focus-visible:ring-[3px]"
    >
      <span className="bg-brand-gradient text-brand-foreground rounded-full px-2 py-0.5 text-xs font-semibold [text-shadow:0_1px_1px_rgb(0_0_0/0.25)]">
        New
      </span>
      <span className="text-muted-foreground group-hover:text-foreground transition-colors">
        {announced.title} {announced.group} transition
      </span>
      <ArrowRightIcon
        aria-hidden="true"
        className="text-muted-foreground size-3.5 transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  ) : null;
