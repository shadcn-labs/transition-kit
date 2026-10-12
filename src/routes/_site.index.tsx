import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import { AgentPrompt } from "@/components/agent-prompt";
import { CommandBox } from "@/components/command-box";
import { HomeCtas } from "@/components/home-ctas";
import { HomeShowcase } from "@/components/home-showcase";
import type { ShowcaseSources } from "@/components/home-showcase";
import { PageHero } from "@/components/page-hero";
import { PageTransition } from "@/components/page-transition";
import { ROUTES } from "@/constants/routes";
import { toInstalledImports } from "@/lib/component-sources.server";
import { highlightCode } from "@/lib/highlight-code";
import { BreadcrumbJsonLd } from "@/seo/json-ld";
import { homepageMetadata } from "@/seo/metadata";

/** Highlights every style's CSS and UI component's TSX on the server for the showcase's Code tab. */
const loadShowcaseSources = createServerFn({ method: "GET" }).handler(
  async () => {
    const files = import.meta.glob<string>(
      ["/registry/*/styles/*.css", "/registry/ui/*.tsx"],
      { import: "default", query: "?raw" }
    );
    const entries = await Promise.all(
      Object.entries(files).map(async ([path, load]) => {
        const code = toInstalledImports(await load());
        // `/registry/theme/styles/circle-reveal.css` -> `theme/circle-reveal`,
        // `/registry/ui/tabs.tsx` -> `ui/tabs`
        const segments = path.split("/");
        const [slug, language] = (segments.at(-1) ?? "").split(".");
        return [
          `${segments[2]}/${slug}`,
          { code, highlightedCode: await highlightCode(code, language) },
        ] as const;
      })
    );
    return Object.fromEntries(entries) as ShowcaseSources;
  }
);

const IndexPage = () => {
  const sources = useLoaderData({ from: "/_site/" });

  return (
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

      <HomeShowcase sources={sources} />
    </>
  );
};

export const Route = createFileRoute("/_site/")({
  component: IndexPage,
  head: () => homepageMetadata,
  loader: () => loadShowcaseSources(),
});
