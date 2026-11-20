"use client";

import { FileText, Folder, HardDrive } from "lucide-react";
import * as React from "react";

import { Breadcrumb } from "@/registry/ui/breadcrumb";
import { BACK, FORWARD, tk } from "@/registry/ui/ui-transition";

interface Node {
  name: string;
  children?: Node[];
}

const tree: Node = {
  children: [
    {
      children: [
        {
          children: [
            {
              children: [
                { name: "hero.png" },
                { name: "logo.svg" },
                { name: "og-image.jpg" },
              ],
              name: "images",
            },
            { name: "favicon.ico" },
          ],
          name: "public",
        },
        {
          children: [
            {
              children: [
                {
                  children: [{ name: "button.tsx" }, { name: "dialog.tsx" }],
                  name: "ui",
                },
                { name: "header.tsx" },
              ],
              name: "components",
            },
            { name: "main.tsx" },
          ],
          name: "src",
        },
        { name: "package.json" },
      ],
      name: "website",
    },
    { children: [{ name: "notes.md" }], name: "drafts" },
  ],
  name: "Projects",
};

const slide = {
  [BACK]: tk("tk-slide", "tk-back"),
  [FORWARD]: tk("tk-slide", "tk-forward"),
  default: "none",
};

export const BreadcrumbDemo = () => {
  const [path, setPath] = React.useState<string[]>(["website", "src"]);

  const trail: Node[] = [tree];
  for (const name of path) {
    const next = trail.at(-1)?.children?.find((child) => child.name === name);
    if (next) {
      trail.push(next);
    }
  }
  const folder = trail.at(-1) ?? tree;

  const open = (name: string) => {
    React.startTransition(() => {
      React.addTransitionType(FORWARD);
      setPath((current) => [...current, name]);
    });
  };

  return (
    <div className="bg-card text-card-foreground flex w-full max-w-md flex-col gap-3 overflow-hidden rounded-xl border p-4">
      <Breadcrumb
        maxItems={3}
        items={trail.map((node, index) => ({
          icon: index === 0 ? <HardDrive /> : undefined,
          id: ["root", ...path.slice(0, index)].join("/"),
          label: node.name,
        }))}
        onNavigate={(_, index) => setPath((current) => current.slice(0, index))}
      />
      <React.ViewTransition
        key={path.join("/")}
        default="none"
        enter={slide}
        exit={slide}
      >
        <ul className="grid min-h-40 content-start gap-1">
          {folder.children?.map((child) => (
            <li key={child.name}>
              {child.children ? (
                <button
                  type="button"
                  onClick={() => open(child.name)}
                  className="hover:bg-accent focus-visible:ring-ring/50 flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm outline-none focus-visible:ring-[3px]"
                >
                  <Folder
                    className="text-muted-foreground size-4"
                    aria-hidden
                  />
                  {child.name}
                  <span className="text-muted-foreground ms-auto text-xs tabular-nums">
                    {child.children.length}
                  </span>
                </button>
              ) : (
                <span className="text-muted-foreground flex items-center gap-2.5 px-2 py-1.5 text-sm">
                  <FileText className="size-4" aria-hidden />
                  {child.name}
                </span>
              )}
            </li>
          ))}
        </ul>
      </React.ViewTransition>
    </div>
  );
};
