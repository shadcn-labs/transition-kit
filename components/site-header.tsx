"use client";

import { useLocation } from "@tanstack/react-router";

import { BrandContextMenu } from "@/components/brand-context-menu";
import { CommandMenu } from "@/components/command-menu";
import { LabsNav } from "@/components/labs-nav";
import { LogoMark } from "@/components/logo";
import { MainNav } from "@/components/main-nav";
import { MobileNav } from "@/components/mobile-nav";
import { NavItemGithub } from "@/components/nav-item-github";
import { useSiteData } from "@/components/site-data";
import { SiteSettings } from "@/components/site-settings";
import { SponsorLink } from "@/components/sponsor-link";
import { Button } from "@/components/ui/button";
import { LINK } from "@/constants/links";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const navItems = [
  { href: ROUTES.DOCS, label: "Docs" },
  { href: ROUTES.DOCS_COMPONENTS, label: "Components" },
  { href: ROUTES.SPONSOR, label: "Sponsors" },
];

const CELL = "flex items-center border-l";

export const SiteHeader = () => {
  const { tree } = useSiteData();
  const isHome = useLocation({
    select: (location) => location.pathname === ROUTES.HOME,
  });

  return (
    <header
      className="bg-background/85 sticky top-0 z-50 w-full border-b backdrop-blur-lg"
      data-slot="site-header"
    >
      <div
        className={cn(
          "flex h-(--header-height) items-stretch",
          isHome ? "rail" : "rail-wide"
        )}
      >
        <div className="flex items-center border-r px-3 lg:hidden">
          <MobileNav items={navItems} tree={tree} />
        </div>
        <div className="flex min-w-0 items-center border-r pr-3 pl-1.5">
          <BrandContextMenu>
            <Button
              asChild
              variant="ghost"
              size="icon-sm"
              className="hover:bg-transparent focus-visible:bg-transparent dark:hover:bg-transparent lg:size-9"
              sound="click"
            >
              <a
                href={LINK.SHADCN_LABS}
                target="_blank"
                rel="noopener noreferrer"
              >
                <LogoMark className="size-5" />
                <span className="sr-only">Shadcn Labs</span>
              </a>
            </Button>
          </BrandContextMenu>
          <span className="text-muted-foreground/50 ml-1">/</span>
          <LabsNav />
        </div>
        <MainNav items={navItems} className="hidden lg:flex" />

        <div className="ml-auto flex items-stretch">
          <div className={cn(CELL, "hidden px-2 md:flex")}>
            <CommandMenu navItems={navItems} tree={tree} />
          </div>
          <div className={cn(CELL, "hidden px-1 sm:flex")}>
            <NavItemGithub />
          </div>
          <div className={cn(CELL, "px-1")}>
            <SiteSettings />
          </div>
          <div className={cn(CELL, "px-2")}>
            <SponsorLink />
          </div>
        </div>
      </div>
    </header>
  );
};
