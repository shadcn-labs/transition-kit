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

/**
 * Sidebar groups below "Sections": one per component group (Theme, Page, UI),
 * without the group overview pages, which the sections already link to.
 */
export const getTreeGroups = (tree: PageTreeRoot): TreeGroup[] => {
  const groups: TreeGroup[] = [];

  for (const item of tree.children) {
    if (item.type !== "folder" || EXCLUDED_SECTIONS.has(item.$id ?? "")) {
      continue;
    }

    if (isComponentsFolder(item)) {
      for (const child of item.children) {
        if (child.type !== "folder") {
          continue;
        }
        // The overview is the folder index, or a page when meta.json lists "index".
        const overviewUrl = `${ROUTES.DOCS}/${child.$id}`;
        const pages = getAllPagesFromFolder(child).filter(
          (page) => page.url !== overviewUrl
        );
        if (pages.length > 0) {
          groups.push({ label: folderLabel(child), pages });
        }
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
