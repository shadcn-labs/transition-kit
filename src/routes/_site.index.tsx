import { createFileRoute } from "@tanstack/react-router";

import { AgentPrompt } from "@/components/agent-prompt";
import { CommandBox } from "@/components/command-box";
import { HomeCtas } from "@/components/home-ctas";
import { HomeGallery } from "@/components/home-gallery";
import { HomeGroups } from "@/components/home-groups";
import { HomeThemeTry } from "@/components/home-theme-try";
import { PageHero } from "@/components/page-hero";
import { PageTransition } from "@/components/page-transition";
import { ROUTES } from "@/constants/routes";
import { BreadcrumbJsonLd } from "@/seo/json-ld";
import { homepageMetadata } from "@/seo/metadata";

const IndexPage = () => (
  <>
    <BreadcrumbJsonLd items={[{ name: "Home", path: ROUTES.HOME }]} />
    <PageTransition>
      <section className="container-wrapper relative isolate">
        <div className="container flex flex-col items-center gap-4 py-20 text-center md:py-28 lg:py-32">
          <PageHero
            showAnnouncement
            title="Smooth every change."
            titleClassName="max-w-7xl"
            description={
              <>
                Theme, page and UI transitions for React, built on{" "}
                <code className="font-mono text-[0.9em]">
                  &lt;ViewTransition&gt;
                </code>
                . One shadcn command each, no animation library.
              </>
            }
            descriptionClassName="max-w-xl text-base sm:text-lg"
          />

          <HomeCtas className="rise mt-2 [--i:3]" />

          <HomeThemeTry className="rise [--i:4]" />

          <CommandBox className="rise mt-8 w-full max-w-xl [--i:5]" />

          <AgentPrompt className="rise [--i:6]" />
        </div>
      </section>
    </PageTransition>

    <HomeGallery />

    <HomeGroups />
  </>
);

export const Route = createFileRoute("/_site/")({
  component: IndexPage,
  head: () => homepageMetadata,
});
