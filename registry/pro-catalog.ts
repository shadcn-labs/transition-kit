export interface ProCatalogItem {
  name: string;
  title: string;
  description: string;
}

export const PRO_CATALOG: ProCatalogItem[] = [
  {
    description:
      "A photo grid or masonry wall whose thumbnail grows into a full-screen view, with a filmstrip, swipe and keyboard navigation that slide in the direction you move, and a fold back into place.",
    name: "lightbox",
    title: "Lightbox",
  },
];

export const isProItem = (name: string) =>
  PRO_CATALOG.some((item) => item.name === name);
