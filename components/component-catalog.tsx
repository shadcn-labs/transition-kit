"use client";

import { useEffect, useRef, useState } from "react";
import type { ComponentType } from "react";

import { ItemCard } from "@/components/item-grid";
import { AccordionDemo } from "@/examples/ui/accordion-demo";
import { AddToCartDemo } from "@/examples/ui/add-to-cart-demo";
import { AnimatedListDemo } from "@/examples/ui/animated-list-demo";
import { CarouselDemo } from "@/examples/ui/carousel-demo";
import { DynamicIslandDemo } from "@/examples/ui/dynamic-island-demo";
import { ExpandableCardDemo } from "@/examples/ui/expandable-card-demo";
import { FilterGridDemo } from "@/examples/ui/filter-grid-demo";
import { KanbanBoardDemo } from "@/examples/ui/kanban-board-demo";
import { LayoutSwitcherDemo } from "@/examples/ui/layout-switcher-demo";
import { MorphingPopoverDemo } from "@/examples/ui/morphing-popover-demo";
import { NumberFlipDemo } from "@/examples/ui/number-flip-demo";
import { ProductGalleryDemo } from "@/examples/ui/product-gallery-demo";
import { SegmentedControlDemo } from "@/examples/ui/segmented-control-demo";
import { SortableTableDemo } from "@/examples/ui/sortable-table-demo";
import { StackNavigatorDemo } from "@/examples/ui/stack-navigator-demo";
import { StatusButtonDemo } from "@/examples/ui/status-button-demo";
import { StepWizardDemo } from "@/examples/ui/step-wizard-demo";
import { TabsDemo } from "@/examples/ui/tabs-demo";
import { ThemeModeSwitchDemo } from "@/examples/ui/theme-mode-switch-demo";
import { ThemeMorphButtonDemo } from "@/examples/ui/theme-morph-button-demo";
import { ThemeToggleButtonDemo } from "@/examples/ui/theme-toggle-button-demo";
import { ThemeToggleSwitchDemo } from "@/examples/ui/theme-toggle-switch-demo";
import { cn } from "@/lib/utils";
import { getItem, items } from "@/registry/items";

interface Entry {
  name: string;
  Demo: ComponentType;
  hint: string;
  wide?: boolean;
}

/** Sections of the components index. Each one is a heading in index.mdx. */
const SECTIONS = {
  collections: [
    {
      Demo: AnimatedListDemo,
      hint: "Shuffle or sort the list",
      name: "animated-list",
      wide: true,
    },
    {
      Demo: FilterGridDemo,
      hint: "Filter or search the team",
      name: "filter-grid",
      wide: true,
    },
    {
      Demo: LayoutSwitcherDemo,
      hint: "Switch the layout",
      name: "layout-switcher",
      wide: true,
    },
    {
      Demo: SortableTableDemo,
      hint: "Sort a column",
      name: "sortable-table",
      wide: true,
    },
    {
      Demo: KanbanBoardDemo,
      hint: "Drag a card to another column",
      name: "kanban-board",
      wide: true,
    },
    {
      Demo: ProductGalleryDemo,
      hint: "Pick a photo",
      name: "product-gallery",
      wide: true,
    },
  ],
  controls: [
    { Demo: TabsDemo, hint: "Pick a tab", name: "tabs" },
    {
      Demo: SegmentedControlDemo,
      hint: "Pick an option",
      name: "segmented-control",
    },
    {
      Demo: NumberFlipDemo,
      hint: "Change the number format",
      name: "number-flip",
    },
    { Demo: StatusButtonDemo, hint: "Press the button", name: "status-button" },
    {
      Demo: AddToCartDemo,
      hint: "Add a product to the cart",
      name: "add-to-cart",
      wide: true,
    },
  ],
  morphs: [
    {
      Demo: DynamicIslandDemo,
      hint: "Switch the island state",
      name: "dynamic-island",
    },
    {
      Demo: MorphingPopoverDemo,
      hint: "Open the popover",
      name: "morphing-popover",
    },
    {
      Demo: ExpandableCardDemo,
      hint: "Open a card",
      name: "expandable-card",
      wide: true,
    },
  ],
  navigation: [
    {
      Demo: StackNavigatorDemo,
      hint: "Open a conversation",
      name: "stack-navigator",
    },
    {
      Demo: StepWizardDemo,
      hint: "Step through the setup",
      name: "step-wizard",
    },
    { Demo: AccordionDemo, hint: "Open a section", name: "accordion" },
    { Demo: CarouselDemo, hint: "Use the arrows or dots", name: "carousel" },
  ],
  "theme-switches": [
    {
      Demo: ThemeToggleButtonDemo,
      hint: "Switch the theme",
      name: "theme-toggle-button",
    },
    {
      Demo: ThemeToggleSwitchDemo,
      hint: "Switch the theme",
      name: "theme-toggle-switch",
    },
    {
      Demo: ThemeModeSwitchDemo,
      hint: "Switch the theme",
      name: "theme-mode-switch",
    },
    {
      Demo: ThemeMorphButtonDemo,
      hint: "Switch the theme",
      name: "theme-morph-button",
    },
  ],
} satisfies Record<string, Entry[]>;

export type CatalogSectionId = keyof typeof SECTIONS;

const useSeen = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || seen) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px" }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [seen]);

  return [ref, seen] as const;
};

const DemoCard = ({ name, Demo, hint, wide }: Entry) => {
  const item = getItem(name);
  const [ref, seen] = useSeen();
  if (!item) {
    return null;
  }

  return (
    <ItemCard
      item={item}
      className={cn(wide && "sm:col-span-2")}
      preview={
        <div className="flex flex-1 flex-col">
          <div
            ref={ref}
            className={cn(
              "@container flex flex-1 items-center justify-center px-6 pt-6",
              wide ? "min-h-80" : "min-h-64"
            )}
          >
            {seen && <Demo />}
          </div>
          <p className="text-muted-foreground px-6 pt-4 pb-4 text-center text-xs">
            {hint}
          </p>
        </div>
      }
    />
  );
};

export const CatalogSection = ({ section }: { section: CatalogSectionId }) => (
  <div className="not-prose mt-6 grid gap-4 sm:grid-cols-2">
    {SECTIONS[section].map((entry: Entry) => (
      <DemoCard key={entry.name} {...entry} />
    ))}
  </div>
);

const styleCount = (group: "theme" | "page") =>
  items.filter((item) => item.group === group && item.kind === "style").length;

export const TransitionHubs = () => (
  <div className="not-prose mt-6 grid gap-4 sm:grid-cols-2">
    {(
      [
        ["theme-transition", "theme", "theme/circle-reveal"],
        ["page-transition", "page", "page/slide"],
      ] as const
    ).map(([name, group, preview]) => {
      const item = getItem(name);
      const video = getItem(preview)?.video;
      if (!item) {
        return null;
      }
      return (
        <ItemCard
          key={name}
          item={item}
          video={video}
          meta={`${styleCount(group)} styles`}
        />
      );
    })}
  </div>
);
