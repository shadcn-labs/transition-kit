import { DiscordIcon, GithubIcon } from "@/components/icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LINK } from "@/constants/links";
import { FaqJsonLd } from "@/seo/json-ld";

const FAQS = [
  {
    answer:
      "transition-kit is an open-source shadcn registry of theme, page and UI transitions for React. Each one is a small component or a few lines of CSS that the shadcn CLI copies into your project, so you own the code.",
    question: "What is transition-kit?",
  },
  {
    answer:
      "React 19.3 or newer. Every transition is built on React's <ViewTransition>, startTransition and addTransitionType, so React decides what to snapshot and when.",
    question: "Which React version do I need?",
  },
  {
    answer:
      "No. Transitions run on the browser's View Transitions API, coordinated by React. There is no animation library and no runtime beyond React itself.",
    question: "Do I need an animation library?",
  },
  {
    answer:
      "Add the @transition-kit registry to components.json, then run npx shadcn@latest add @transition-kit/<name>. Cores and components install to components/transitions/, and each style's CSS is merged into your global stylesheet.",
    question: "How do I install a transition?",
  },
  {
    answer:
      "In browsers without the View Transitions API, React applies every update instantly with no errors. With prefers-reduced-motion, nothing travels: the core CSS handles it, so individual styles never have to.",
    question: "What happens in unsupported browsers or with reduced motion?",
  },
  {
    answer:
      "Yes. transition-kit is MIT licensed and maintained by Shadcn Labs. Every component is free, and sponsorships keep it that way.",
    question: "Is it free to use in commercial projects?",
  },
] as const;

export const Faq = () => (
  <section className="rail">
    <FaqJsonLd faqs={FAQS} />
    <div className="grid md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:divide-x">
      <div className="border-b px-4 py-12 md:border-b-0 md:px-8 md:py-14">
        <div className="flex flex-col gap-4 md:sticky md:top-[calc(var(--header-height)+3.5rem)]">
          <h2 className="text-3xl font-normal tracking-tight text-balance sm:text-4xl lg:text-5xl">
            Before you install.
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
            Answers to common questions about transition-kit and React view
            transitions.
          </p>
        </div>
      </div>
      <div>
        <Accordion type="single" collapsible>
          {FAQS.map((faq) => (
            <AccordionItem key={faq.question} value={faq.question}>
              <AccordionTrigger
                sound="click"
                className="rounded-none px-4 py-5 text-[15px] font-medium hover:no-underline sm:text-base md:px-8"
              >
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground px-4 text-sm leading-relaxed sm:text-base md:px-8">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="flex flex-col items-start justify-between gap-3 border-t px-4 py-5 sm:flex-row sm:items-center md:px-8">
          <p className="text-muted-foreground text-sm">
            Something else? Open an issue or come say hi.
          </p>
          <div className="flex gap-2">
            <a
              href={`${LINK.GITHUB}/issues/new`}
              target="_blank"
              rel="noreferrer"
              className="bg-muted/40 hover:bg-muted focus-visible:ring-ring/50 inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-sm transition-colors outline-none focus-visible:ring-[3px]"
            >
              <GithubIcon className="size-3.5" />
              New issue
            </a>
            <a
              href={LINK.DISCORD}
              target="_blank"
              rel="noreferrer"
              className="bg-muted/40 hover:bg-muted focus-visible:ring-ring/50 inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-sm transition-colors outline-none focus-visible:ring-[3px]"
            >
              <DiscordIcon className="size-3.5" />
              Discord
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
);
