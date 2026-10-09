import { createFileRoute, Outlet, useLoaderData } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { visit } from "fumadocs-core/page-tree";
import { deserializePageTree } from "fumadocs-core/source/client";
import { useMemo } from "react";

import { SiteDataProvider } from "@/components/site-data";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WebMcpTools } from "@/components/web-mcp-tools";
import { AGENT_DOCS_DIRECTIVE_TEXT } from "@/lib/agent-discovery/directive";
import { getStargazerCount } from "@/lib/github";
import { source } from "@/lib/source";

const SITE_CACHE_CONTROL =
  "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800";

const loadSiteData = createServerFn({ method: "GET" }).handler(async () => {
  const names: (string | null)[] = [];
  visit(source.pageTree, (node) => {
    names.push(typeof node.name === "string" ? node.name : null);
  });
  return {
    names,
    stars: await getStargazerCount(),
    tree: await source.serializePageTree(source.pageTree),
  };
});

const SiteLayout = () => {
  const serialized = useLoaderData({ from: "/_site" });
  const data = useMemo(() => {
    const tree = deserializePageTree(structuredClone(serialized.tree));
    let index = 0;
    // Fumadocs wraps every name in JSX; preserve string labels for search and folder lookup.
    visit(tree, (node) => {
      const name = serialized.names[index];
      index += 1;
      if (name !== null && name !== undefined) {
        node.name = name;
      }
    });
    return { stars: serialized.stars, tree };
  }, [serialized]);
  return (
    <SiteDataProvider value={data}>
      <div className="bg-background relative flex min-h-svh flex-col">
        <blockquote className="sr-only">{AGENT_DOCS_DIRECTIVE_TEXT}</blockquote>
        <WebMcpTools />
        <SiteHeader />
        <main className="flex flex-1 flex-col">
          <Outlet />
        </main>
        <SiteFooter />
      </div>
    </SiteDataProvider>
  );
};
export const Route = createFileRoute("/_site")({
  component: SiteLayout,
  headers: () => ({ "Cache-Control": SITE_CACHE_CONTROL, Vary: "Accept" }),
  loader: () => loadSiteData(),
});
