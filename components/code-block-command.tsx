"use client";

import { useCallback, useMemo } from "react";

import { CopyButton } from "@/components/copy-button";
import { getIconForCommandTab } from "@/components/icons";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { CommandTab } from "@/hooks/use-package-manager";
import { usePackageManager } from "@/hooks/use-package-manager";
import { cn } from "@/lib/utils";

const PROMPT_TEMPLATE = (cmd: string) =>
  `Run \`${cmd}\` in this project to install it with the shadcn CLI. Don't rewrite the files it adds; if the command fails, show me the error.`;

export const CodeBlockCommand = ({
  __npm__,
  __yarn__,
  __pnpm__,
  __bun__,
  className,
}: {
  __npm__?: string;
  __yarn__?: string;
  __pnpm__?: string;
  __bun__?: string;
  className?: string;
}) => {
  const [{ packageManager, commandTab }, setPreferences] = usePackageManager();

  const commandTabs = useMemo(
    () => ({
      bun: __bun__,
      npm: __npm__,
      pnpm: __pnpm__,
      yarn: __yarn__,
    }),
    [__npm__, __pnpm__, __yarn__, __bun__]
  );

  const isShadcnCommand = useMemo(
    () => __npm__?.startsWith("npx shadcn@latest") ?? false,
    [__npm__]
  );

  const allTabs = useMemo(() => {
    if (!isShadcnCommand) {
      return ["bun", "npm", "pnpm", "yarn"];
    }
    return ["bun", "npm", "pnpm", "yarn", "shadcn", "prompt"];
  }, [isShadcnCommand]);

  const handleCommandTabChange = useCallback(
    (value: string) => {
      const tab = value as CommandTab;
      setPreferences((preferences) => ({
        commandTab: tab,
        packageManager:
          tab === "shadcn" || tab === "prompt"
            ? preferences.packageManager
            : tab,
      }));
    },
    [setPreferences]
  );

  const shadcnCommand = useMemo(
    () => __npm__?.replace("npx shadcn@latest ", "shadcn ") ?? "",
    [__npm__]
  );

  const promptCommand = useMemo(
    () => (__npm__ ? PROMPT_TEMPLATE(__npm__) : ""),
    [__npm__]
  );

  const copyValue = useMemo(() => {
    if (commandTab === "shadcn") {
      return shadcnCommand;
    }
    if (commandTab === "prompt") {
      return promptCommand;
    }
    return commandTabs[packageManager] || "";
  }, [commandTab, shadcnCommand, promptCommand, commandTabs, packageManager]);

  return (
    <div
      data-slot="code-block-command"
      className={cn("bezel text-code-foreground relative text-sm", className)}
    >
      <Tabs
        className="gap-0"
        onValueChange={handleCommandTabChange}
        value={commandTab}
      >
        <div className="flex items-center gap-2 py-0.5 pr-10 pl-2">
          <TabsList className="no-scrollbar h-8 justify-start gap-0.5 overflow-x-auto rounded-none bg-transparent p-0 [&_svg]:me-2 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground">
            {getIconForCommandTab(commandTab)}

            {allTabs.map((key) => (
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
        <div className="bezel-inner no-scrollbar overflow-x-auto">
          {Object.entries(commandTabs).map(([key, value]) => (
            <TabsContent key={key} className="mt-0 px-4 py-3.5" value={key}>
              <pre>
                <code
                  data-slot="code-block"
                  data-language="bash"
                  className="font-mono text-sm/none"
                >
                  <span className="text-muted-foreground select-none">$ </span>
                  {value}
                </code>
              </pre>
            </TabsContent>
          ))}
          {isShadcnCommand && (
            <>
              <TabsContent className="mt-0 px-4 py-3.5" value="shadcn">
                <pre>
                  <code
                    data-slot="code-block"
                    data-language="bash"
                    className="font-mono text-sm/none"
                  >
                    <span className="text-muted-foreground select-none">
                      ${" "}
                    </span>
                    {shadcnCommand}
                  </code>
                </pre>
              </TabsContent>
              <TabsContent className="mt-0 px-4 py-3.5" value="prompt">
                <p className="whitespace-normal text-sm leading-relaxed">
                  {promptCommand}
                </p>
              </TabsContent>
            </>
          )}
        </div>
      </Tabs>
      <CopyButton
        className="absolute top-1.5 right-2 z-10 size-7 bg-transparent opacity-70 hover:opacity-100 focus-visible:opacity-100"
        value={copyValue}
      />
    </div>
  );
};
