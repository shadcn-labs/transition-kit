"use client";

import { CopyButton } from "@/components/copy-button";
import { getIconForPackageManager } from "@/components/icons";
import { RegistryAddButton } from "@/components/registry-add-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SITE } from "@/constants/site";
import type { PackageManager } from "@/hooks/use-package-manager";
import {
  PACKAGE_RUNNERS,
  usePackageManager,
} from "@/hooks/use-package-manager";
import { cn } from "@/lib/utils";

const REGISTRY_ITEM = "@transition-kit/theme/circle-reveal";

export const CommandBox = ({ className }: { className?: string }) => {
  const [{ packageManager }, setPreferences] = usePackageManager();

  return (
    <div
      className={cn(
        "bg-code text-code-foreground relative overflow-hidden rounded-lg text-sm",
        className
      )}
    >
      <Tabs
        className="gap-0"
        onValueChange={(value: string) => {
          const manager = value as PackageManager;
          setPreferences({ commandTab: manager, packageManager: manager });
        }}
        value={packageManager}
      >
        <div className="border-border/50 flex items-center gap-2 border-b px-3 py-1">
          <TabsList className="rounded-none bg-transparent p-0 [&_svg]:me-2 [&_svg]:size-4 [&_svg]:text-muted-foreground">
            {getIconForPackageManager(packageManager)}

            {Object.keys(PACKAGE_RUNNERS).map((key) => (
              <TabsTrigger
                key={key}
                className="data-[state=active]:border-input h-7 border border-transparent pt-0.5 data-[state=active]:shadow-none"
                sound="tabSwitch"
                value={key}
              >
                {key}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <pre className="-translate-y-px px-4 py-3.5">
          <code
            data-language="bash"
            className="text-left block font-mono text-sm text-muted-foreground max-sm:leading-6"
          >
            {Object.entries(PACKAGE_RUNNERS).map(([key, command]) => (
              <TabsContent key={key} value={key} asChild>
                <span className="block sm:inline-block">
                  <span className="select-none">$ </span>
                  {command} shadcn@latest add{" "}
                  <span className="select-none sm:hidden" aria-hidden="true">
                    \
                  </span>
                </span>
              </TabsContent>
            ))}

            <span className="text-foreground">{REGISTRY_ITEM}</span>
          </code>
        </pre>
      </Tabs>

      <RegistryAddButton
        registry={SITE.REGISTRY_NAMESPACE}
        className="absolute top-2 right-10 z-10 w-7 h-7 sm:w-auto gap-1.5 border-none px-2 opacity-70 hover:opacity-100 focus-visible:opacity-100 [&_svg:not([class*='size-'])]:size-4 sm:[&_svg:not([class*='size-'])]:size-3.5"
        variant="ghost"
        size="sm"
      />

      <CopyButton
        className="absolute top-2 right-2 z-10 size-7 opacity-70 hover:opacity-100 focus-visible:opacity-100"
        value={() =>
          `${PACKAGE_RUNNERS[packageManager]} shadcn@latest add ${REGISTRY_ITEM}`
        }
      />
    </div>
  );
};
