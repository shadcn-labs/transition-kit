import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { BillingButton } from "@/components/billing-button";
import { PageTransition } from "@/components/page-transition";
import { ProBadge } from "@/components/pro-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { useAccount } from "@/hooks/use-account";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { authClient } from "@/lib/auth-client";
import type { ActivePlan } from "@/lib/billing";
import { PLANS } from "@/lib/plans";
import { PRO_API_KEY_ENV, proRegistryConfig } from "@/lib/pro-install";
import { createPageMetadata } from "@/seo/metadata";

const metadata = createPageMetadata({
  description: "Your transition-kit Pro plan, API key and billing.",
  noIndex: true,
  path: ROUTES.ACCOUNT,
  title: "Account",
});

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

const planSummary = (plan: ActivePlan) => {
  if (plan.kind === "lifetime") {
    return plan.seats
      ? `Lifetime access for ${plan.seats} seats.`
      : "Lifetime access.";
  }
  return plan.expiresAt
    ? `Renews or ends ${dateFormat.format(plan.expiresAt)}.`
    : "Active subscription.";
};

const CopyBlock = ({ label, value }: { label: string; value: string }) => {
  const { copyToClipboard, isCopied } = useCopyToClipboard();
  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{label}</span>
        <Button
          type="button"
          size="xs"
          variant="ghost"
          onClick={() => copyToClipboard(value)}
          aria-label={`Copy ${label}`}
        >
          {isCopied ? <Check /> : <Copy />}
          {isCopied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="bg-muted overflow-x-auto rounded-md p-3 font-mono text-xs leading-5">
        {value}
      </pre>
    </div>
  );
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="bg-card grid gap-4 rounded-xl border p-5">
    <h2 className="font-semibold">{title}</h2>
    {children}
  </section>
);

const ApiKeySection = () => {
  const { account, refresh } = useAccount();
  const [secret, setSecret] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const key = account?.key;

  const call = async (method: "POST" | "DELETE") => {
    setBusy(true);
    setError(null);
    const response = await fetch("/api/api-key", { method });
    if (!response.ok) {
      setError("That didn't work. Try again.");
      setBusy(false);
      return;
    }
    setSecret(
      method === "POST"
        ? ((await response.json()) as { key: string }).key
        : null
    );
    await refresh();
    setBusy(false);
  };

  return (
    <Section title="API key">
      <p className="text-muted-foreground text-sm">
        The shadcn CLI sends this key to install Pro components. Keep it in{" "}
        <code className="font-mono text-xs">{PRO_API_KEY_ENV}</code>, never in
        your repo.
      </p>
      {secret ? (
        <div className="grid gap-2">
          <CopyBlock label="Your new key" value={secret} />
          <p className="text-muted-foreground text-xs">
            Copy it now. You won&apos;t see it again.
          </p>
        </div>
      ) : null}
      {key && !secret ? (
        <p className="text-sm">
          <code className="font-mono">{key.prefix}…</code>{" "}
          <span className="text-muted-foreground">
            created {dateFormat.format(key.createdAt)}
          </span>
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled={busy} onClick={() => call("POST")}>
          {key ? "Regenerate key" : "Create key"}
        </Button>
        {key ? (
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => call("DELETE")}
          >
            Revoke
          </Button>
        ) : null}
      </div>
      {error ? (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
    </Section>
  );
};

const AccountPage = () => {
  const { account, loading } = useAccount();
  const navigate = useNavigate();

  if (loading || !account) {
    return (
      <section className="container-wrapper">
        <div className="container mx-auto grid w-full max-w-2xl gap-4 py-12">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-40 w-full" />
        </div>
      </section>
    );
  }

  if (!account.signedIn) {
    return (
      <section className="container-wrapper">
        <div className="container mx-auto grid w-full max-w-md justify-items-center gap-4 py-16 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
          <p className="text-muted-foreground text-sm">
            Sign in with the email you paid with to get your Pro API key.
          </p>
          <Button asChild>
            <Link to={ROUTES.SIGN_IN} search={{ next: ROUTES.ACCOUNT }}>
              Sign in
            </Link>
          </Button>
        </div>
      </section>
    );
  }

  const { plan } = account;
  const planName = PLANS.find((item) => item.slug === plan?.slug)?.name;

  return (
    <PageTransition>
      <section className="container-wrapper">
        <div className="container mx-auto grid w-full max-w-2xl gap-6 py-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="grid gap-1">
              <h1 className="text-3xl font-bold tracking-tight">Account</h1>
              <p className="text-muted-foreground text-sm">{account.email}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={async () => {
                await authClient.signOut();
                window.location.assign(ROUTES.HOME);
              }}
            >
              Sign out
            </Button>
          </div>
          <Section title="Plan">
            {plan ? (
              <div className="grid gap-1 text-sm">
                <p className="flex items-center gap-2 font-medium">
                  {planName ?? "Pro"} <ProBadge />
                </p>
                <p className="text-muted-foreground">{planSummary(plan)}</p>
              </div>
            ) : (
              <div className="grid gap-3 text-sm">
                <p className="text-muted-foreground">
                  No active Pro plan for this email. Purchases are matched to
                  the email you paid with.
                </p>
                <Button asChild className="w-fit">
                  <Link to={ROUTES.PRICING}>See plans</Link>
                </Button>
              </div>
            )}
            {plan ? (
              <div className="w-full sm:w-48">
                <BillingButton variant="outline">Manage billing</BillingButton>
              </div>
            ) : null}
          </Section>
          {plan ? (
            <>
              <ApiKeySection />
              <Section title="Install Pro components">
                <p className="text-muted-foreground text-sm">
                  Add the header to the{" "}
                  <code className="font-mono text-xs">@transition-kit</code>{" "}
                  registry in{" "}
                  <code className="font-mono text-xs">components.json</code>,
                  and set{" "}
                  <code className="font-mono text-xs">{PRO_API_KEY_ENV}</code>{" "}
                  in your <code className="font-mono text-xs">.env</code>.
                </p>
                <CopyBlock
                  label="components.json"
                  value={proRegistryConfig()}
                />
                <Button
                  type="button"
                  variant="link"
                  className="w-fit px-0"
                  onClick={() =>
                    navigate({
                      params: { _splat: "components" },
                      to: "/docs/$",
                    })
                  }
                >
                  Browse components
                </Button>
              </Section>
            </>
          ) : null}
        </div>
      </section>
    </PageTransition>
  );
};

export const Route = createFileRoute("/_site/account")({
  component: AccountPage,
  head: () => metadata,
  headers: () => ({ "Cache-Control": "private, no-store" }),
});
