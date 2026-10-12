"use client";

import { BellIcon, GitBranchIcon, RocketIcon } from "lucide-react";
import * as React from "react";

import { Input } from "@/components/ui/input";
import { StatusButton } from "@/registry/ui/status-button";
import type { StatusButtonStatus } from "@/registry/ui/status-button";

const wait = (ms: number) =>
  // oxlint-disable-next-line promise/avoid-new -- setTimeout has no promise form in the browser
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const deploy = async () => {
  await wait(1600);
  throw new Error("Build failed: missing environment variable DATABASE_URL");
};

export const StatusButtonDemo = () => {
  const [subscription, setSubscription] =
    React.useState<StatusButtonStatus>("idle");

  return (
    <div className="@container w-full max-w-md space-y-3">
      <div className="bg-card text-card-foreground space-y-4 rounded-xl border p-4">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="size-10 shrink-0 rounded-full bg-[conic-gradient(at_30%_30%,var(--color-chart-1),var(--color-chart-2),var(--color-chart-3),var(--color-chart-1))]"
          />
          <div className="grid min-w-0 flex-1 gap-1.5">
            <label
              htmlFor="status-button-demo-name"
              className="text-sm font-medium"
            >
              Display name
            </label>
            <Input id="status-button-demo-name" defaultValue="Ada Lovelace" />
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-muted-foreground hidden text-xs @sm:block">
            Visible to everyone in your workspace.
          </p>
          <StatusButton
            className="ml-auto"
            onClick={() => wait(1200)}
            labels={{ pending: "Saving…", success: "Saved" }}
          >
            Save changes
          </StatusButton>
        </div>
      </div>

      <div className="bg-card text-card-foreground flex items-center gap-3 rounded-xl border p-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">acme-web</p>
          <p className="text-muted-foreground flex items-center gap-1 truncate text-xs">
            <GitBranchIcon className="size-3" />
            main · a1f9c2e · 2 minutes ago
          </p>
        </div>
        <StatusButton
          variant="outline"
          onClick={deploy}
          icons={{ idle: <RocketIcon /> }}
          labels={{
            error: "Build failed",
            pending: "Deploying…",
            success: "Live",
          }}
          resetAfter={2500}
        >
          Deploy
        </StatusButton>
      </div>

      <form
        className="flex items-center gap-2"
        onSubmit={(event) => event.preventDefault()}
      >
        <Input
          type="email"
          required
          aria-label="Email"
          placeholder="you@example.com"
          defaultValue="ada@example.com"
          className="rounded-full"
        />
        <StatusButton
          type="submit"
          variant="secondary"
          className="w-36 rounded-full"
          status={subscription}
          onStatusChange={setSubscription}
          resetAfter={false}
          icons={{ idle: <BellIcon /> }}
          onClick={(event) => {
            if (subscription === "success") {
              event.preventDefault();
              setSubscription("idle");
              return;
            }
            if (!event.currentTarget.form?.checkValidity()) {
              return;
            }
            return wait(1000);
          }}
        >
          {(status) =>
            ({
              error: "Try again",
              idle: "Subscribe",
              pending: "Subscribing…",
              success: "Subscribed",
            })[status]
          }
        </StatusButton>
      </form>
    </div>
  );
};
