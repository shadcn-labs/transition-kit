export interface ProCatalogItem {
  name: string;
  title: string;
  description: string;
}

export const PRO_CATALOG: ProCatalogItem[] = [];

export const isProItem = (name: string) =>
  PRO_CATALOG.some((item) => item.name === name);
