export const FALLBACK_SITE_ORIGIN = "https://transition-kit.space" as const;

const getBaseUrl = () => {
  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000";
  }

  return process.env.SITE_URL ?? FALLBACK_SITE_ORIGIN;
};

const baseUrl = getBaseUrl();

export const SITE = {
  AUTHOR: {
    NAME: "Abdullah Mukadam",
    TWITTER: "@shadcnlabs",
  },
  DESCRIPTION: {
    LONG: "Theme, page and UI transitions for React, built on the React 19.3 <ViewTransition> API. Copy-paste CSS animations and animated components installed with the shadcn CLI, no animation library.",
    SHORT: "Theme, page and UI transitions, made simple",
  },
  KEYWORDS: [
    "view transitions",
    "react viewtransition",
    "react 19.3",
    "addTransitionType",
    "theme toggle",
    "dark mode transition",
    "page transitions",
    "shadcn",
    "shadcn registry",
    "tailwindcss",
  ] as const,
  NAME: "transition-kit",
  OG_IMAGE: `${baseUrl}/og-image.webp`,
  /** Base URL of the built registry items: `${REGISTRY}/<name>.json`. */
  REGISTRY: `${baseUrl}/r`,
  /** `shadcn registry add` value that maps `@transition-kit/<name>` to this site. */
  REGISTRY_NAMESPACE: `@transition-kit=${baseUrl}/r/{name}.json`,
  URL: baseUrl,
};

export const META_THEME_COLORS = {
  dark: "#09090b",
  light: "#ffffff",
};

export const UTM_PARAMS = {
  utm_source: new URL(baseUrl).hostname,
};
