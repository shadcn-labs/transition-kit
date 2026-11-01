import type {
  Node as PageTreeNode,
  Root as PageTreeRoot,
} from "fumadocs-core/page-tree";

import { ROUTES } from "@/constants/routes";
import { EXCLUDED_SECTIONS, isComponentsFolder } from "@/lib/docs";

export type PageTreeFolder = Extract<PageTreeNode, { type: "folder" }>;
export type PageTreePage = Extract<PageTreeNode, { type: "page" }>;

export interface TreeGroup {
  label: string;
  pages: PageTreePage[];
}

export const getPagesFromFolder = (folder: PageTreeFolder): PageTreePage[] =>
  folder.children.filter(
    (child): child is PageTreePage => child.type === "page"
  );

export const getAllPagesFromFolder = (
  folder: PageTreeFolder
): PageTreePage[] => {
  const pages: PageTreePage[] = [];

  for (const child of folder.children) {
    if (child.type === "page") {
      pages.push(child);
    } else if (child.type === "folder") {
      pages.push(...getAllPagesFromFolder(child));
    }
  }

  return pages;
};

/** Folder names may be JSX; sidebar labels need text. */
const folderLabel = (folder: PageTreeFolder) =>
  typeof folder.name === "string" ? folder.name : String(folder.name);

/** Sort pages by display label. */
const byLabel = (a: PageTreePage, b: PageTreePage) =>
  String(typeof a.name === "string" ? a.name : "").localeCompare(
    String(typeof b.name === "string" ? b.name : "")
  );

/**
 * Sidebar groups below "Sections": the flat Components group (UI pages plus
 * the Theme/Page hub pages, sorted alphabetically), without the overview
 * pages, which the sections already link to.
 */
export const getTreeGroups = (tree: PageTreeRoot): TreeGroup[] => {
  const groups: TreeGroup[] = [];

  for (const item of tree.children) {
    if (item.type !== "folder" || EXCLUDED_SECTIONS.has(item.$id ?? "")) {
      continue;
    }

    if (isComponentsFolder(item)) {
      const overviewUrl = `${ROUTES.DOCS}/${item.$id}`;
      const rootPages = item.children.filter(
        (child): child is PageTreePage =>
          child.type === "page" && child.url !== overviewUrl
      );
      const hubPages: PageTreePage[] = [];
      for (const child of item.children) {
        if (child.type !== "folder") {
          continue;
        }
        const hub = getAllPagesFromFolder(child).find(
          (page) => page.url === `${ROUTES.DOCS}/${child.$id}`
        );
        if (hub) {
          hubPages.push(hub);
        }
      }
      const pages = [...rootPages, ...hubPages].toSorted(byLabel);
      if (pages.length > 0) {
        groups.push({ label: folderLabel(item), pages });
      }
      continue;
    }

    const pages = getAllPagesFromFolder(item);
    if (pages.length > 0) {
      groups.push({ label: folderLabel(item), pages });
    }
  }

  return groups;
};
