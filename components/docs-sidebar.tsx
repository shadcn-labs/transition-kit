"use client";

import { Link, useLocation } from "@tanstack/react-router";
import type { Root as PageTreeRoot } from "fumadocs-core/page-tree";

import { ScrollFade } from "@/components/scroll-fade";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { TOP_LEVEL_SECTIONS } from "@/constants/nav";
import { ROUTES } from "@/constants/routes";
import { NEW_DOCS_URLS } from "@/lib/docs";
import { getTreeGroups } from "@/lib/page-tree";

/** Docs URLs flagged as new, marked with a dot in the sidebar. */
const PAGES_NEW = NEW_DOCS_URLS;

/** The section whose URL is the longest prefix of the current path. */
const activeSectionHref = (pathname: string) =>
  TOP_LEVEL_SECTIONS.map(({ href }) => href)
    .filter((href) =>
      href === ROUTES.DOCS
        ? pathname === href
        : pathname === href || pathname.startsWith(`${href}/`)
    )
    .toSorted((a, b) => b.length - a.length)[0];

const MENU_BUTTON_CLS =
  "relative h-[30px] w-fit overflow-visible text-[0.8rem] text-muted-foreground font-normal hover:bg-transparent hover:text-foreground active:bg-transparent after:absolute after:inset-x-0 after:-inset-y-1 after:z-0 after:rounded-md data-[active=true]:bg-transparent data-[active=true]:font-medium data-[active=true]:text-foreground";
const GROUP_LABEL_CLS =
  "text-muted-foreground h-auto px-2 text-[0.68rem] font-medium tracking-widest uppercase";

const MENU_CLS = "mt-1 ml-2 border-l pl-2";

/** Glides to the clicked link: globals.css names it during `nav-sidebar` navigations. */
const ActiveIndicator = ({ kind }: { kind: "page" | "section" }) => (
  <span
    aria-hidden="true"
    data-sidebar-indicator={kind}
    className="bg-brand absolute top-1.5 bottom-1.5 -left-[9.5px] w-0.5 rounded-full"
  />
);

const SidebarMenuItemLink = ({
  href,
  isActive,
  kind = "page",
  children,
}: {
  href: string;
  isActive: boolean;
  kind?: "page" | "section";
  children: React.ReactNode;
}) => (
  <SidebarMenuItem>
    <SidebarMenuButton asChild className={MENU_BUTTON_CLS} isActive={isActive}>
      <Link to={href} viewTransition={{ types: ["nav-sidebar"] }}>
        <span className="absolute inset-0 flex w-(--sidebar-menu-width) bg-transparent" />
        {isActive && <ActiveIndicator kind={kind} />}
        {children}
        {PAGES_NEW.has(href) && (
          <span className="bg-brand/15 text-brand rounded-full px-1.5 text-[0.65rem] leading-4 font-medium">
            new
          </span>
        )}
      </Link>
    </SidebarMenuButton>
  </SidebarMenuItem>
);

const SidebarPageGroup = ({
  label,
  pages,
  pathname,
}: {
  label: React.ReactNode;
  pages: { url: string; name: React.ReactNode }[];
  pathname: string;
}) => {
  if (pages.length === 0) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className={GROUP_LABEL_CLS}>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className={MENU_CLS}>
          {pages.map((page) => (
            <SidebarMenuItemLink
              key={page.url}
              href={page.url}
              isActive={page.url === pathname}
            >
              {page.name}
            </SidebarMenuItemLink>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export const DocsSidebar = ({
  tree,
  ...props
}: React.ComponentProps<typeof Sidebar> & { tree: PageTreeRoot }) => {
  const pathname = useLocation({ select: (location) => location.pathname });
  const treeGroups = getTreeGroups(tree);
  const activeSection = activeSectionHref(pathname);

  return (
    <Sidebar
      className="text-sidebar-foreground sticky top-(--header-height) z-30 hidden h-[calc(100svh-var(--header-height))] w-full flex-col overscroll-none bg-transparent [--sidebar-menu-width:--spacing(48)] lg:flex"
      collapsible="none"
      {...props}
    >
      <ScrollFade className="flex-1">
        <SidebarContent className="flex-none overflow-visible px-3 py-4">
          <SidebarGroup>
            <SidebarGroupLabel className={GROUP_LABEL_CLS}>
              Sections
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className={MENU_CLS}>
                {TOP_LEVEL_SECTIONS.map(({ name, href }) => (
                  <SidebarMenuItemLink
                    key={name}
                    href={href}
                    isActive={href === activeSection}
                    kind="section"
                  >
                    {name}
                  </SidebarMenuItemLink>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          {treeGroups.map((group) => (
            <SidebarPageGroup
              key={group.label}
              label={group.label}
              pages={group.pages}
              pathname={pathname}
            />
          ))}
        </SidebarContent>
      </ScrollFade>
    </Sidebar>
  );
};
