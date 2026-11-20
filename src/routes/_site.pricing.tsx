import { createFileRoute, Link, useLoaderData } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Check, Minus, Plus } from "lucide-react";
import { useState } from "react";

import { BillingButton } from "@/components/billing-button";
import { Frame } from "@/components/frame";
import { PageTransition } from "@/components/page-transition";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useAccount } from "@/hooks/use-account";
import {
  getBillingConfigurationError,
  getPlanOffers,
  missingPlanProduct,
} from "@/lib/billing";
import { formatUsd, PLANS, TEAM, teamPrice } from "@/lib/plans";
import type { PlanOffer, PlanSlug } from "@/lib/plans";
import { FaqJsonLd } from "@/seo/json-ld";
import { createPageMetadata } from "@/seo/metadata";

const metadata = createPageMetadata({
  description: `transition-kit is free to use. Pro is $179 a year or $249 lifetime, with early-bird pricing of $149 a year or $199 lifetime for the first 50 buyers. Team is a one-time license for ${TEAM.minSeats} to ${TEAM.maxSeats} seats, ${formatUsd(teamPrice(TEAM.defaultSeats))} for ${TEAM.defaultSeats}.`,
  path: ROUTES.PRICING,
  title: "Pricing",
});

const FAQ = [
  {
    answer:
      "The source. Every Pro component as the file it was built from, installed into components/transitions with the shadcn CLI, plus every Pro component we ship after you buy.",
    question: "What am I actually buying?",
  },
  {
    answer:
      "Yes. Every Pro component has a live preview on its docs page, free and without an account. Pay when you want the source.",
    question: "Can I try it before I buy?",
  },
  {
    answer:
      "Pro if you have one project in sight. Lifetime if you'll build more than one. Lifetime costs less than two years of Pro and includes everything we ship after.",
    question: "Pro or Lifetime?",
  },
  {
    answer: `A seat is a person. Team is a ${formatUsd(TEAM.basePrice)} license plus ${formatUsd(TEAM.seatPrice)} a seat, ${TEAM.minSeats} to ${TEAM.maxSeats} seats, paid once. Everyone shares one team API key, usually stored in CI or your env. Over ${TEAM.maxSeats} people? Email us and we'll quote it.`,
    question: "How do team seats work?",
  },
  {
    answer:
      "React 19.3 or later with Tailwind CSS and the shadcn CLI. Components animate with React's <ViewTransition>, so there's no animation library to install.",
    question: "What do I need installed?",
  },
  {
    answer:
      "Yes, on every plan. Free components are MIT. Pro covers commercial work and projects you build for clients.",
    question: "Can I use it for client work?",
  },
  {
    answer:
      "Dodo Payments is our merchant of record: they handle checkout, invoices, sales tax and VAT. Refunds follow our refund policy, and Pro can be cancelled anytime from billing.",
    question: "Who handles billing, tax and refunds?",
  },
];

const loadPricing = createServerFn({ method: "GET" }).handler(async () => {
  const configurationError = getBillingConfigurationError();
  const reason = (slug: PlanSlug) => {
    if (configurationError) {
      return "Checkout isn't configured yet.";
    }
    return missingPlanProduct(slug) ? "This plan isn't available yet." : null;
  };
  const unavailable = Object.fromEntries(
    PLANS.map((plan) => [plan.slug, reason(plan.slug)])
  ) as Record<PlanSlug, string | null>;
  return { offers: await getPlanOffers(), unavailable };
});

const Feature = ({ children }: { children: React.ReactNode }) => (
  <li className="flex gap-2.5">
    <Check className="text-brand mt-0.5 size-4 shrink-0" aria-hidden />
    <span>{children}</span>
  </li>
);

