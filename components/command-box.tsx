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

const REGISTRY_ITEM = "@transition-kit/theme-transition";

export const CommandBox = ({ className }: { className?: string }) => {
  const [{ packageManager }, setPreferences] = usePackageManager();

  return (
    <div
      className={cn("bezel text-code-foreground relative text-sm", className)}
    >
      <Tabs
        className="gap-0"
        onValueChange={(value: string) => {
          const manager = value as PackageManager;
          setPreferences({ commandTab: manager, packageManager: manager });
        }}
        value={packageManager}
      >
        <div className="flex items-center gap-2 py-0.5 pr-20 pl-2">
          <TabsList className="no-scrollbar h-8 justify-start gap-0.5 overflow-x-auto rounded-none bg-transparent p-0 [&_svg]:me-2 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground">
            {getIconForPackageManager(packageManager)}

            {Object.keys(PACKAGE_RUNNERS).map((key) => (
              <TabsTrigger
                key={key}
                className="text-muted-foreground hover:text-foreground data-[state=active]:bg-card data-[state=active]:border-border data-[state=active]:text-foreground dark:data-[state=active]:bg-card dark:data-[state=active]:border-border dark:data-[state=active]:text-foreground h-7 flex-none rounded-md border border-transparent px-2.5 data-[state=active]:shadow-sm"
                sound="tabSwitch"
                value={key}
              >
                {key}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <pre className="bezel-inner px-4 py-3.5">
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
        className="absolute top-1.5 right-10 z-10 w-7 h-7 sm:w-auto gap-1.5 border-none px-2 opacity-70 hover:opacity-100 focus-visible:opacity-100 [&_svg:not([class*='size-'])]:size-4 sm:[&_svg:not([class*='size-'])]:size-3.5"
        variant="ghost"
        size="sm"
      />

      <CopyButton
        className="absolute top-1.5 right-2 z-10 size-7 bg-transparent opacity-70 hover:opacity-100 focus-visible:opacity-100"
        value={() =>
          `${PACKAGE_RUNNERS[packageManager]} shadcn@latest add ${REGISTRY_ITEM}`
        }
      />
    </div>
  );
};
