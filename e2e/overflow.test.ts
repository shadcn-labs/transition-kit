import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { ROUTES } from "@/constants/routes";

const SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9";

/** Paths of every page in the site's sitemap, which lists the home page, the static pages and every docs page. */
const getSitemapPaths = async (page: Page) => {
  const response = await page.request.get(ROUTES.SITEMAP);
  expect(response.ok(), `GET ${ROUTES.SITEMAP}`).toBe(true);
  const locations = await page.evaluate(
    ({ namespace, xml }) => {
      const sitemap = new DOMParser().parseFromString(xml, "application/xml");
      if (sitemap.querySelector("parsererror")) {
        throw new Error("sitemap.xml is not well-formed XML");
      }
      return [...sitemap.getElementsByTagNameNS(namespace, "loc")].map(
        (loc) => loc.textContent?.trim() ?? ""
      );
    },
    { namespace: SITEMAP_NS, xml: await response.text() }
  );
  // Locations use the production origin; only the path matters here.
  return [...new Set(locations.map((location) => new URL(location).pathname))];
};

/**
 * Scrolls down a screen at a time so demos that mount on view render, then
 * returns to the top and waits for fonts, images and finite animations.
 */
const renderWholePage = (page: Page) =>
  page.evaluate(async () => {
    const nextFrame = () =>
      // oxlint-disable-next-line promise/avoid-new -- requestAnimationFrame has no promise form
      new Promise((resolve) => {
        requestAnimationFrame(resolve);
      });
    const root = document.documentElement;
    // scrollHeight is re-read each step: mounted demos make the page taller.
    for (let top = 0; top < root.scrollHeight; top += window.innerHeight) {
      window.scrollTo({ behavior: "instant", top });
      // One frame for the IntersectionObserver callbacks, one for React's commit.
      await nextFrame();
      await nextFrame();
    }
    window.scrollTo({ behavior: "instant", top: 0 });
    await document.fonts.ready;
    await Promise.all(
      [...document.images]
        .filter((image) => !image.complete && image.checkVisibility())
        .map((image) => image.decode().catch(() => null))
    );
    await Promise.all(
      document
        .getAnimations()
        .filter(
          (animation) =>
            animation.playState === "running" &&
            animation.timeline === document.timeline &&
            animation.effect?.getComputedTiming().endTime !== Infinity
        )
        .map((animation) => animation.finished.catch(() => null))
    );
  });

/**
 * How far the page scrolls sideways, and what extends past the right edge of
 * the viewport without a scroll or clip container inside the page to hold it.
 * The site layout clips horizontal overflow, so the second list also catches
 * content that is cut off rather than scrollable.
 */
