import type { ComponentProps } from "react";

import { LINK } from "@/constants/links";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";

interface CreatePageMetadataOptions {
  description?: string;
  noIndex?: boolean;
  ogDescription?: string;
  ogImageAlt?: string;
  ogTitle?: string;
  ogType?: "article" | "website";
  path: string;
  title: string;
}

type HeadMeta =
  | { title: string }
  | { charSet: string }
  | { name: string; content: string }
  | { property: string; content: string };

export interface PageHead {
  links: ComponentProps<"link">[];
  meta: HeadMeta[];
}

export const createPageMetadata = ({
  description,
  noIndex = false,
  ogDescription,
  ogImageAlt,
  ogTitle,
  ogType = "website",
  path,
  title,
}: CreatePageMetadataOptions): PageHead => {
  const canonical = path.startsWith(ROUTES.HOME)
    ? path
    : `${ROUTES.HOME}${path}`;
  const markdownAlternate =
    canonical === ROUTES.DOCS || canonical.startsWith(`${ROUTES.DOCS}/`)
      ? `${canonical}.md`
      : undefined;
  const resolvedTitle = ogTitle ?? title;
  const socialDescription = ogDescription ?? description;

  const meta: HeadMeta[] = [
    { title: `${title} | ${SITE.NAME}` },
    ...(description ? [{ content: description, name: "description" }] : []),
    { content: resolvedTitle, property: "og:title" },
    ...(socialDescription
      ? [{ content: socialDescription, property: "og:description" }]
      : []),
    { content: `${SITE.URL}${canonical}`, property: "og:url" },
    { content: SITE.NAME, property: "og:site_name" },
    { content: "en_US", property: "og:locale" },
    { content: ogType, property: "og:type" },
    { content: SITE.OG_IMAGE, property: "og:image" },
    { content: "image/webp", property: "og:image:type" },
    { content: "5760", property: "og:image:width" },
    { content: "4320", property: "og:image:height" },
    { content: ogImageAlt ?? resolvedTitle, property: "og:image:alt" },
    { content: "summary_large_image", name: "twitter:card" },
    { content: SITE.AUTHOR.TWITTER, name: "twitter:site" },
    { content: SITE.AUTHOR.TWITTER, name: "twitter:creator" },
    { content: resolvedTitle, name: "twitter:title" },
    ...(socialDescription
      ? [{ content: socialDescription, name: "twitter:description" }]
      : []),
    { content: SITE.OG_IMAGE, name: "twitter:image" },
    ...(noIndex ? [{ content: "noindex, nofollow", name: "robots" }] : []),
  ];

  return {
    links: [
      { href: `${SITE.URL}${canonical}`, rel: "canonical" },
      ...(markdownAlternate
        ? [
            {
              href: `${SITE.URL}${markdownAlternate}`,
              rel: "alternate",
              type: "text/markdown",
            },
          ]
        : []),
    ],
    meta,
  };
};

const siteHead = createPageMetadata({
  description: SITE.DESCRIPTION.LONG,
  path: ROUTES.HOME,
  title: SITE.NAME,
});

export const homepageMetadata: PageHead = {
  ...siteHead,
  meta: [
    { title: `${SITE.NAME} - ${SITE.DESCRIPTION.SHORT}` },
    ...siteHead.meta.slice(1),
  ],
};

export const baseMetadata: PageHead = {
  links: [
    { href: LINK.PORTFOLIO, rel: "author" },
    { href: ROUTES.MANIFEST, rel: "manifest" },
    {
      href: "/apple-touch-icon.png",
      rel: "apple-touch-icon",
      sizes: "180x180",
      type: "image/png",
    },
    { href: "/favicon.ico", rel: "icon", sizes: "any" },
    {
      href: "/favicon-32x32.png",
      rel: "icon",
      sizes: "32x32",
      type: "image/png",
    },
    {
      href: "/favicon-16x16.png",
      rel: "icon",
      sizes: "16x16",
      type: "image/png",
    },
  ],
  meta: [
    { charSet: "utf-8" },
    { content: "width=device-width, initial-scale=1", name: "viewport" },
    { title: `${SITE.NAME} - ${SITE.DESCRIPTION.SHORT}` },
    ...siteHead.meta.slice(1),
    { content: SITE.NAME, name: "application-name" },
    { content: SITE.AUTHOR.NAME, name: "author" },
    { content: SITE.AUTHOR.NAME, name: "creator" },
    { content: "Shadcn Labs", name: "publisher" },
    { content: "technology", name: "category" },
    { content: SITE.KEYWORDS.join(","), name: "keywords" },
    { content: "yes", name: "apple-mobile-web-app-capable" },
    { content: "default", name: "apple-mobile-web-app-status-bar-style" },
    { content: SITE.NAME, name: "apple-mobile-web-app-title" },
  ],
};
