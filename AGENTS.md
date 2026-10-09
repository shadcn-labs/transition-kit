# AGENTS.md

transition-kit is a [Shadcn Labs](https://shadcn-labs.com) registry of theme, page and UI transitions for React, built on React 19.3's `<ViewTransition>`, `startTransition` and `addTransitionType`. The docs site is TanStack Start + Vite + Fumadocs, deployed to Cloudflare Workers. Its UI mirrors [pdfcn](https://github.com/shadcn-labs/pdfcn).

## Commands

```bash
pnpm dev              # docs site on :3000
pnpm registry:build   # registry/items.ts -> registry.json -> public/r/**.json
pnpm build            # registry + production build
pnpm deploy           # build + wrangler deploy
pnpm typecheck
pnpm check / pnpm fix # ultracite (oxlint + oxfmt)
```

## Layout

| Path                                    | Holds                                                                                                                                                        |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `registry/items.ts`                     | Item catalog. `registry.json` is generated from it; never edit `registry.json` by hand.                                                                      |
| `registry/theme/theme-transition.tsx`   | Theme core: `ThemeTransitionProvider`, `useThemeTransition`, `ThemeTransitionScript`.                                                                        |
| `registry/theme/theme-transition.css`   | Rules shared by every theme style.                                                                                                                           |
| `registry/theme/<component>.tsx`        | Ready-made theme controls built on the core.                                                                                                                 |
| `registry/theme/styles/<slug>.css`      | One theme style. Shipped as the item's `css`.                                                                                                                |
| `registry/page/page-transition.tsx`     | Page core: `PageTransition`, `navigateWithTransition`.                                                                                                       |
| `registry/page/page-transition.css`     | Rules shared by every page style.                                                                                                                            |
| `registry/page/styles/<slug>.css`       | One page style. Shipped as the item's `css`.                                                                                                                 |
| `registry/ui/ui-transition.ts`          | UI core: `tk()`, `useTransitionNames`, `FORWARD`/`BACK` transition types.                                                                                    |
| `registry/ui/ui-transition.css`         | The composable `tk-*` View Transition Classes and `--tk-ui-*` settings.                                                                                      |
| `registry/ui/<name>.tsx` / `.css`       | One UI component, plus optional component CSS shipped as the item's `css`.                                                                                   |
| `examples/<group>/*.tsx`                | Docs demos rendered by `<ComponentPreview>`; UI demos are `examples/ui/<slug>-demo.tsx`, exporting `<Slug>Demo` (the home showcase finds them by that name). |
| `content/docs/components/<group>/*.mdx` | One docs page per item; list it in that folder's `meta.json`.                                                                                                |

Items are named `<group>/<slug>` and install as `@transition-kit/<group>/<slug>`. Cores and components install to `components/transitions/`. `scripts/build-registry.ts` rewrites `@/registry/<group>/x` imports to `@/components/transitions/x` and turns imports into `registryDependencies`: the group core and any other item imported, plus shadcn primitives for `@/components/ui/<name>`.

## How the cores work

### Theme

`ThemeTransitionProvider` follows React's documented theme pattern:

```tsx
<ViewTransition
  default="none"
  update={{ "theme-transition": "tk-theme tk-theme-<style>", default: "none" }}
>
  <div data-theme={resolvedTheme}>
    {" "}
    {/* the snapshot */}
    <ViewTransition update="none">{children}</ViewTransition>
  </div>
</ViewTransition>
```

`setTheme(theme, { transition, origin })` writes geometry variables to `<html>`, then runs `startTransition(() => { addTransitionType("theme-transition"); setState(...) })`. The `data-theme` change is the only mutation inside the outer boundary, so only theme changes animate. A layout effect flips the `light`/`dark` class on `<html>` inside React's update, before the new snapshot is captured.

React cancels the `root` snapshot, so styles animate the provider's element, which can be taller than the viewport and scrolled. Never use `center`, `50%` or `vw`/`vh` positions relative to the image; use these variables (all in px, in the element's coordinate space):

| Variable                                   | Meaning                                                                                                |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `--tk-x`, `--tk-y`                         | Transition origin (click point, control centre, or viewport centre).                                   |
| `--tk-cx`, `--tk-cy`                       | Viewport centre.                                                                                       |
| `--tk-left`, `--tk-top`                    | Viewport top-left corner. The viewport is `--tk-left`..`--tk-left + 100vw`.                            |
| `--tk-r`                                   | Distance from the origin to the farthest viewport corner.                                              |
| `--tk-theme-duration`, `--tk-theme-easing` | Optional overrides; always use them with the style's own fallback: `var(--tk-theme-duration, 1000ms)`. |

A theme style targets only its own class:

```css
::view-transition-old(.tk-theme-circle-reveal) {
  animation: none;
}
::view-transition-new(.tk-theme-circle-reveal) {
  animation: tk-theme-circle-reveal var(--tk-theme-duration, 1000ms)
    var(--tk-theme-easing, ease-in-out) both;
}
@keyframes tk-theme-circle-reveal {
  from {
    clip-path: circle(0 at var(--tk-x) var(--tk-y));
  }
  to {
    clip-path: circle(var(--tk-r) at var(--tk-x) var(--tk-y));
  }
}
```

