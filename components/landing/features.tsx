import {
  AccessibilityIcon,
  BlocksIcon,
  ClipboardCopyIcon,
  Code2Icon,
  SparklesIcon,
  ZapIcon,
} from "lucide-react";

import { SectionHeading } from "@/components/landing/section-heading";

const FEATURES = [
  {
    Icon: ZapIcon,
    description:
      "Runs on the browser's View Transitions API, coordinated by React. No animation library.",
    title: "Native",
  },
  {
    Icon: SparklesIcon,
    description:
      "Composable tk-* classes that glide, morph and slide any UI state change.",
    title: "Composable",
  },
  {
    Icon: AccessibilityIcon,
    description:
      "Keyboard-friendly components that respect prefers-reduced-motion.",
    title: "Accessible",
  },
  {
    Icon: Code2Icon,
    description:
      "Small, fully typed cores: a provider, a hook and a page boundary.",
    title: "TypeScript",
  },
  {
    Icon: ClipboardCopyIcon,
    description:
      "Every style is a stylesheet you own. Change timing and keyframes freely.",
    title: "Plain CSS",
  },
  {
    Icon: BlocksIcon,
    description:
      "Uses the shadcn registry format. Add any transition with one command.",
    title: "shadcn compatible",
  },
];

export const Features = () => (
  <section className="rail">
    <SectionHeading
      title="Small cores. Plain CSS. No lock-in."
      description="Copy-paste code you own, with zero lock-in and defaults that work immediately."
    />
    <div className="bg-border grid gap-px sm:grid-cols-2 lg:grid-cols-3">
      {FEATURES.map(({ description, Icon, title }) => (
        <div
          key={title}
          className="bg-background flex flex-col gap-2 px-4 py-5 md:gap-3 md:p-8"
        >
          <div className="flex items-center gap-3 md:flex-col md:items-start">
            <span className="bg-muted/40 text-brand flex size-8 shrink-0 items-center justify-center rounded-lg border md:size-9">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <h3 className="font-medium">{title}</h3>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        </div>
      ))}
    </div>
  </section>
);
