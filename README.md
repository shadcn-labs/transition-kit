<p align="center">
  <img src="./public/og-image.webp" alt="transition-kit banner" />
</p>

<h1 align="center">transition-kit</h1>

<p align="center">
  Free & open-source theme, page and UI transitions for React.<br/>
  Built on React 19.3 <code>&lt;ViewTransition&gt;</code> and <code>addTransitionType</code>, distributed with <a href="https://ui.shadcn.com/">shadcn/ui</a>.
</p>

<p align="center">
  <a href="https://github.com/shadcn-labs/transition-kit"><img src="https://www.shieldcn.dev/github/stars/shadcn-labs/transition-kit.svg?variant=secondary&size=xs&theme=zinc" alt="GitHub Stars" /></a>
  <a href="https://github.com/shadcn-labs/transition-kit/actions"><img src="https://www.shieldcn.dev/github/ci/shadcn-labs/transition-kit.svg?variant=secondary&size=xs&theme=zinc" alt="CI" /></a>
  <a href="https://discord.gg/N6G36KhYK4"><img src="https://www.shieldcn.dev/discord/online-members/N6G36KhYK4.svg?variant=secondary&size=xs&theme=zinc" alt="Discord Members" /></a>
  <a href="https://x.com/shadcnlabs"><img src="https://www.shieldcn.dev/x/follow/shadcnlabs.svg?variant=branded&size=xs&theme=zinc" alt="X Follow" /></a>
</p>

<p align="center">
  <a href="https://transition-kit.space/docs">Get Started</a> ·
  <a href="https://transition-kit.space/docs/components/theme">Theme</a> ·
  <a href="https://transition-kit.space/docs/components/page">Page</a> ·
  <a href="https://transition-kit.space/docs/components/ui">UI</a>
</p>

## Features

- ⚛️ **React-native transitions** — Driven by `<ViewTransition>`, `startTransition`, and `addTransitionType`; no manual `document.startViewTransition`
- 🌗 **Theme transitions** — Animate light/dark switches from the click point, a control, or the viewport centre
- 🧭 **Page transitions** — Animate route changes, with reversed animations for back navigation
- 🧩 **UI components** — Tabs, carousels, lists, kanban boards and more whose state changes glide, morph and slide
- 🎨 **Pure CSS styles** — Every style is a small CSS file you own; tune duration and easing with CSS variables
- 📦 **shadcn/ui compatible** — Install the core and any style with the shadcn CLI
- 🛟 **Graceful fallback** — Browsers without view transitions switch instantly

## Components

### Theme

- **Core:** Theme Transition (`ThemeTransitionProvider`, `useThemeTransition`, `ThemeTransitionScript`)
- **Controls (4):** Theme Toggle Button, Theme Toggle Switch, Theme Switcher, Animated Theme Toggler
- **Styles (19):** Circle Reveal, Circle Blur, Polygon Reveal, Star Reveal, Heart Reveal, Diagonal Wipe, Checkerboard Reveal, Ripple Reveal, Venetian Blinds, Spiral Reveal, Wave Reveal, Clock Wipe, GIF Frog, GIF Penguin, GIF Cat, GIF Michael Jackson, GIF Deadpool, GIF Chika, GIF Hakari Dance

### Page

- **Core:** Page Transition (`PageTransition`, `navigateWithTransition`)
- **Styles (18):** Fade, Slide, Scale, Flip, Blur, Rotate, Zoom, Curtain, Cube, Skew Slide, Page Curl, Accordion, Doorway, Book Flip, Roll, Fold, Glitch, Iris Wipe

### UI

- **Core:** UI Transition (`tk()`, `useTransitionNames`, `FORWARD`/`BACK` transition types, and the composable `tk-*` View Transition Classes)
- **Components (17):** Tabs, Segmented Control, Accordion, Carousel, Stack Navigator, Step Wizard, Dynamic Island, Status Button, Number Flip, Add to Cart, Morphing Popover, Product Gallery, Layout Switcher, Animated List, Filter Grid, Sortable Table, Kanban Board

