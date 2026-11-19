import { createFileRoute, Link } from "@tanstack/react-router";

import { LegalPage, LegalSection } from "@/components/legal-page";
import { LINK } from "@/constants/links";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { createPageMetadata } from "@/seo/metadata";

const metadata = createPageMetadata({
  description: `${SITE.NAME} components are free under the MIT License. transition-kit Pro is licensed for personal, commercial, and client work.`,
  path: ROUTES.LICENSE,
  title: "License",
});

const LicensePage = () => (
  <LegalPage
    path={ROUTES.LICENSE}
    title="License"
    updated="Nov 19, 2026"
    intro={
      <p>
        The {SITE.NAME} component library is open source under the MIT License.
        transition-kit Pro components are commercial and come with their own
        license, summarized below.
      </p>
    }
  >
    <LegalSection title="Free components (MIT)">
      <p>
        Every component, transition and style not marked Pro. Use, copy, modify,
        and ship them anywhere, including commercial and client work. Keep the
        copyright notice with substantial copies of the code. The canonical text
        lives in the{" "}
        <a href={LINK.LICENSE} target="_blank" rel="noopener noreferrer">
          LICENSE file on GitHub
        </a>
        .
      </p>
    </LegalSection>
    <LegalSection title="transition-kit Pro (commercial)">
      <p>You can:</p>
      <ul>
        <li>Use Pro components in personal projects.</li>
        <li>
          Use them in commercial products and in work you build for clients.
        </li>
        <li>Modify the source and ship the finished apps however you like.</li>
      </ul>
      <p>You can&apos;t:</p>
      <ul>
        <li>
          Redistribute or resell the Pro source as a component library,
          template, starter kit, or shadcn registry.
        </li>
        <li>
          Publish the Pro source in a public repository, or share your API key
          outside your license.
        </li>
      </ul>
    </LegalSection>
    <LegalSection title="Seats and access">
      <ul>
        <li>
          <strong>Pro Annual</strong> is for one person. You can install Pro
          while your subscription is active; anything installed before it ends
          remains licensed for the projects you used it in.
        </li>
        <li>
          <strong>Lifetime</strong> is for one person, with Pro access that
          never expires, including future Pro components.
        </li>
        <li>
          <strong>Team</strong> is a Lifetime license for the number of seats
          bought (2 to 25), whose members share one team API key.
        </li>
      </ul>
      <p>
        Refunds and cancellations are covered in the{" "}
        <Link to={ROUTES.REFUNDS}>refund policy</Link> and{" "}
        <Link to={ROUTES.TERMS}>terms</Link>.
      </p>
    </LegalSection>
  </LegalPage>
);

export const Route = createFileRoute("/_site/license")({
  component: LicensePage,
  head: () => metadata,
});
