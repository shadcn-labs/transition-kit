import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { source } from "@/lib/source";

interface SitemapEntry {
  changeFrequency: "monthly" | "weekly";
  lastModified: Date;
  priority: number;
  url: string;
}

export const sitemap = (): SitemapEntry[] => {
  const staticPages: SitemapEntry[] = [
    {
      changeFrequency: "monthly",
      lastModified: new Date(),
      priority: 1,
      url: SITE.URL,
    },
    {
      changeFrequency: "monthly",
      lastModified: new Date(),
      priority: 0.5,
      url: `${SITE.URL}${ROUTES.SPONSOR}`,
    },
  ];

  const docPages: SitemapEntry[] = source.getPages().map((page) => ({
    changeFrequency: "weekly",
    lastModified: new Date(),
    priority: page.url === ROUTES.DOCS ? 0.9 : 0.8,
    url: `${SITE.URL}${page.url}`,
  }));

  return [...staticPages, ...docPages];
};

const escapeXml = (value: string) =>
  value.replaceAll(/[<>&'"]/g, (character) => {
    switch (character) {
      case "<": {
        return "&lt;";
      }
      case ">": {
        return "&gt;";
      }
      case "&": {
        return "&amp;";
      }
      case "'": {
        return "&apos;";
      }
      default: {
        return "&quot;";
      }
    }
  });

export const GET = () => {
  const entries = sitemap()
    .map(
      (entry) => `<url>
<loc>${escapeXml(entry.url)}</loc>
<lastmod>${entry.lastModified.toISOString()}</lastmod>
<changefreq>${entry.changeFrequency}</changefreq>
<priority>${entry.priority}</priority>
</url>`
    )
    .join("\n");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`,
    {
      headers: {
        "Cache-Control": "public, max-age=0, must-revalidate",
        "Content-Type": "application/xml",
      },
    }
  );
};
