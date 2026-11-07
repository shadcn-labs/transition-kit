import { Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { items } from "@/registry/items";
import type { ItemGroup } from "@/registry/items";

const count = (group: ItemGroup) =>
  items.filter((item) => item.group === group && item.kind !== "core").length;

const GROUPS = [
  {
    description:
      "Light to dark with a reveal, wipe or ripple from wherever the user clicked.",
    group: "theme",
    label: "Theme",
    path: "components/theme-transition",
  },
  {
    description:
      "Route changes that slide, fold or flip, with forward and back built in.",
    group: "page",
    label: "Page",
    path: "components/page-transition",
  },
  {
    description:
      "Tabs, cards, lists and boards whose parts glide between states.",
    group: "ui",
    label: "UI",
    path: ROUTES.DOCS_COMPONENTS.slice(ROUTES.DOCS.length + 1),
  },
] as const;

export const HomeGroups = () => (
  <section className="container-wrapper pb-16 md:pb-24">
    <div className="container">
      <div className="grid divide-y border-y md:grid-cols-3 md:divide-x md:divide-y-0">
        {GROUPS.map(({ description, group, label, path }) => (
          <Link
            key={group}
            to="/docs/$"
            params={{ _splat: path }}
            viewTransition={{ types: ["nav-forward"] }}
            className="group hover:bg-muted/40 focus-visible:ring-ring/50 flex flex-col gap-3 p-6 transition-colors outline-none focus-visible:ring-[3px] md:p-8"
          >
            <span className="font-mono text-4xl font-medium tracking-tighter tabular-nums">
              {count(group)}
            </span>
            <span className="flex items-center gap-1.5 text-sm font-medium">
              {label} transitions
              <ArrowRightIcon
                className="text-muted-foreground size-3.5 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </span>
            <span className="text-muted-foreground text-sm leading-relaxed">
              {description}
            </span>
          </Link>
        ))}
      </div>
    </div>
  </section>
);
