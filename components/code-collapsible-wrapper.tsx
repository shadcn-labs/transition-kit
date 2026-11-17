"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export const CodeCollapsibleWrapper = ({
  className,
  children,
  navTriggerClassName,
  ...props
}: React.ComponentProps<typeof Collapsible> & {
  navTriggerClassName?: string;
}) => {
  const [isOpened, setIsOpened] = useState(false);

  return (
    <Collapsible
      sounds
      open={isOpened}
      onOpenChange={setIsOpened}
      className={cn("group/collapsible relative md:-mx-1", className)}
      {...props}
    >
      <CollapsibleTrigger asChild>
        <div
          className={cn(
            "absolute top-1.5 right-9 z-10 flex items-center",
            navTriggerClassName
          )}
        >
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground h-7 rounded-md px-2"
          >
            {isOpened ? "Collapse" : "Expand"}
          </Button>
          <Separator orientation="vertical" className="mx-1.5 h-4!" />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent
        forceMount
        className="relative mt-6 data-[state=closed]:[content-visibility:auto] data-[state=closed]:[&_pre]:max-h-56 data-[state=closed]:[&_pre]:overflow-hidden [&>figure]:mt-0 [&>figure]:md:mx-0!"
      >
        {children}
      </CollapsibleContent>

      <div className="absolute inset-x-[5px] bottom-[5px] flex h-20 items-center justify-center rounded-b-[calc(var(--radius-xl)-5px)] bg-linear-to-b from-transparent to-code group-data-[state=open]/collapsible:hidden">
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm">
            Expand
          </Button>
        </CollapsibleTrigger>
      </div>
    </Collapsible>
  );
};
