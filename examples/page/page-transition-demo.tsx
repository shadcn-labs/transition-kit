"use client";

import {
  ArrowRightIcon,
  GaugeIcon,
  LayersIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import {
  navigateWithTransition,
  PageTransition,
} from "@/registry/page/page-transition";

const PAGES = [
  { label: "Home", path: "/" },
  { label: "Work", path: "/work" },
  { label: "About", path: "/about" },
] as const;

const FEATURES = [
  { copy: "Every route ships under 50 kB.", icon: GaugeIcon, title: "Fast" },
  { copy: "Blocks that snap together.", icon: LayersIcon, title: "Composable" },
  { copy: "End-to-end type safety.", icon: ShieldCheckIcon, title: "Typed" },
];

const PROJECTS = [
  { className: "bg-chart-1", tag: "Brand", title: "Northwind" },
  { className: "bg-chart-2", tag: "Product", title: "Orbit" },
  { className: "bg-chart-3", tag: "Web", title: "Lumen" },
  { className: "bg-chart-4", tag: "Mobile", title: "Atlas" },
];

const STATS = [
  { label: "Founded", value: "2019" },
  { label: "Projects", value: "120+" },
  { label: "Team", value: "14" },
];

const HomePage = ({ onNavigate }: { onNavigate: (index: number) => void }) => (
  <div className="flex h-full flex-col gap-6 p-6 @md:p-8">
    <div className="flex flex-col gap-2">
      <span className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
        Studio
      </span>
      <h2 className="text-2xl font-semibold tracking-tight text-balance @md:text-3xl">
        We build interfaces that feel fast.
      </h2>
      <p className="text-muted-foreground max-w-md text-sm text-balance">
        Design and engineering for teams who care about every frame.
      </p>
    </div>
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onNavigate(1)}
        className="bg-primary text-primary-foreground focus-visible:ring-ring/50 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium outline-none hover:opacity-90 focus-visible:ring-[3px]"
      >
        See our work
        <ArrowRightIcon className="size-3.5" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => onNavigate(2)}
        className="hover:bg-muted focus-visible:ring-ring/50 rounded-md border px-3 py-1.5 text-sm font-medium outline-none focus-visible:ring-[3px]"
      >
        About us
      </button>
    </div>
    <div className="grid gap-3 @md:grid-cols-3">
      {FEATURES.map((feature) => (
        <div
          key={feature.title}
          className="bg-card flex flex-col gap-1.5 rounded-lg border p-3"
        >
          <feature.icon className="size-4" aria-hidden />
          <span className="text-sm font-medium">{feature.title}</span>
          <span className="text-muted-foreground text-xs">{feature.copy}</span>
        </div>
      ))}
    </div>
  </div>
);

const WorkPage = () => (
  <div className="flex h-full flex-col gap-4 p-6 @md:p-8">
    <div className="flex items-end justify-between gap-4">
      <h2 className="text-2xl font-semibold tracking-tight">Selected work</h2>
      <span className="text-muted-foreground text-xs">2023 – 2026</span>
    </div>
    <div className="grid grid-cols-2 gap-3 @md:grid-cols-4">
      {PROJECTS.map((project) => (
        <div key={project.title} className="flex flex-col gap-2">
          <div className={cn("aspect-[4/3] rounded-lg", project.className)} />
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">{project.title}</span>
            <span className="text-muted-foreground text-xs">{project.tag}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AboutPage = () => (
  <div className="flex h-full flex-col gap-6 p-6 @md:p-8">
    <div className="flex items-center gap-4">
      <div className="bg-muted text-foreground flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
        AC
      </div>
      <div className="flex flex-col">
        <h2 className="text-2xl font-semibold tracking-tight">About Acme</h2>
        <span className="text-muted-foreground text-sm">
          A small studio, remote since day one.
        </span>
      </div>
    </div>
    <p className="text-muted-foreground max-w-lg text-sm leading-6">
      We partner with founders and product teams to design, build and ship web
      apps. Fewer meetings, more prototypes, and a strong opinion about motion.
    </p>
    <dl className="grid grid-cols-3 divide-x rounded-lg border">
      {STATS.map((stat) => (
        <div key={stat.label} className="flex flex-col gap-0.5 p-3">
          <dt className="text-muted-foreground text-xs">{stat.label}</dt>
          <dd className="text-lg font-semibold tracking-tight">{stat.value}</dd>
        </div>
      ))}
    </dl>
  </div>
);

export const PageTransitionDemo = ({ transition }: { transition: string }) => {
  const [page, setPage] = useState(0);

  const navigate = (next: number) => {
    if (next === page) {
      return;
    }
    navigateWithTransition(() => setPage(next), {
      direction: next < page ? "back" : "forward",
    });
  };

  return (
    <div
      data-slot="page-transition-demo"
      className="bg-background @container flex h-[26rem] w-full max-w-2xl flex-col overflow-hidden rounded-xl border shadow-sm"
    >
      <div className="bg-muted/50 flex items-center gap-3 border-b px-3 py-2">
        <div className="flex gap-1.5" aria-hidden>
          <span className="bg-muted-foreground/30 size-2.5 rounded-full" />
          <span className="bg-muted-foreground/30 size-2.5 rounded-full" />
          <span className="bg-muted-foreground/30 size-2.5 rounded-full" />
        </div>
        <div className="bg-background text-muted-foreground min-w-0 flex-1 truncate rounded-md border px-2 py-0.5 text-center font-mono text-xs">
          acme.studio{PAGES[page].path}
        </div>
      </div>
      <nav
        aria-label="Demo site"
        className="flex items-center justify-between gap-2 border-b px-4 py-2"
      >
        <span className="text-sm font-semibold">Acme</span>
        <div className="flex gap-1">
          {PAGES.map((item, index) => (
            <button
              key={item.path}
              type="button"
              aria-current={index === page ? "page" : undefined}
              onClick={() => navigate(index)}
              className={cn(
                "focus-visible:ring-ring/50 rounded-md px-2.5 py-1 text-sm outline-none focus-visible:ring-[3px]",
                index === page
                  ? "bg-muted text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>
      <div className="min-h-0 flex-1">
        <PageTransition
          id={PAGES[page].path}
          transition={transition}
          className="bg-background h-full overflow-hidden"
        >
          {page === 0 && <HomePage onNavigate={navigate} />}
          {page === 1 && <WorkPage />}
          {page === 2 && <AboutPage />}
        </PageTransition>
      </div>
    </div>
  );
};
