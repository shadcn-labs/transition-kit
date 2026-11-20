import { createFileRoute, Link, useLoaderData } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import { Frame } from "@/components/frame";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useAccount } from "@/hooks/use-account";
import {
  getBillingConfigurationError,
  getCheckoutPayment,
} from "@/lib/billing";
import { createPageMetadata } from "@/seo/metadata";

const metadata = createPageMetadata({
  description: "Confirming your transition-kit Pro purchase.",
  noIndex: true,
  path: ROUTES.CHECKOUT_RETURN,
  title: "Your Pro access",
});

type PaymentState = "none" | "unavailable" | "unknown" | "pending" | "paid";

const lookUpPayment = createServerFn({ method: "GET" })
  .inputValidator((paymentId: string | undefined) => paymentId)
  .handler(
    async ({
      data: paymentId,
    }): Promise<{
      state: PaymentState;
      email?: string;
    }> => {
      if (!paymentId) {
        return { state: "none" };
      }
      if (getBillingConfigurationError()) {
        return { state: "unavailable" };
      }
      try {
        const payment = await getCheckoutPayment(paymentId);
        if (!payment) {
          return { state: "unknown" };
        }
        return payment.succeeded
          ? { email: payment.email, state: "paid" }
          : { state: "pending" };
      } catch {
        return { state: "unavailable" };
      }
    }
  );

const MESSAGES: Record<PaymentState, { title: string; body: string }> = {
  none: {
    body: "Pro follows the email you paid with. Sign in with it to check your access.",
    title: "Checking your Pro access.",
  },
  paid: {
    body: "Payment received. Sign in with the email you paid with to get your API key.",
    title: "Thanks! You're in.",
  },
  pending: {
    body: "Dodo is still confirming your payment. This usually takes a few seconds.",
    title: "Confirming your payment.",
  },
  unavailable: {
    body: "The payment provider is unavailable right now. If you paid, your Pro access is safe: sign in with the email you paid with.",
    title: "We couldn't check your payment.",
  },
  unknown: {
    body: "This link doesn't match a transition-kit purchase. If you paid, sign in with the email you paid with.",
    title: "We couldn't find that payment.",
  },
};

const CheckoutReturnPage = () => {
  const { state, email } = useLoaderData({ from: "/_site/checkout/return" });
  const { account } = useAccount();
  const pro = Boolean(account?.pro);
  const message = pro
    ? {
        body: "Your account has active Pro access. Create your API key to start installing.",
        title: "You're in. Let's make it move.",
      }
    : MESSAGES[state];
  const retry = state === "pending" || state === "unavailable";

  return (
    <PageTransition>
      <section className="container-wrapper flex flex-1">
        <div className="container mx-auto flex flex-1 items-center justify-center py-16">
          <Frame
            label="Checkout"
            className="w-full max-w-sm"
            innerClassName="gap-4 p-6"
          >
            <h1 className="text-xl font-semibold tracking-tight">
              {message.title}
            </h1>
            <p className="text-muted-foreground text-sm">{message.body}</p>
            {email && !pro ? (
              <p className="text-sm">
                Paid with <span className="font-medium">{email}</span>
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {pro || account?.signedIn ? (
                <Button asChild>
                  <Link to={ROUTES.ACCOUNT}>Open account</Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link to={ROUTES.SIGN_IN} search={{ next: ROUTES.ACCOUNT }}>
                    Sign in
                  </Link>
                </Button>
              )}
              {retry && !pro ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  Check again
                </Button>
              ) : null}
            </div>
          </Frame>
        </div>
      </section>
    </PageTransition>
  );
};

export const Route = createFileRoute("/_site/checkout/return")({
  component: CheckoutReturnPage,
  head: () => metadata,
  headers: () => ({ "Cache-Control": "private, no-store" }),
  loader: ({ location }) =>
    lookUpPayment({
      data:
        new URLSearchParams(location.searchStr).get("payment_id") ?? undefined,
    }),
});
