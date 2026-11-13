"use client";

import { Link, useLocation } from "@tanstack/react-router";

import { DiscordIcon, GithubIcon, XIcon } from "@/components/icons";
import { LogoMark } from "@/components/logo";
import { LINK } from "@/constants/links";
import { ROUTES } from "@/constants/routes";
import { SITE, UTM_PARAMS } from "@/constants/site";
import { useFeedback } from "@/hooks/use-feedback";
import { addQueryParams } from "@/lib/url";
import { useThemeTransition } from "@/registry/theme/theme-transition";

interface FooterLink {
  external?: boolean;
  href: string;
  label: string;
}

const COLUMNS: { heading: string; links: FooterLink[] }[] = [
  {
    heading: "Components",
    links: [
      { href: ROUTES.DOCS_THEME, label: "Theme transitions" },
      { href: ROUTES.DOCS_PAGE, label: "Page transitions" },
      { href: ROUTES.DOCS_COMPONENTS, label: "UI components" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { href: ROUTES.DOCS, label: "Documentation" },
      { href: ROUTES.DOCS_INSTALLATION, label: "Installation" },
      { href: ROUTES.DOCS_REGISTRY, label: "Registry" },
      { href: ROUTES.DOCS_CHANGELOG, label: "Changelog" },
      { external: true, href: ROUTES.LLMS, label: "llms.txt" },
    ],
  },
  {
    heading: "Community",
    links: [
      { external: true, href: LINK.GITHUB, label: "GitHub" },
      { external: true, href: LINK.DISCORD, label: "Discord" },
      { external: true, href: LINK.X_SHADCN_LABS, label: "X" },
      { href: ROUTES.SPONSOR, label: "Sponsor" },
    ],
  },
  {
    heading: "Shadcn Labs",
    links: [
      {
        external: true,
        href: "https://editorcn.vercel.app",
        label: "editorcn",
      },
      { external: true, href: "https://pdfcn.dev", label: "pdfcn" },
      { external: true, href: "https://termcn.dev", label: "termcn" },
      { external: true, href: LINK.SHADCN_LABS, label: "All projects" },
    ],
  },
];

const SOCIALS = [
  { Icon: GithubIcon, href: LINK.GITHUB, label: "GitHub" },
  { Icon: DiscordIcon, href: LINK.DISCORD, label: "Discord" },
  { Icon: XIcon, href: LINK.X_SHADCN_LABS, label: "X" },
];

const YEAR = new Date().getFullYear();
const FOOTER_STYLES = ["circle-reveal", "wave-reveal", "clock-wipe"];

const LINK_CLASS =
  "text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 rounded-sm text-sm transition-colors outline-none focus-visible:ring-[3px]";

export const SiteFooter = () => {
  const playClick = useFeedback({ sound: "click" });
  const playToggle = useFeedback({ sound: "toggleOn" });
  const { toggleTheme } = useThemeTransition();
  const isHome = useLocation({
    select: (location) => location.pathname === ROUTES.HOME,
  });

  return (
    <footer
      className="group-has-[.docs-nav]/body:pb-20 group-has-[.docs-nav]/body:sm:pb-0 overflow-hidden border-t"
      data-slot="site-footer"
    >
      <div className={isHome ? "rail" : "rail-wide"}>
        <div className="flex flex-col items-start justify-between gap-3 border-b px-4 py-4 sm:flex-row sm:items-center md:px-6">
          <p className="text-muted-foreground text-sm">
            <span className="text-foreground font-medium">
              This footer is a demo too.
            </span>{" "}
            Flip the theme with:
          </p>
          <div className="grid w-full grid-cols-3 gap-1.5 sm:flex sm:w-auto">
            {FOOTER_STYLES.map((slug) => (
              <button
                key={slug}
                type="button"
                onClick={(event) => {
                  playToggle();
                  toggleTheme({ origin: event, transition: slug });
                }}
                className="text-muted-foreground hover:text-foreground hover:border-brand/40 focus-visible:ring-ring/50 h-8 cursor-pointer rounded-md border px-2 font-mono text-[0.7rem] transition-colors sm:h-7 sm:px-2.5 sm:text-xs outline-none focus-visible:ring-[3px]"
              >
                <span className="sm:hidden">{slug.split("-")[0]}</span>
                <span className="hidden sm:inline">{slug}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="bg-border grid grid-cols-2 gap-px border-b lg:grid-cols-5">
          <div className="bg-background col-span-2 flex flex-col gap-2 px-4 py-5 md:gap-3 md:p-8 lg:col-span-1">
            <span className="flex items-center gap-2 font-medium">
              <LogoMark className="fill-brand size-5" />
              transition-kit
            </span>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {SITE.DESCRIPTION.SHORT}. Built on React&apos;s{" "}
              <code className="font-mono text-[0.85em]">
                &lt;ViewTransition&gt;
              </code>
              .
            </p>
          </div>
          {COLUMNS.map((column) => (
            <div
              key={column.heading}
              className="bg-background px-4 py-5 md:p-8"
            >
              <h3 className="mb-3 text-sm font-medium md:mb-4">
                {column.heading}
              </h3>
              <ul className="flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={
                          link.href.startsWith("http")
                            ? addQueryParams(link.href, UTM_PARAMS)
                            : link.href
                        }
                        target="_blank"
                        rel="noreferrer"
                        onClick={playClick}
                        className={LINK_CLASS}
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        onClick={playClick}
                        viewTransition={{ types: ["nav-forward"] }}
                        className={LINK_CLASS}
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6 md:py-4">
          <p className="text-muted-foreground flex items-center gap-2 text-xs sm:text-sm">
            <LogoMark className="fill-brand hidden size-4 shrink-0 sm:block" />
            <span>
              © {YEAR} Shadcn Labs. Built by{" "}
              <a
                href={addQueryParams(LINK.PORTFOLIO, UTM_PARAMS)}
                target="_blank"
                rel="noreferrer"
                onClick={playClick}
                className="text-foreground font-medium underline-offset-4 hover:underline"
              >
                {SITE.AUTHOR.NAME}
              </a>
              .
            </span>
          </p>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {SOCIALS.map(({ href, Icon, label }) => (
              <a
                key={label}
                href={addQueryParams(href, UTM_PARAMS)}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                onClick={playClick}
                className="bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring/50 flex size-8 items-center justify-center rounded-md border transition-colors sm:size-9 outline-none focus-visible:ring-[3px]"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
