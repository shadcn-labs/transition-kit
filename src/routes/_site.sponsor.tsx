import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Heart, Plus, Star } from "lucide-react";

import { ExternalLinkButton } from "@/components/external-link-button";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LINK, MAINTAINERS } from "@/constants/links";
import { ROUTES } from "@/constants/routes";
import { getStargazers } from "@/lib/github";
import { tiers } from "@/lib/sponsors";
import { createPageMetadata } from "@/seo/metadata";

const metadata = createPageMetadata({
  description:
    "Support transition-kit, open-source theme, page and UI transitions for React. Sponsor tiers, stargazers, and how to contribute.",
  path: ROUTES.SPONSOR,
  title: "Sponsor",
});

const loadStargazers = createServerFn({ method: "GET" }).handler(() =>
  getStargazers()
);

const SponsorPage = () => {
  const stargazers = useLoaderData({ from: "/_site/sponsor" });

  return (
    <PageTransition>
      <section className="container-wrapper relative">
        <div className="container max-w-2xl flex flex-col items-center gap-4 py-16 text-center md:py-20 lg:py-24">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl from-foreground via-foreground to-foreground/65 bg-linear-to-b bg-clip-text text-transparent">
            Support the project
          </h1>
          <p className="text-base text-muted-foreground text-balance">
            transition-kit is a free, open-source registry of theme, page and UI
            transitions for React, maintained by Shadcn Labs. Every component is
            free and that&apos;s not changing.
          </p>
          <p className="text-sm text-muted-foreground text-balance">
            We&apos;re not going to paywall features or gate transitions behind
            a sponsorship tier. But if transition-kit made your project better,
            or you just like that this exists in the open, sponsoring is a nice
            way to say so. It helps us justify spending real time on it instead
            of treating it like a side-of-desk thing.
          </p>
          <p className="text-sm text-muted-foreground text-balance">
            Any amount is genuinely appreciated. And if money&apos;s not your
            thing, starring the repo or sharing something you liked works too.
          </p>
          <div
            id="maintainers"
            className="mt-4 grid w-full scroll-mt-24 gap-3 text-left sm:grid-cols-2"
          >
            {MAINTAINERS.map((maintainer) => (
              <div
                key={maintainer.login}
                className="bg-card ring-foreground/10 flex items-center gap-3 rounded-xl p-3 ring-1"
              >
                <img
                  src={maintainer.avatar}
                  alt=""
                  width={40}
                  height={40}
                  className="ring-border size-10 rounded-full ring-1"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {maintainer.name}
                  </p>
                  <p className="text-muted-foreground truncate font-mono text-xs">
                    @{maintainer.login}
                  </p>
                </div>
                <ExternalLinkButton
                  sound="heart"
                  size="sm"
                  href={maintainer.sponsor}
                  aria-label={`Sponsor ${maintainer.name} on GitHub`}
                >
                  <Heart />
                  Sponsor
                </ExternalLinkButton>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-wrapper relative">
        <div className="container max-w-2xl flex flex-col">
          {tiers.map((tier) => {
            const filled = tier.sponsors.length;
            const empty = tier.slots - filled;

            return (
              <div
                key={tier.name}
                className="flex flex-col gap-3 py-6 first-of-type:pt-0"
              >
                <div
                  className="relative flex items-center justify-center rounded-md px-8 py-2.5"
                  style={{
                    background: tier.colors.bg,
                    boxShadow:
                      "inset 0 1px 1px rgba(255,255,255,0.35), inset 0 -1px 2px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.12)",
                  }}
                >
                  {[
                    "left-2.5 top-1/2 -translate-y-1/2",
                    "right-2.5 top-1/2 -translate-y-1/2",
                  ].map((pos) => (
                    <span
                      key={pos}
                      className={`absolute size-2 rounded-full ${pos}`}
                      style={{
                        background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.5), transparent 50%), ${tier.colors.bg}`,
                        border: "1px solid rgba(0,0,0,0.15)",
                        boxShadow:
                          "inset 0 1px 2px rgba(0,0,0,0.3), inset 0 -1px 1px rgba(255,255,255,0.2), 0 1px 1px rgba(255,255,255,0.15)",
                      }}
                    />
                  ))}
                  <h3
                    className="text-xs font-extrabold uppercase tracking-[0.2em]"
                    style={{ color: tier.colors.text }}
                  >
                    {tier.name}
                  </h3>
                </div>

                <div
                  className="grid gap-2 max-sm:grid-cols-[repeat(1,1fr)]! max-lg:grid-cols-[repeat(2,1fr)]!"
                  style={{
                    gridTemplateColumns: `repeat(${Math.min(tier.slots, 4)}, 1fr)`,
                  }}
                >
                  {tier.sponsors.map((sponsor) => (
                    <a
                      key={sponsor.name}
                      href={sponsor.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-center rounded-md border p-6 transition-all hover:scale-[1.02]"
                      style={{
                        backgroundColor: tier.colors.slotBg,
                        borderColor: tier.colors.slotBorder,
                      }}
                    >
                      {sponsor.logo ? (
                        <img
                          src={sponsor.logo}
                          alt={sponsor.name}
                          className="h-8 w-auto opacity-60 transition-opacity group-hover:opacity-100"
                        />
                      ) : (
                        <span className="text-sm font-medium text-foreground">
                          {sponsor.name}
                        </span>
                      )}
                    </a>
                  ))}

                  {Array.from({ length: empty }).map((_, i) => (
                    <a
                      key={`empty-${tier.name}-${i}`}
                      href="#maintainers"
                      aria-label={`Sponsor at ${tier.name} tier`}
                      className="flex items-center justify-center rounded-md border border-dashed p-8 transition-all hover:scale-[1.02]"
                      style={{ borderColor: tier.colors.slotBorder }}
                    >
                      <Plus
                        className="size-5"
                        style={{ color: tier.colors.border, opacity: 0.5 }}
                      />
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {stargazers.length > 0 && (
        <section className="container-wrapper relative">
          <div className="container max-w-2xl pt-6">
            <Card className="shadow-none gap-4 py-4">
              <CardHeader className="flex items-center gap-3 px-4">
                <h3 className="text-xs font-bold uppercase tracking-wide text-foreground">
                  Stargazers
                </h3>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {stargazers.length}
                </span>
              </CardHeader>
              <CardContent className="flex flex-wrap justify-center gap-0 px-4">
                {stargazers.map((user) => (
                  <a
                    key={user.login}
                    href={`https://github.com/${user.login}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={user.login}
                    className="group relative p-1.5 transition-colors hover:bg-accent/50"
                  >
                    <img
                      src={user.avatar_url}
                      alt={user.login}
                      width={36}
                      height={36}
                      className="rounded-full ring-1 ring-border transition-all group-hover:ring-foreground/30 group-hover:scale-110"
                    />
                  </a>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      <section className="container-wrapper relative">
        <div className="container flex flex-col items-center gap-4 py-16 md:py-20 lg:py-24">
          <div className="flex flex-col items-center gap-2 text-center">
            <h2 className="text-lg font-bold tracking-tight">
              Want to back the project?
            </h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              Every bit helps — whether it&apos;s a sponsorship, a star, or
              sharing something you found useful.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button sound="heart" asChild>
              <a href="#maintainers">
                <Heart />
                Become a Sponsor
              </a>
            </Button>
            <ExternalLinkButton
              sound="star"
              variant="outline"
              href={LINK.GITHUB}
            >
              <Star />
              Star on GitHub
            </ExternalLinkButton>
          </div>
        </div>
      </section>
    </PageTransition>
  );
};
export const Route = createFileRoute("/_site/sponsor")({
  component: SponsorPage,
  head: () => metadata,
  loader: () => loadStargazers(),
});
