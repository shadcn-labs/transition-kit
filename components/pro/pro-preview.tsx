"use client";

import { Lock } from "lucide-react";
import { Suspense } from "react";

import { ComponentPreview } from "@/components/component-preview";
import { PRO_DEMOS } from "@/registry/pro/__index__";

export const ProPreview = ({ name }: { name: string }) => {
  const Demo = PRO_DEMOS[name];
  return (
    <ComponentPreview name={name}>
      {Demo ? (
        <Suspense fallback={null}>
          <Demo />
        </Suspense>
      ) : (
        <div className="text-muted-foreground flex flex-col items-center gap-2 text-sm">
          <Lock className="size-5" aria-hidden />
          Live preview is available on transition-kit.space.
        </div>
      )}
    </ComponentPreview>
  );
};
