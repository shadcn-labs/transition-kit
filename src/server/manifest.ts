import { ROUTES } from "@/constants/routes";
import { META_THEME_COLORS, SITE } from "@/constants/site";

export const manifest = () => ({
  background_color: META_THEME_COLORS.light,
  description: SITE.DESCRIPTION.SHORT,
  display: "standalone",
  icons: [
    {
      sizes: "192x192",
      src: "/android-chrome-192x192.png",
      type: "image/png",
    },
    {
      sizes: "512x512",
      src: "/android-chrome-512x512.png",
      type: "image/png",
    },
  ],
  name: SITE.NAME,
  short_name: SITE.NAME,
  start_url: ROUTES.HOME,
  theme_color: META_THEME_COLORS.light,
});

export const GET = () =>
  Response.json(manifest(), {
    headers: {
      "Cache-Control": "public, max-age=0, must-revalidate",
      "Content-Type": "application/manifest+json",
    },
  });
