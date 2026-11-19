import { Link } from "@tanstack/react-router";

import { PageTransition } from "@/components/page-transition";
import { Separator } from "@/components/ui/separator";
import { LINK } from "@/constants/links";
import { ROUTES } from "@/constants/routes";
import { BreadcrumbJsonLd } from "@/seo/json-ld";

export const LegalSection = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) => (
  <section className="grid gap-3">
    <h2 className="text-foreground text-lg font-semibold tracking-tight">
      {title}
    </h2>
    {children}
  </section>
);

export const LegalPage = ({
  children,
  intro,
  path,
  title,
  updated,
}: {
  children: React.ReactNode;
  intro?: React.ReactNode;
  path: string;
  title: string;
  updated: string;
}) => (
  <>
    <BreadcrumbJsonLd
      items={[
        { name: "Home", path: ROUTES.HOME },
        { name: title, path },
      ]}
    />
    <PageTransition>
      <article className="container-wrapper">
        <div className="container mx-auto w-full max-w-2xl py-12 md:py-16">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h1>
          {intro ? (
            <div className="text-muted-foreground mt-3 text-[15px] leading-7 text-pretty">
              {intro}
            </div>
          ) : null}
          <p className="text-muted-foreground mt-4 text-xs">
            Last updated <time>{updated}</time>
          </p>
          <Separator className="my-10" />
          <div className="text-muted-foreground grid gap-10 text-[15px] leading-7 [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_li]:mt-1.5 [&_ol]:list-decimal [&_ol]:ps-5 [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:ps-5">
            {children}
            <LegalSection title="Contact">
              <p>
                Questions about this page? Email{" "}
                <a href={`mailto:${LINK.EMAIL}`}>{LINK.EMAIL}</a>, or ask in{" "}
                <a
                  href={LINK.DISCORD}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Discord
                </a>
                . You can also read the <Link to={ROUTES.TERMS}>terms</Link>.
              </p>
            </LegalSection>
          </div>
        </div>
      </article>
    </PageTransition>
  </>
);
