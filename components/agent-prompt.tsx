"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { motionIconProps } from "@/components/copy-button";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { FALLBACK_SITE_ORIGIN } from "@/constants/site";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";

const installCommand =
  "npx shadcn@latest add @transition-kit/theme/circle-reveal";

const agentInstallPrompt = `Read the transition-kit agent instructions at ${FALLBACK_SITE_ORIGIN}${ROUTES.LLMS}, then install transition-kit in this project. It requires React 19.3 or newer (<ViewTransition>, startTransition and addTransitionType); upgrade react and react-dom if needed. Add the registry to components.json under "registries": { "@transition-kit": "${FALLBACK_SITE_ORIGIN}/r/{name}.json" }. Run ${installCommand}; it installs the theme/theme-transition core into components/transitions/ and merges the circle-reveal CSS into the global stylesheet. Wrap the app root in ThemeTransitionProvider from "@/components/transitions/theme-transition" and render ThemeTransitionScript in <head> so the saved theme applies before first paint. Replace the existing theme toggle (remove next-themes if present) with one that calls useThemeTransition().toggleTheme({ transition: "circle-reveal", origin: event }) from its click handler. For route changes, install @transition-kit/page/<style> (for example page/slide), wrap the routed content in <PageTransition id={pathname} transition="slide"> from "@/components/transitions/page-transition", and run navigations through navigateWithTransition. For animated UI, install @transition-kit/ui/<component> (for example ui/tabs); it pulls in the ui/ui-transition core and installs to components/transitions/, ready to import with no provider. Preserve the existing Tailwind CSS and shadcn/ui setup. Do not use document.startViewTransition or an animation library.`;

export const AgentPrompt = ({ className }: { className?: string }) => {
  const { copyToClipboard, isCopied } = useCopyToClipboard({ timeout: 2500 });

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      sound="copy"
      aria-live="polite"
      onClick={() => copyToClipboard(agentInstallPrompt)}
      className={cn(
        "text-muted-foreground hover:text-foreground h-7 px-2.5 text-xs",
        className
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {isCopied ? (
          <motion.span key="done" {...motionIconProps}>
            <CheckIcon />
          </motion.span>
        ) : (
          <motion.span key="idle" {...motionIconProps}>
            <CopyIcon />
          </motion.span>
        )}
      </AnimatePresence>
      {isCopied
        ? "Copied — paste into your agent"
        : "Copy prompt for your agent"}
    </Button>
  );
};