const PlanCard = ({
  name,
  price,
  interval,
  note,
  features,
  highlight = false,
  earlyBird,
  regularPrice,
  children,
}: {
  name: string;
  price: string;
  interval: string;
  note: string;
  features: string[];
  highlight?: boolean;
  earlyBird?: number | null;
  regularPrice?: string;
  children: React.ReactNode;
}) => (
  <Frame
    tone={highlight ? "brand" : "default"}
    label={
      <>
        <h2 className="text-foreground text-sm font-semibold">{name}</h2>
        {highlight ? (
          <span className="text-brand-text font-medium">Best value</span>
        ) : null}
      </>
    }
    action={
      earlyBird ? (
        <span className="bg-brand/15 text-brand-text rounded-full px-2 py-0.5 font-medium tabular-nums">
          {earlyBird} early-bird left
        </span>
      ) : null
    }
    innerClassName="gap-6"
  >
    <div className="grid gap-1.5">
      <p className="flex flex-wrap items-baseline gap-x-1.5">
        <span className="text-4xl font-semibold tracking-tight tabular-nums">
          {price}
        </span>
        {earlyBird && regularPrice !== price ? (
          <span className="text-muted-foreground text-sm tabular-nums line-through">
            {regularPrice}
          </span>
        ) : null}
        <span className="text-muted-foreground text-sm">{interval}</span>
      </p>
      <p className="text-muted-foreground text-sm">{note}</p>
    </div>
    <ul className="grid gap-2.5 border-t pt-5 text-sm">
      {features.map((feature) => (
        <Feature key={feature}>{feature}</Feature>
      ))}
    </ul>
    <div className="mt-auto">{children}</div>
  </Frame>
);

const PRO_FEATURES = [
  "Every Pro component, as source",
  "Installs with the shadcn CLI or MCP",
  "Commercial and client use",
  "Every Pro component we add next",
];

const Cta = ({
  plan,
  seats,
  unavailable,
  pro,
  variant,
  children,
}: {
  plan: PlanSlug;
  seats?: number;
  unavailable: string | null;
  pro: boolean;
  variant?: "default" | "outline";
  children: React.ReactNode;
}) => {
  if (pro) {
    return (
      <Button asChild variant="outline" className="w-full">
        <Link to={ROUTES.ACCOUNT}>You have Pro</Link>
      </Button>
    );
  }
  return (
    <div className="grid gap-2">
      <BillingButton
        plan={plan}
        seats={seats}
        disabled={Boolean(unavailable)}
        variant={variant}
      >
        {children}
      </BillingButton>
      {unavailable ? (
        <p className="text-muted-foreground text-center text-xs">
          {unavailable}
        </p>
      ) : null}
    </div>
  );
};

const TeamCard = ({
  unavailable,
  pro,
}: {
  unavailable: string | null;
  pro: boolean;
}) => {
  const [seats, setSeats] = useState<number>(TEAM.defaultSeats);
  const change = (delta: number) =>
    setSeats((current) =>
      Math.min(Math.max(current + delta, TEAM.minSeats), TEAM.maxSeats)
    );
  return (
    <PlanCard
      name="Team"
      price={formatUsd(teamPrice(seats))}
      interval="once"
      note={`${formatUsd(TEAM.basePrice)} + ${formatUsd(TEAM.seatPrice)} per seat. One shared team key.`}
      features={[
        "Everything in Lifetime",
        `${TEAM.minSeats} to ${TEAM.maxSeats} seats`,
        "One API key for CI and env",
      ]}
    >
      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <span id="team-seats" className="text-sm font-medium">
            Seats
          </span>
          <div
            role="group"
            aria-labelledby="team-seats"
            className="flex items-center gap-1"
          >
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              aria-label="Remove a seat"
              disabled={seats <= TEAM.minSeats}
              onClick={() => change(-1)}
            >
              <Minus />
            </Button>
            <output
              aria-live="polite"
              className="w-8 text-center text-sm font-medium tabular-nums"
            >
              {seats}
            </output>
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              aria-label="Add a seat"
              disabled={seats >= TEAM.maxSeats}
              onClick={() => change(1)}
            >
              <Plus />
            </Button>
          </div>
        </div>
        <Cta
          plan="team"
          seats={seats}
          unavailable={unavailable}
          pro={pro}
          variant="outline"
        >
          Buy Team
        </Cta>
      </div>
    </PlanCard>
  );
};

