import { createFileRoute } from "@tanstack/react-router";

import { HomeGallery } from "@/components/home-gallery";
import { HomeGroups } from "@/components/home-groups";
import { BuiltOn } from "@/components/landing/built-on";
import { Faq } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import { Install } from "@/components/landing/install";
import { SectionDivider } from "@/components/landing/section-divider";
import { PageTransition } from "@/components/page-transition";
import { ROUTES } from "@/constants/routes";
import { BreadcrumbJsonLd } from "@/seo/json-ld";
import { homepageMetadata } from "@/seo/metadata";

const IndexPage = () => (
  <>
    <BreadcrumbJsonLd items={[{ name: "Home", path: ROUTES.HOME }]} />
    <PageTransition>
      <Hero />
    </PageTransition>
    <SectionDivider />
    <BuiltOn />
    <SectionDivider />
    <Install />
    <SectionDivider />
    <HomeGallery />
    <SectionDivider />
    <HomeGroups />
    <SectionDivider />
    <Features />
    <SectionDivider />
    <Faq />
    <SectionDivider />
  </>
);

export const Route = createFileRoute("/_site/")({
  component: IndexPage,
  head: () => homepageMetadata,
});