## Quick start

transition-kit requires `react` and `react-dom` 19.3 or later.

Add the registry to your `components.json`:

```json
{
  "registries": {
    "@transition-kit": "https://transition-kit.space/r/{name}.json"
  }
}
```

### Theme transitions

Install a style (it pulls in the `theme/theme-transition` core):

```bash
npx shadcn@latest add @transition-kit/theme/circle-reveal
```

Wrap your app and switch themes through the hook:

```tsx
import {
  ThemeTransitionProvider,
  ThemeTransitionScript,
  useThemeTransition,
} from "@/components/transitions/theme-transition";

export const App = ({ children }: { children: React.ReactNode }) => (
  <>
    <ThemeTransitionScript />
    <ThemeTransitionProvider transition="circle-reveal">
      {children}
    </ThemeTransitionProvider>
  </>
);

export const ThemeButton = () => {
  const { resolvedTheme, setTheme } = useThemeTransition();
  return (
    <button
      onClick={(event) =>
        setTheme(resolvedTheme === "dark" ? "light" : "dark", { origin: event })
      }
    >
      Toggle theme
    </button>
  );
};
```

### Page transitions

```bash
npx shadcn@latest add @transition-kit/page/slide
```

Key the page by its route and wrap navigations:

```tsx
import {
  navigateWithTransition,
  PageTransition,
} from "@/components/transitions/page-transition";

<PageTransition id={pathname} transition="slide">
  {children}
</PageTransition>;

navigateWithTransition(() => navigate("/about"));
navigateWithTransition(() => history.back(), { direction: "back" });
```

### UI components

Install a component (it pulls in the `ui/ui-transition` core and any shadcn primitives it uses):

```bash
npx shadcn@latest add @transition-kit/ui/tabs
```

Use it like any shadcn component; no provider is needed:

```tsx
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/transitions/tabs";

<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">Account settings.</TabsContent>
  <TabsContent value="password">Change your password.</TabsContent>
</Tabs>;
```

See the [docs](https://transition-kit.space/docs) for every style, the controls, the UI components, and customization options.

## Browser support

Styles rely on the View Transition API and `view-transition-class`:

| Browser       | Version |
| ------------- | ------- |
| Chrome / Edge | 125+    |
| Safari        | 18.2+   |
| Firefox       | 144+    |

In other browsers, React applies the update without an animation, so themes, pages and components switch instantly.

## Development

```bash
git clone https://github.com/shadcn-labs/transition-kit.git
cd transition-kit
pnpm install
pnpm dev             # docs site at http://localhost:3000
pnpm registry:build  # regenerate registry.json and public/r
pnpm build           # registry + Vite build
pnpm typecheck
pnpm check           # lint and format (ultracite)
pnpm deploy          # build and deploy to Cloudflare Workers
```

The site is built with TanStack Start, Vite, and Fumadocs and deployed to Cloudflare Workers. Registry source lives in `registry/`; [AGENTS.md](./AGENTS.md) documents the architecture.

## Community

The transition-kit community lives on [GitHub](https://github.com/shadcn-labs/transition-kit), where you can ask questions, share ideas, and show what you've built.

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) to get the repo running locally and land a change, and use [issues](https://github.com/shadcn-labs/transition-kit/issues) and [discussions](https://github.com/shadcn-labs/transition-kit/discussions) to collaborate. By participating, you agree to the [Code of Conduct](./CODE_OF_CONDUCT.md).

## Security

Please do not open public issues for security vulnerabilities. Follow [SECURITY.md](./SECURITY.md) and report them privately through GitHub Security Advisories.

## License

[MIT](LICENSE)

## Credits

- Created by [Abdullah Mukadam](https://github.com/AbdullahMukadam).
- Part of [Shadcn Labs](https://shadcn-labs.com).

## Contributors

[![Contributors](https://contrib.rocks/image?repo=shadcn-labs/transition-kit)](https://github.com/shadcn-labs/transition-kit/graphs/contributors)

> Made with [contrib.rocks](https://contrib.rocks)