const PricingPage = () => {
  const { offers, unavailable } = useLoaderData({ from: "/_site/pricing" });
  const { account } = useAccount();
  const pro = Boolean(account?.pro);
  const annual: PlanOffer = offers.annual;
  const lifetime: PlanOffer = offers.lifetime;

  return (
    <PageTransition>
      <FaqJsonLd faqs={FAQ} />
      <section className="container-wrapper">
        <div className="container mx-auto flex flex-col gap-12 py-12 md:py-16">
          <div className="mx-auto grid max-w-2xl gap-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Pricing
            </h1>
            <p className="text-muted-foreground text-base text-balance">
              Every free component stays free and MIT. Pro adds premium
              components as source you keep, paid yearly or once.
            </p>
            {pro ? (
              <p className="text-sm">
                You&apos;re Pro.{" "}
                <Link
                  to={ROUTES.ACCOUNT}
                  className="underline underline-offset-4"
                >
                  Get your API key
                </Link>
              </p>
            ) : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <PlanCard
              name="Free"
              price="$0"
              interval="forever"
              note="Every free component, theme and page transition."
              features={[
                "All free components",
                "Theme and page transitions",
                "MIT license",
              ]}
            >
              <Button asChild variant="outline" className="w-full">
                <Link to="/docs/$" params={{ _splat: "components" }}>
                  Browse components
                </Link>
              </Button>
            </PlanCard>
            <PlanCard
              name="Pro"
              price={annual.price}
              regularPrice={annual.regularPrice}
              earlyBird={annual.earlyBirdLeft}
              interval="/ year"
              note="Per year. Cancel anytime."
              features={PRO_FEATURES}
            >
              <Cta plan="annual" unavailable={unavailable.annual} pro={pro}>
                Get Pro
              </Cta>
            </PlanCard>
            <PlanCard
              highlight
              name="Lifetime"
              price={lifetime.price}
              regularPrice={lifetime.regularPrice}
              earlyBird={lifetime.earlyBirdLeft}
              interval="once"
              note="One-time payment. No renewal."
              features={PRO_FEATURES}
            >
              <Cta plan="lifetime" unavailable={unavailable.lifetime} pro={pro}>
                Get Lifetime
              </Cta>
            </PlanCard>
            <TeamCard unavailable={unavailable.team} pro={pro} />
          </div>
          <section
            aria-labelledby="faq-title"
            className="mx-auto w-full max-w-3xl"
          >
            <h2
              id="faq-title"
              className="mb-6 text-center text-2xl font-semibold tracking-tight"
            >
              FAQs
            </h2>
            <Frame innerClassName="px-5 py-1">
              <Accordion type="single" collapsible>
                {FAQ.map((item) => (
                  <AccordionItem key={item.question} value={item.question}>
                    <AccordionTrigger>{item.question}</AccordionTrigger>
                    <AccordionContent>{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Frame>
            <p className="text-muted-foreground mt-6 text-center text-xs">
              See the{" "}
              <Link
                to={ROUTES.LICENSE}
                className="underline underline-offset-4"
              >
                license
              </Link>
              ,{" "}
              <Link to={ROUTES.TERMS} className="underline underline-offset-4">
                terms
              </Link>{" "}
              and{" "}
              <Link
                to={ROUTES.REFUNDS}
                className="underline underline-offset-4"
              >
                refund policy
              </Link>
              .
            </p>
          </section>
        </div>
      </section>
    </PageTransition>
  );
};

export const Route = createFileRoute("/_site/pricing")({
  component: PricingPage,
  head: () => metadata,
  headers: () => ({
    "Cache-Control":
      "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
  }),
  loader: () => loadPricing(),
});
