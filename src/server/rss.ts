import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { source } from "@/lib/source";

const escapeCdata = (value: string) =>
  value.replaceAll("]]>", "]]]]><![CDATA[>");

export const GET = () => {
  const items = source
    .getPages()
    .map((page) => {
      const link = `${SITE.URL}${page.url}`;

      return `    <item>
      <title><![CDATA[${escapeCdata(page.data.title)}]]></title>
      <link>${link}</link>
      <guid>${link}</guid>
      <description><![CDATA[${escapeCdata(page.data.description ?? "")}]]></description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE.NAME}</title>
    <link>${SITE.URL}</link>
    <description>${SITE.DESCRIPTION.SHORT}</description>
    <language>en-us</language>
    <atom:link href="${SITE.URL}${ROUTES.RSS}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
};
