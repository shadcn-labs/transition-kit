import { GITHUB, LINK } from "@/constants/links";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";

const AUTHOR = {
  "@type": "Person",
  name: SITE.AUTHOR.NAME,
  url: LINK.PORTFOLIO,
} as const;

const PUBLISHER = {
  "@type": "Organization",
  logo: `${SITE.URL}/android-chrome-512x512.png`,
  name: "Shadcn Labs",
  sameAs: [LINK.X_SHADCN_LABS, `https://github.com/${GITHUB.org}`],
  url: LINK.SHADCN_LABS,
} as const;

const JsonLdScript = ({ data }: { data: Record<string, unknown> }) => (
  <script
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    type="application/ld+json"
  />
);

export const WebsiteJsonLd = () => (
  <JsonLdScript
    data={{
      "@context": "https://schema.org",
      "@type": "WebSite",
      description: SITE.DESCRIPTION.LONG,
      inLanguage: "en-US",
      name: SITE.NAME,
      publisher: PUBLISHER,
      url: SITE.URL,
    }}
  />
);

export const SoftwareSourceCodeJsonLd = () => (
  <JsonLdScript
    data={{
      "@context": "https://schema.org",
      "@type": "SoftwareSourceCode",
      applicationCategory: "DeveloperApplication",
      author: AUTHOR,
      codeRepository: LINK.GITHUB,
      description: SITE.DESCRIPTION.LONG,
      isAccessibleForFree: true,
      keywords: SITE.KEYWORDS,
      license: LINK.LICENSE,
      maintainer: PUBLISHER,
      name: SITE.NAME,
      offers: {
        "@type": "Offer",
        availability: "https://schema.org/InStock",
        price: "0",
        priceCurrency: "USD",
      },
      programmingLanguage: ["TypeScript", "CSS"],
      publisher: PUBLISHER,
      runtimePlatform: "React 19.3",
      url: SITE.URL,
    }}
  />
);

export const OrganizationJsonLd = () => (
  <JsonLdScript data={{ "@context": "https://schema.org", ...PUBLISHER }} />
);

export const BreadcrumbJsonLd = ({
  items,
}: {
  items: { name: string; path: string }[];
}) => (
  <JsonLdScript
    data={{
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        item: `${SITE.URL}${item.path.startsWith(ROUTES.HOME) ? item.path : `${ROUTES.HOME}${item.path}`}`,
        name: item.name,
        position: index + 1,
      })),
    }}
  />
);

export const JsonLdScripts = () => (
  <>
    <WebsiteJsonLd />
    <SoftwareSourceCodeJsonLd />
    <OrganizationJsonLd />
  </>
);
