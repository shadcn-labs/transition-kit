"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  StepWizard,
  StepWizardContent,
  StepWizardDescription,
  StepWizardIndicator,
  StepWizardNext,
  StepWizardPrevious,
  StepWizardStep,
  StepWizardTitle,
} from "@/registry/ui/step-wizard";

const plans = [
  { id: "hobby", name: "Hobby", price: "Free" },
  { id: "pro", name: "Pro", price: "$12 / month" },
  { id: "team", name: "Team", price: "$40 / month" },
];

export const StepWizardDemo = () => {
  const [workspace, setWorkspace] = React.useState("");
  const [plan, setPlan] = React.useState("pro");
  const [invites, setInvites] = React.useState("");
  const selected = plans.find((item) => item.id === plan);

  return (
    <StepWizard className="w-full max-w-md">
      <StepWizardIndicator />
      <StepWizardContent>
        <StepWizardStep label="Workspace" canAdvance={workspace.trim() !== ""}>
          <StepWizardTitle>Name your workspace</StepWizardTitle>
          <StepWizardDescription>
            You can change it later in settings.
          </StepWizardDescription>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Workspace name
            <Input
              value={workspace}
              placeholder="Acme Inc."
              onChange={(event) => setWorkspace(event.target.value)}
            />
          </label>
        </StepWizardStep>
        <StepWizardStep label="Plan">
          <StepWizardTitle>Pick a plan</StepWizardTitle>
          <StepWizardDescription>
            Every plan starts with a 14-day trial.
          </StepWizardDescription>
          <div
            role="radiogroup"
            aria-label="Plan"
            className="grid grid-cols-3 gap-2"
          >
            {plans.map((item) => (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={plan === item.id}
                onClick={() => setPlan(item.id)}
                className={cn(
                  "hover:bg-accent focus-visible:ring-ring/50 flex cursor-pointer flex-col items-start gap-0.5 rounded-lg border p-3 text-left text-sm transition-colors outline-none focus-visible:ring-[3px]",
                  plan === item.id && "border-primary ring-primary/20 ring-2"
                )}
              >
                <span className="font-medium">{item.name}</span>
                <span className="text-muted-foreground text-xs">
                  {item.price}
                </span>
              </button>
            ))}
          </div>
        </StepWizardStep>
        <StepWizardStep label="Team">
          <StepWizardTitle>Invite your team</StepWizardTitle>
          <StepWizardDescription>
            Separate addresses with commas. You can skip this.
          </StepWizardDescription>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Email addresses
            <Input
              value={invites}
              placeholder="ava@acme.com, marcus@acme.com"
              onChange={(event) => setInvites(event.target.value)}
            />
          </label>
        </StepWizardStep>
        <StepWizardStep label="Review">
          <StepWizardTitle>Ready to go</StepWizardTitle>
          <StepWizardDescription>
            Check the details before creating the workspace.
          </StepWizardDescription>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 rounded-lg border p-3 text-sm">
            <dt className="text-muted-foreground">Workspace</dt>
            <dd className="truncate font-medium">{workspace || "—"}</dd>
            <dt className="text-muted-foreground">Plan</dt>
            <dd className="font-medium">
              {selected?.name} · {selected?.price}
            </dd>
            <dt className="text-muted-foreground">Invites</dt>
            <dd className="truncate font-medium">
              {invites.split(",").filter((email) => email.trim()).length ||
                "None"}
            </dd>
          </dl>
        </StepWizardStep>
      </StepWizardContent>
      <div className="flex justify-between gap-2">
        <StepWizardPrevious />
        <StepWizardNext />
      </div>
    </StepWizard>
  );
};
