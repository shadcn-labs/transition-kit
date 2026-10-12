import { createFileRoute } from "@tanstack/react-router";

import { AgentPrompt } from "@/components/agent-prompt";
import { CommandBox } from "@/components/command-box";
import { HomeCtas } from "@/components/home-ctas";
import { HomeShowcase } from "@/components/home-showcase";
import { PageHero } from "@/components/page-hero";
import { PageTransition } from "@/components/page-transition";
import { ROUTES } from "@/constants/routes";
import { BreadcrumbJsonLd } from "@/seo/json-ld";
import { homepageMetadata } from "@/seo/metadata";

const IndexPage = () => (
  <>
    <BreadcrumbJsonLd items={[{ name: "Home", path: ROUTES.HOME }]} />
    <PageTransition>
      <section className="container-wrapper relative">
        <div className="container flex flex-col items-center gap-4 py-16 text-center md:py-20 lg:py-24">
          <PageHero
            showAnnouncement
            title="Theme, page and UI transitions, made simple"
            titleClassName="max-w-7xl"
            description={
              <>
                Ready to use theme, page and UI transitions for React.
                <br className="hidden sm:block" /> Built on React 19.3{" "}
                <code className="font-mono text-[0.9em]">
                  &lt;ViewTransition&gt;
                </code>
                . Distributed via shadcn.
              </>
            }
            descriptionClassName="max-w-2xl text-lg sm:text-xl"
          />

          <CommandBox className="mt-4 w-full max-w-xl" />

          <HomeCtas className="mt-4" />

          <AgentPrompt />
        </div>
      </section>
    </PageTransition>

    <HomeShowcase />
  </>
);

export const Route = createFileRoute("/_site/")({
  component: IndexPage,
  head: () => homepageMetadata,
});
