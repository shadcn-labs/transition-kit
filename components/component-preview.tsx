import type { ReactNode } from "react";

import { ComponentSource } from "@/components/component-source";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const triggerClassName =
  "text-muted-foreground data-[state=active]:text-foreground data-[state=active]:border-primary dark:data-[state=active]:border-primary hover:text-primary rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pb-3 text-base data-[state=active]:bg-transparent data-[state=active]:shadow-none dark:data-[state=active]:bg-transparent";

export const ComponentPreview = ({
  name,
  src,
  title,
  className,
  children,
}: {
  /** Example file in examples/ (or a registry item) shown under Code. */
  name?: string;
  src?: string;
  title?: string;
  className?: string;
  children: ReactNode;
}) => (
  <Tabs defaultValue="preview" className="relative mt-6 w-full gap-4">
    <TabsList className="justify-start gap-4 rounded-none bg-transparent px-0">
      <TabsTrigger
        value="preview"
        sound="tabSwitch"
        className={triggerClassName}
      >
        Preview
      </TabsTrigger>
      <TabsTrigger value="code" sound="tabSwitch" className={triggerClassName}>
        Code
      </TabsTrigger>
    </TabsList>
    <TabsContent
      value="preview"
      forceMount
      className="data-[state=inactive]:hidden"
    >
      <div
        data-slot="component-preview"
        className={cn(
          "@container bg-background flex min-h-96 w-full items-center justify-center rounded-xl border p-4 sm:p-10",
          className
        )}
      >
        {children}
      </div>
    </TabsContent>
    <TabsContent value="code">
      <ComponentSource
        name={name}
        src={src}
        title={title}
        collapsible={false}
        className="*:[figure]:my-0 [&_pre]:max-h-[32rem]"
      />
    </TabsContent>
  </Tabs>
);