const measureOverflow = (page: Page) =>
  page.evaluate(() => {
    const root = document.documentElement;
    const viewportWidth = root.clientWidth;
    const main = document.querySelector("main");
    const scrollsSidewaysBy = Math.max(0, root.scrollWidth - viewportWidth);

    const hasKeyword = (value: string, keywords: string[]) =>
      value.split(/[\s,]+/).some((keyword) => keywords.includes(keyword));
    // Properties that make an element the containing block of fixed (and absolute) descendants.
    const containsFixed = (style: CSSStyleDeclaration) =>
      style.transform !== "none" ||
      style.translate !== "none" ||
      style.rotate !== "none" ||
      style.scale !== "none" ||
      style.perspective !== "none" ||
      style.filter !== "none" ||
      style.backdropFilter !== "none" ||
      style.containerType !== "normal" ||
      hasKeyword(style.contain, ["layout", "paint", "strict", "content"]) ||
      hasKeyword(style.willChange, [
        "transform",
        "translate",
        "rotate",
        "scale",
        "perspective",
        "filter",
      ]);
    const clips = (style: CSSStyleDeclaration) =>
      style.display !== "inline" &&
      (style.overflowX !== "visible" ||
        hasKeyword(style.contain, ["paint", "strict", "content"]));
    // The site layout and anything else wrapping <main> clip for the whole page.
    const isPageLevel = (element: Element) =>
      element === root ||
      element === document.body ||
      (main !== null && element.contains(main));

    /**
     * Whether a box with this `position`, placed in `container`, overflows
     * into the page rather than being held by a scroll or clip container, or
     * being fixed to the viewport. Follows the containing block chain: an
     * absolutely positioned box escapes clipping ancestors below its
     * containing block.
     */
    const reachesPage = (container: Element | null, boxPosition: string) => {
      let position = boxPosition;
      for (let node = container; node; node = node.parentElement) {
        const style = getComputedStyle(node);
        const isContainingBlock =
          position === "fixed"
            ? containsFixed(style)
            : position !== "absolute" ||
              style.position !== "static" ||
              containsFixed(style);
        if (style.display === "contents" || !isContainingBlock) {
          continue;
        }
        if (clips(style) && !isPageLevel(node)) {
          return false;
        }
        ({ position } = style);
      }
      return position !== "fixed";
    };

    const isPastEdge = (rect: DOMRect) => rect.right - viewportWidth > 0.5;
    const isAncestorOrSelf = (elements: Set<Element>, element: Element) => {
      for (
        let node: Element | null = element;
        node;
        node = node.parentElement
      ) {
        if (elements.has(node)) {
          return true;
        }
      }
      return false;
    };

    // Element boxes past the edge.
    const boxes = new Set(
      [...document.body.querySelectorAll("*")].filter(
        (element) =>
          isPastEdge(element.getBoundingClientRect()) &&
          reachesPage(element.parentElement, getComputedStyle(element).position)
      )
    );
    // Report the outermost: it sets the width, its descendants follow it.
    const outermostBoxes = [...boxes].filter(
      (element) =>
        !element.parentElement ||
        !isAncestorOrSelf(boxes, element.parentElement)
    );

    // Text past the edge of a box that fits, e.g. an unbreakable string.
    const textParents = new Map<Element, number>();
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT
    );
    const range = document.createRange();
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const parent = node.parentElement;
      if (
        !parent ||
        !node.textContent?.trim() ||
        textParents.has(parent) ||
        isAncestorOrSelf(boxes, parent)
      ) {
        continue;
      }
      range.selectNodeContents(node);
      const rect = range.getBoundingClientRect();
      // Text is in flow, so its own element can clip it too.
      if (isPastEdge(rect) && reachesPage(parent, "static")) {
        textParents.set(parent, rect.right);
      }
    }

    // Hidden content and decoration may extend into the clipped edge, as long
    // as the page does not scroll.
    const isProblem = (element: Element) =>
      scrollsSidewaysBy > 0 ||
      (element.checkVisibility({
        opacityProperty: true,
        visibilityProperty: true,
      }) &&
        !element.closest('[aria-hidden="true"]'));
    const describe = (element: Element, kind: string, right: number) => {
      const id = element.id ? `#${element.id}` : "";
      const classes = [...element.classList]
        .slice(0, 4)
        .map((name) => `.${name}`)
        .join("");
      const text = element.textContent?.replaceAll(/\s+/g, " ").trim() ?? "";
      const snippet = text
        ? ` "${text.slice(0, 40)}${text.length > 40 ? "…" : ""}"`
        : "";
      return `<${element.localName}${id}${classes}>${snippet}: ${kind} ends at ${Math.round(right)}px`;
    };

    return {
      pastRightEdge: [
        ...outermostBoxes
          .filter(isProblem)
          .map((element) =>
            describe(element, "box", element.getBoundingClientRect().right)
          ),
        ...[...textParents]
          .filter(([element]) => isProblem(element))
          .map(([element, right]) => describe(element, "text", right)),
      ],
      scrollsSidewaysBy,
    };
  });

test("no page is wider than the viewport", async ({ page }, testInfo) => {
  const paths = await getSitemapPaths(page);
  expect(paths).toEqual(
    expect.arrayContaining([ROUTES.HOME, ROUTES.DOCS_COMPONENTS])
  );
  test.setTimeout(paths.length * 5000);

  for (const path of paths) {
    await test.step(path, async () => {
      // Docs content is a lazily loaded chunk that renders after `load`.
      await page.goto(path, { waitUntil: "networkidle" });
      await renderWholePage(page);
      expect
        .soft(
          await measureOverflow(page),
          `${path} at ${testInfo.project.name}`
        )
        .toEqual({ pastRightEdge: [], scrollsSidewaysBy: 0 });
    });
  }
});
