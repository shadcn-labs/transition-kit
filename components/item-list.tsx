"use client";

import { Link } from "@tanstack/react-router";

import { ROUTES } from "@/constants/routes";
import { items } from "@/registry/items";

/** Flat alphabetical link grid mirroring the sidebar: UI components plus the two hub pages. */
export const ItemList = () => {
  const entries = [
    ...items
      .filter((item) => item.group === "ui" && item.kind === "component")
      .map((item) => ({
        title: item.title,
        url: `${ROUTES.DOCS_COMPONENTS}/${item.name.slice("ui/".length)}`,
      })),
    { title: "Page Transition", url: ROUTES.DOCS_PAGE },
    { title: "Theme Transition", url: ROUTES.DOCS_THEME },
  ].toSorted((a, b) => a.title.localeCompare(b.title));

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-x-8 lg:gap-x-16 lg:gap-y-6 xl:gap-x-20">
      {entries.map((entry) => (
        <Link
          key={entry.url}
          to={entry.url}
          viewTransition={{ types: ["nav-forward"] }}
          className="inline-flex items-center gap-2 text-lg font-medium underline-offset-4 hover:underline md:text-base"
        >
          {entry.title}
        </Link>
      ))}
    </div>
  );
};
