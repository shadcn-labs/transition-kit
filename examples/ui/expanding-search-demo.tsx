"use client";

import { BellIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { ExpandingSearch } from "@/registry/ui/expanding-search";

export const ExpandingSearchDemo = () => {
  const [submitted, setSubmitted] = React.useState("");

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div className="bg-card flex h-14 items-center gap-2 rounded-xl border px-4">
        <span className="mr-auto text-sm font-semibold">Acme</span>
        <ExpandingSearch
          placeholder="Search docs…"
          onSubmit={(value) => setSubmitted(value)}
        />
        <Button size="icon" variant="ghost" aria-label="Notifications">
          <BellIcon />
        </Button>
      </div>
      <p
        role="status"
        className="text-muted-foreground h-5 text-center text-xs"
      >
        {submitted ? `Searched for “${submitted}”` : null}
      </p>
    </div>
  );
};
