import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  useLocation,
} from "@tanstack/react-router";
import { SoundProvider } from "@web-kits/audio/react";

import { NotFound } from "@/components/not-found";
import { Toaster } from "@/components/ui/sonner";
import { ROUTES } from "@/constants/routes";
import { META_THEME_COLORS } from "@/constants/site";
import "@/lib/fonts";
import { cn } from "@/lib/utils";
import { items } from "@/registry/items";
import {
  ThemeTransitionProvider,
  ThemeTransitionScript,
} from "@/registry/theme/theme-transition";
import { JsonLdScripts } from "@/seo/json-ld";
import { baseMetadata } from "@/seo/metadata";

import "@/styles/globals.css";

// Every core, component and style stylesheet, so new registry CSS works without edits.
import.meta.glob(["/registry/*/*.css", "/registry/*/styles/*.css"], {
  eager: true,
});

const THEME_STYLE_PREFIX = `${ROUTES.DOCS_COMPONENTS}/theme-transition/`;

/**
 * On a theme style page, the whole site toggles with that style. Everywhere
 * else it uses the default.
 */
const themeTransitionForPathname = (pathname: string) => {
  const slug = pathname.startsWith(THEME_STYLE_PREFIX)
    ? pathname
        .slice(THEME_STYLE_PREFIX.length)
        .split("/")[0]
        .replace(/\.md$/, "")
    : "";
  const known = items.some(
    (item) => item.kind === "style" && item.name === `theme/${slug}`
  );
  return known ? slug : "circle-reveal";
};

const RootDocument = () => {
  const pathname = useLocation({ select: (location) => location.pathname });
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <ThemeTransitionScript />
        <JsonLdScripts />
        <meta name="theme-color" content={META_THEME_COLORS.light} />
        <script
          // oxlint-disable-next-line react/no-danger -- sets the browser chrome color before hydration
          dangerouslySetInnerHTML={{
            __html: `try { if (document.documentElement.classList.contains('dark')) { document.querySelector('meta[name="theme-color"]').setAttribute('content', '${META_THEME_COLORS.dark}') } } catch {}`,
          }}
        />
      </head>
      <body
        className={cn(
          "text-foreground group/body overscroll-none font-sans antialiased [--footer-height:--spacing(14)] [--header-height:--spacing(14)] xl:[--footer-height:--spacing(24)]"
        )}
      >
        <SoundProvider>
          <ThemeTransitionProvider
            transition={themeTransitionForPathname(pathname)}
          >
            <Outlet />
            <Toaster position="top-center" />
          </ThemeTransitionProvider>
        </SoundProvider>
        <Scripts />
      </body>
    </html>
  );
};

export const Route = createRootRoute({
  component: RootDocument,
  head: () => baseMetadata,
  notFoundComponent: NotFound,
});
