"use client";

import { Link } from "@tanstack/react-router";
import { CircleCheck } from "lucide-react";

import { Frame } from "@/components/frame";
import { ProBadge } from "@/components/pro-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ROUTES } from "@/constants/routes";
import { PRO_CATALOG } from "@/registry/pro-catalog";

const FEATURES = [
  "Full source, installed with the shadcn CLI",
  "Commercial and client use",
  "Every Pro component we add next",
];

export const ProUnlockDialog = ({
  title,
  open,
  onOpenChange,
}: {
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="gap-6 text-center sm:max-w-md">
      <DialogHeader className="items-center gap-3 text-center sm:text-center">
        <ProBadge />
        <DialogTitle className="text-2xl font-semibold tracking-tight">
          Unlock {title}
        </DialogTitle>
        <DialogDescription>
          {PRO_CATALOG.length > 1
            ? `${title} is one of ${PRO_CATALOG.length} Pro components.`
            : `${title} is a Pro component.`}{" "}
          Pay once or yearly, and the source is yours.
        </DialogDescription>
      </DialogHeader>
      <Frame label="Included" innerClassName="p-4">
        <ul className="grid gap-2.5 text-left text-sm">
          {FEATURES.map((feature) => (
            <li key={feature} className="flex items-center gap-2.5">
              <CircleCheck className="text-brand size-4 shrink-0" aria-hidden />
              {feature}
            </li>
          ))}
        </ul>
      </Frame>
      <div className="grid gap-2">
        <Button asChild>
          <Link to={ROUTES.PRICING}>See plans</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link to={ROUTES.SIGN_IN} search={{ next: ROUTES.ACCOUNT }}>
            I already have Pro
          </Link>
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);
