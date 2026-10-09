"use client";

import { Link } from "@tanstack/react-router";
import {
  ArrowUpRightIcon,
  CodeXmlIcon,
  EyeIcon,
  FileIcon,
  LoaderCircleIcon,
} from "lucide-react";
import { lazy, Suspense, useState } from "react";
import type { ComponentType, LazyExoticComponent } from "react";

import { CodeBlockCommand } from "@/components/code-block-command";
import { CopyButton } from "@/components/copy-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";
import { PageTransitionDemo } from "@/examples/page/page-transition-demo";
import { ThemeTransitionDemo } from "@/examples/theme/theme-transition-demo";
import { PACKAGE_RUNNERS } from "@/hooks/use-package-manager";
import { cn } from "@/lib/utils";
import { items } from "@/registry/items";
import type { ItemGroup, ItemSource } from "@/registry/items";

/** Highlighted style CSS and UI component TSX keyed by item name, e.g. `theme/circle-reveal`. */
export type ShowcaseSources = Record<
  string,
  { code: string; highlightedCode: string }
>;

type WorkspaceTab = "preview" | "code";

const GROUPS: { id: ItemGroup; label: string; entries: string }[] = [
  { entries: "Styles", id: "theme", label: "Theme" },
  { entries: "Styles", id: "page", label: "Page" },
  { entries: "Components", id: "ui", label: "UI" },
];

/** What the sidebar lists: theme and page styles, UI components. */
const entriesByGroup: Record<ItemGroup, ItemSource[]> = {
  page: items.filter((item) => item.group === "page" && item.kind === "style"),
  theme: items.filter(
    (item) => item.group === "theme" && item.kind === "style"
  ),
  ui: items.filter((item) => item.group === "ui" && item.kind === "component"),
};

const coreByGroup: Record<ItemGroup, ItemSource | undefined> = {
  page: items.find((item) => item.group === "page" && item.kind === "core"),
  theme: items.find((item) => item.group === "theme" && item.kind === "core"),
  ui: items.find((item) => item.group === "ui" && item.kind === "core"),
};

const uiDemoModules = import.meta.glob<Record<string, ComponentType>>(
  "/examples/ui/*-demo.tsx"
);

/**
 * UI demos keyed by item name, loaded when first shown:
 * `/examples/ui/number-flip-demo.tsx` exports `NumberFlipDemo` for `ui/number-flip`.
 */
const uiDemos: Record<
  string,
  LazyExoticComponent<ComponentType>
> = Object.fromEntries(
  Object.entries(uiDemoModules).map(([path, load]) => {
    const slug = path.slice("/examples/ui/".length, -"-demo.tsx".length);
    const exportName = `${slug
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("")}Demo`;
    return [
      `ui/${slug}`,
      lazy(async () => {
        const demos = await load();
        const demo = demos[exportName];
        if (!demo) {
          throw new Error(`${path} does not export ${exportName}`);
        }
        return { default: demo };
      }),
    ];
  })
);

const CodeViewer = ({
  source,
}: {
  source: ShowcaseSources[string] | undefined;
}) => (
  <div className="relative h-140 overflow-hidden bg-code text-code-foreground lg:h-full">
    {source ? (
      <figure
        data-rehype-pretty-code-figure=""
        className="no-scrollbar mt-0! h-full overflow-auto rounded-none"
      >
        <CopyButton value={source.code} className="right-4" />
        <div dangerouslySetInnerHTML={{ __html: source.highlightedCode }} />
      </figure>
    ) : (
      <div
        className="flex h-full items-center justify-center px-6 text-center text-sm text-code-foreground/60"
        role="status"
      >
        Source not available yet.
      </div>
    )}
  </div>
);

