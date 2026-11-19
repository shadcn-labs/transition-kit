export interface ProCatalogItem {
  name: string;
  title: string;
  description: string;
}

export const PRO_CATALOG: ProCatalogItem[] = [
  {
    description:
      "A photo grid whose thumbnail grows into a full-screen view, slides between photos in the direction you swipe and folds back into its place.",
    name: "lightbox",
    title: "Lightbox",
  },
];

export const isProItem = (name: string) =>
  PRO_CATALOG.some((item) => item.name === name);
