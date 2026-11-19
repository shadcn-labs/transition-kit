"use client";

import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { useState } from "react";

import { InstallCommand } from "@/components/install-command";
import { ProUnlockDialog } from "@/components/pro/pro-unlock-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { useAccount } from "@/hooks/use-account";
import { PRO_API_KEY_ENV } from "@/lib/pro-install";

export const ProInstall = ({
  name,
  title,
}: {
  name: string;
  title: string;
}) => {
  const { account, loading } = useAccount();
  const [open, setOpen] = useState(false);

  if (loading) {
    return <Skeleton className="mt-6 h-24 w-full" />;
  }

  if (account?.pro) {
    return (
      <div className="mt-6 grid gap-3">
        <p className="text-muted-foreground text-sm">
          Pro installs send your API key from{" "}
          <code className="font-mono text-xs">{PRO_API_KEY_ENV}</code>. Set up
          the registry once from your{" "}
          <Link to={ROUTES.ACCOUNT} className="underline underline-offset-4">
            account
          </Link>
          .
        </p>
        <InstallCommand name={name} />
      </div>
    );
  }

  return (
    <div className="bg-card mt-6 flex flex-col items-start gap-3 rounded-xl border p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Lock className="text-muted-foreground size-4 shrink-0" aria-hidden />
        <p className="text-sm">
          {title} is a Pro component. Unlock it to install the source.
        </p>
      </div>
      <Button type="button" onClick={() => setOpen(true)}>
        Unlock
      </Button>
      <ProUnlockDialog title={title} open={open} onOpenChange={setOpen} />
    </div>
  );
};