export const HomeShowcase = ({ sources }: { sources: ShowcaseSources }) => {
  const [group, setGroup] = useState<ItemGroup>("theme");
  const [selectedByGroup, setSelectedByGroup] = useState<
    Record<ItemGroup, string>
  >({
    page: entriesByGroup.page[0]?.name ?? "",
    theme: "theme/circle-reveal",
    ui: "ui/tabs",
  });
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>("preview");
  const [detailName, setDetailName] = useState<string | null>(null);

  const groupInfo = GROUPS.find((item) => item.id === group) ?? GROUPS[0];
  const entries = entriesByGroup[group];
  const selectedEntry =
    entries.find((item) => item.name === selectedByGroup[group]) ?? entries[0];
  const usedItems = [coreByGroup[group], selectedEntry].filter(
    (item): item is ItemSource => item !== undefined
  );
  const detail =
    usedItems.find((item) => item.name === detailName) ?? selectedEntry;

  if (!selectedEntry || !detail) {
    return null;
  }

  // `theme/circle-reveal` -> `circle-reveal`
  const slug = selectedEntry.name.slice(selectedEntry.group.length + 1);
  const fileName =
    group === "ui"
      ? `components/transitions/${slug}.tsx`
      : `styles/${slug}.css`;
  const UiDemo = uiDemos[selectedEntry.name];
  const registryItem = `@transition-kit/${detail.name}`;

  const handleEntryChange = (name: string) => {
    setSelectedByGroup((current) => ({ ...current, [group]: name }));
    setDetailName(null);
  };

  const handleGroupChange = (next: ItemGroup) => {
    setGroup(next);
    setDetailName(null);
  };

  return (
    <section className="container-wrapper pb-12 md:pb-16 lg:pb-24">
      <div className="container">
        <Card className="gap-0 overflow-hidden py-0">
          <CardHeader className="block px-0">
            <div className="grid min-h-12 grid-cols-[1fr_minmax(0,auto)_1fr] items-center gap-2 px-3 lg:gap-3 lg:px-4">
              <div
                className="col-start-1 row-start-1 hidden justify-self-start gap-1.5 lg:flex"
                aria-hidden="true"
              >
                <span className="size-2.5 rounded-full bg-red-400" />
                <span className="size-2.5 rounded-full bg-amber-400" />
                <span className="size-2.5 rounded-full bg-emerald-400" />
              </div>
              <h2
                className="col-start-2 row-start-1 flex min-w-0 max-w-[70vw] items-center justify-self-center gap-2 px-2 text-sm font-medium text-muted-foreground lg:max-w-full"
                title={fileName}
              >
                <FileIcon className="size-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{fileName}</span>
              </h2>

              <div
                className="col-start-3 row-start-1 hidden justify-self-end rounded-lg bg-muted p-0.5 lg:flex"
                role="group"
                aria-label="Transition group"
              >
                {GROUPS.map((item) => (
                  <Toggle
                    key={item.id}
                    size="sm"
                    pressed={group === item.id}
                    onPressedChange={() => handleGroupChange(item.id)}
                    className="h-7 border border-transparent px-2.5 text-xs data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm data-[state=on]:hover:bg-background data-[state=on]:hover:text-foreground dark:data-[state=on]:border-input dark:data-[state=on]:bg-input/30 dark:data-[state=on]:hover:bg-input/30"
                  >
                    {item.label}
                  </Toggle>
                ))}
              </div>
            </div>

            <Separator className="lg:hidden" />

            <div className="flex h-12 items-center justify-between gap-3 px-3 lg:hidden">
              <label
                htmlFor="home-showcase-group"
                className="text-sm font-medium text-muted-foreground"
              >
                Choose group
              </label>
              <NativeSelect
                id="home-showcase-group"
                size="sm"
                value={group}
                onChange={(event) =>
                  handleGroupChange(event.target.value as ItemGroup)
                }
                className="w-40 sm:w-48"
              >
                {GROUPS.map((item) => (
                  <NativeSelectOption key={item.id} value={item.id}>
                    {item.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="p-0 lg:grid lg:h-180 lg:grid-cols-[14rem_minmax(0,1fr)_20rem]">
            <aside
              aria-label={`${groupInfo.label} ${groupInfo.entries.toLowerCase()}`}
              className="hidden min-h-0 flex-col bg-card lg:flex lg:border-r"
            >
              <div className="flex h-12 shrink-0 items-center justify-between gap-3 px-4">
                <CardTitle className="text-sm">{groupInfo.entries}</CardTitle>
                <Badge
                  variant="outline"
                  className="font-mono text-muted-foreground"
                >
                  {entries.length}
                </Badge>
              </div>
              <Separator />

              <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-2">
                {entries.map((item) => {
                  const isSelected = item.name === selectedEntry.name;

                  return (
                    <Button
                      key={item.name}
                      type="button"
                      variant="ghost"
                      size="sm"
                      sound="click"
                      aria-pressed={isSelected}
                      className={cn(
                        "h-9 shrink-0 justify-start border px-2 text-left",
                        isSelected
                          ? "border-border bg-muted text-foreground hover:bg-muted hover:text-foreground dark:hover:bg-muted"
                          : "border-transparent text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                      )}
                      onClick={() => handleEntryChange(item.name)}
                    >
                      <span className="truncate">{item.title}</span>
                      {item.isNew ? (
                        <span
                          className="ml-auto size-2 shrink-0 rounded-full bg-blue-500"
                          title="New"
                        />
                      ) : null}
                    </Button>
                  );
                })}
              </div>
            </aside>

            <Tabs
              value={workspaceTab}
              onValueChange={(value) => setWorkspaceTab(value as WorkspaceTab)}
              className="min-w-0 gap-0 lg:h-full lg:min-h-0"
            >
              <div className="flex h-12 shrink-0 items-center justify-between gap-3 bg-card px-3 lg:hidden">
                <label
                  htmlFor="home-showcase-entry"
                  className="text-sm font-medium text-muted-foreground"
                >
                  {group === "ui" ? "Choose component" : "Choose style"}
                </label>
                <NativeSelect
                  id="home-showcase-entry"
                  size="sm"
                  value={selectedEntry.name}
                  onChange={(event) => handleEntryChange(event.target.value)}
                  className="w-40 sm:w-48"
                >
                  {entries.map((item) => (
                    <NativeSelectOption key={item.name} value={item.name}>
                      {item.title}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>

              <Separator className="lg:hidden" />

              <div className="flex h-12 shrink-0 items-center justify-between gap-2 bg-card px-4">
                <TabsList className="h-8 p-0.5">
                  <TabsTrigger
                    value="preview"
                    sound="toggleOn"
                    className="h-7 px-2.5 text-xs"
                  >
                    <EyeIcon className="size-3.5" aria-hidden="true" />
                    Preview
                  </TabsTrigger>
                  <TabsTrigger
                    value="code"
                    sound="toggleOn"
                    className="h-7 px-2.5 text-xs"
                  >
                    <CodeXmlIcon className="size-3.5" aria-hidden="true" />
                    Code
                  </TabsTrigger>
                </TabsList>
              </div>

              <Separator />

              <TabsContent value="preview" className="min-h-0">
                <div className="@container relative flex h-140 items-center justify-center overflow-auto p-6 lg:h-full">
                  {group === "theme" && (
                    <ThemeTransitionDemo transition={slug} />
                  )}
                  {group === "page" && <PageTransitionDemo transition={slug} />}
                  {UiDemo && (
                    <Suspense
                      fallback={
                        <LoaderCircleIcon
                          className="size-5 animate-spin text-muted-foreground"
                          aria-label="Loading demo"
                        />
                      }
                    >
                      <UiDemo key={selectedEntry.name} />
                    </Suspense>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="code" className="min-h-0">
                <CodeViewer source={sources[selectedEntry.name]} />
              </TabsContent>
            </Tabs>

            <aside
              aria-label={`Items used by the selected ${group === "ui" ? "component" : "style"}`}
              className="no-scrollbar border-t bg-card lg:overflow-y-auto lg:border-t-0 lg:border-l"
            >
              <div className="flex h-12 shrink-0 items-center justify-between gap-3 px-4">
                <CardTitle className="text-sm">Items Used</CardTitle>
                <Badge
                  variant="outline"
                  className="font-mono text-muted-foreground"
                >
                  {usedItems.length}
                </Badge>
              </div>
              <Separator />

              <CardContent className="p-2">
                <div className="no-scrollbar flex gap-2 overflow-x-auto lg:flex-col lg:gap-1">
                  {usedItems.map((item, index) => {
                    const isSelected = item.name === detail.name;

                    return (
                      <Button
                        key={item.name}
                        type="button"
                        variant="ghost"
                        size="sm"
                        sound="click"
                        aria-pressed={isSelected}
                        className={cn(
                          "h-9 min-w-48 justify-start gap-2.5 border px-2 text-left lg:min-w-0",
                          isSelected
                            ? "border-blue-500/40 bg-blue-500/10 text-blue-700 hover:bg-blue-500/10 hover:text-blue-700 dark:text-blue-300 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
                            : "border-transparent text-muted-foreground hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-700 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
                        )}
                        onClick={() => setDetailName(item.name)}
                      >
                        <Badge
                          variant="outline"
                          className={cn(
                            "size-6 bg-background px-0 font-mono",
                            isSelected && "border-blue-500/40 text-blue-600"
                          )}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </Badge>
                        <span className="min-w-0 flex-1 truncate font-medium">
                          {item.title}
                        </span>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>

              <Separator />

              <CardContent className="p-4" aria-live="polite">
                <h3 className="text-lg font-semibold tracking-tight">
                  <Link
                    to="/docs/$"
                    params={{ _splat: `components/${detail.name}` }}
                    viewTransition={{ types: ["nav-forward"] }}
                    className="group inline-flex items-center gap-1.5 rounded-sm underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {detail.title}
                    <ArrowUpRightIcon
                      className="size-4 text-muted-foreground transition-colors group-hover:text-foreground"
                      aria-hidden="true"
                    />
                  </Link>
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {detail.description}
                </p>

                <CodeBlockCommand
                  __bun__={`${PACKAGE_RUNNERS.bun} shadcn@latest add ${registryItem}`}
                  __npm__={`${PACKAGE_RUNNERS.npm} shadcn@latest add ${registryItem}`}
                  __pnpm__={`${PACKAGE_RUNNERS.pnpm} shadcn@latest add ${registryItem}`}
                  __yarn__={`${PACKAGE_RUNNERS.yarn} shadcn@latest add ${registryItem}`}
                  className="mt-4 border border-border/70 dark:bg-background/60"
                />
              </CardContent>
            </aside>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
