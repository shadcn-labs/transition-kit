"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { PlanSlug } from "@/lib/plans";
import { cn } from "@/lib/utils";

const openBillingDestination = async (plan?: PlanSlug, seats?: number) => {
  const response = await fetch(plan ? "/api/checkout" : "/api/portal", {
    body: JSON.stringify(plan ? { plan, seats } : {}),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  const data = (await response.json()) as {
    checkoutUrl?: string;
    url?: string;
    error?: string;
  };
  if (!response.ok) {
    throw new Error(data.error || "Billing is unavailable.");
  }
  const url = data.checkoutUrl || data.url;
  if (!url) {
    throw new Error("The payment provider returned no destination.");
  }
  window.location.assign(url);
};

export const BillingButton = ({
  plan,
  seats,
  disabled = false,
  variant = "default",
  className,
  children,
}: {
  plan?: PlanSlug;
  seats?: number;
  disabled?: boolean;
  variant?: "default" | "outline";
  className?: string;
  children: React.ReactNode;
}) => {
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  return (
    <div className="grid gap-2">
      <Button
        type="button"
        variant={variant}
        disabled={disabled || busy}
        className={cn("w-full", className)}
        onClick={async () => {
          setBusy(true);
          setErrorMessage(null);
          try {
            await openBillingDestination(plan, seats);
          } catch (error) {
            setErrorMessage(
              error instanceof Error ? error.message : "Billing is unavailable."
            );
            setBusy(false);
          }
        }}
      >
        {busy ? "Opening…" : children}
      </Button>
      {errorMessage ? (
        <p role="alert" className="text-destructive text-sm">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
};
