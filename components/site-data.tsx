import type { Root as PageTreeRoot } from "fumadocs-core/page-tree";
import { createContext, useContext } from "react";
import type { ReactNode } from "react";

interface SiteData {
  tree: PageTreeRoot;
  stars: number;
}

const SiteDataContext = createContext<SiteData | null>(null);

export const SiteDataProvider = ({
  value,
  children,
}: {
  value: SiteData;
  children: ReactNode;
}) => (
  <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>
);

export const useSiteData = () => {
  const data = useContext(SiteDataContext);
  if (!data) {
    throw new Error("Site data must be loaded before rendering the site.");
  }
  return data;
};