### Page

`<PageTransition id={pathname} transition="slide">` renders `<ViewTransition key={id}>` with `enter`/`exit` classes, so a new `id` inside a Transition makes the old page exit and the new one enter as two separate snapshot groups. Classes: `tk-page tk-page-<style> tk-page-exit` on the old page, `tk-page tk-page-<style> tk-page-enter` on the new one, plus `tk-page-back` when `navigateWithTransition(fn, { direction: "back" })` added the `page-back` type. The core clips both snapshots to their frame.

Exit snapshots are `::view-transition-old(.tk-page-<style>)`, enter snapshots are `::view-transition-new(.tk-page-<style>)`. They live in different groups: stack them with `::view-transition-group(.tk-page-<style>.tk-page-exit) { z-index: 1 }`, and give 3D styles `perspective` on each `::view-transition-image-pair(.tk-page-<style>)`.

| Variable                                 | Meaning                                             |
| ---------------------------------------- | --------------------------------------------------- |
| `--tk-exit-cx`, `--tk-exit-cy`           | Viewport centre in the old page's coordinates (px). |
| `--tk-enter-cx`, `--tk-enter-cy`         | Viewport centre in the new page's coordinates (px). |
| `--tk-page-duration`, `--tk-page-easing` | Optional overrides, used with the style's fallback. |

Pivot transforms around what the user sees: `transform-origin: var(--tk-exit-cx) var(--tk-exit-cy)`.

### UI

Interactive components (tabs, carousel, kanban board, ...) in `registry/ui/<name>.tsx`, ported from transition-ui onto React's `<ViewTransition>`. The core item `ui/ui-transition` ships `registry/ui/ui-transition.ts` (`tk()`, `useTransitionNames`, `FORWARD`/`BACK` types) and `registry/ui/ui-transition.css` (the composable `tk-*` View Transition Classes: `tk-morph`, `tk-text`, `tk-clip`, `tk-spring`, `tk-slow`, `tk-top`, `tk-instant`, `tk-fade`, `tk-pop`, `tk-blur`, `tk-slide`, `tk-push`, `tk-roll`, `tk-forward`/`tk-back`/`tk-up`/`tk-down`, `tk-delay-1..8`; settings `--tk-ui-*`). A component may add `registry/ui/<name>.css` with classes prefixed `tk-<name>-`.

- Animated state changes run in `startTransition(() => setState(...))`; never `flushSync` or `document.startViewTransition`.
- Wrap each animated part in `<ViewTransition>` placed directly around its DOM element, and pass classes through `tk(...)` so the `tk-ui` base class (reduced motion) is always present: `<ViewTransition default="none" update={tk("tk-morph")}>`.
- Shared elements (an element that moves between two places, e.g. the active tab pill) use `name={names("pill")}` from `useTransitionNames()` and `share={tk("tk-morph")}`, rendered in exactly one place at a time.
- Direction comes from transition types, not state-derived classes (an exiting element keeps its previous render's props): `addTransitionType(FORWARD)` inside the `startTransition`, and class maps like `enter={{ [FORWARD]: tk("tk-slide", "tk-forward"), [BACK]: tk("tk-slide", "tk-back"), default: "none" }}`.
- Guard no-op updates (selecting the active tab must not start a transition).

## Rules

- **React owns the transition.** Never call `document.startViewTransition` in registry code; go through `startTransition` + `addTransitionType` so React coordinates it.
- **One class per style.** Prefix classes and keyframes with `tk-theme-<slug>` / `tk-page-<slug>`. Reference every `@keyframes` from an `animation` shorthand.
- **Reduced motion** is handled by the core CSS; styles don't repeat it.
- **shadcn conventions** in components: `"use client"`, `cn` from `@/lib/utils`, theme tokens only, `data-slot` on parts, props spread onto the root, arrow-function components, named exports.
- **Accessible controls**: real `<button type="button">`, correct ARIA (`aria-pressed`, `role="switch"`, `role="radiogroup"`), visible focus.

## Site

- Theme changes on the site go through the theme core (`ThemeTransitionProvider` in `src/routes/__root.tsx`); every `registry/*/styles/*.css` is loaded automatically.
- Docs navigation slides like pdfcn, but TanStack Router commits navigations through `useSyncExternalStore`, which React can't animate with `<ViewTransition>`. Links opt in with the router's `viewTransition={{ types: ["nav-forward" | "nav-back"] }}`, and `styles/globals.css` names `page`/`site-header`/`site-footer` only under `:active-view-transition-type(nav-forward, nav-back)`, so React's theme transitions never see those names. This is the only place the site uses a non-React view transition; registry code never does.
- `wrangler.jsonc` `main` is `src/server.ts` (redirects, markdown negotiation); deploy with `pnpm deploy`.
