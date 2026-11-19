import {
  createFileRoute,
  useLoaderData,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";
import { useAccount } from "@/hooks/use-account";
import {
  getAuthConfigurationError,
  isEmailSignInEnabled,
  isGoogleSignInEnabled,
} from "@/lib/auth";
import { authClient } from "@/lib/auth-client";
import { createPageMetadata } from "@/seo/metadata";

const metadata = createPageMetadata({
  description: "Sign in to manage your transition-kit Pro API key and billing.",
  noIndex: true,
  path: ROUTES.SIGN_IN,
  title: "Sign in",
});

const loadSignIn = createServerFn({ method: "GET" }).handler(() => ({
  configurationError: getAuthConfigurationError(),
  email: isEmailSignInEnabled(),
  google: isGoogleSignInEnabled(),
}));

const safeNext = (next: unknown) =>
  typeof next === "string" && next.startsWith("/") && !next.startsWith("//")
    ? next
    : ROUTES.ACCOUNT;

const SignInPage = () => {
  const {
    configurationError,
    email: emailEnabled,
    google,
  } = useLoaderData({
    from: "/_site/sign-in",
  });
  const { next } = useSearch({ from: "/_site/sign-in" });
  const navigate = useNavigate();
  const { refresh } = useAccount();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const destination = safeNext(next);

  const sendCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const { error: sendError } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "sign-in",
    });
    setBusy(false);
    if (sendError) {
      setError(sendError.message ?? "We couldn't send a code. Try again.");
      return;
    }
    setStep("code");
  };

  const verify = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const { error: verifyError } = await authClient.signIn.emailOtp({
      email,
      otp: code,
    });
    if (verifyError) {
      setBusy(false);
      setError(verifyError.message ?? "That code didn't work. Try again.");
      return;
    }
    await refresh();
    await navigate({ to: destination });
  };

  return (
    <PageTransition>
      <section className="container-wrapper flex flex-1">
        <div className="container mx-auto flex flex-1 items-center justify-center py-16">
          <div className="bg-card grid w-full max-w-sm gap-6 rounded-xl border p-6">
            <div className="grid gap-1.5">
              <h1 className="text-xl font-semibold tracking-tight">Sign in</h1>
              <p className="text-muted-foreground text-sm">
                Pro follows the email you paid with. Sign in with it to get your
                API key.
              </p>
            </div>
            {configurationError ? (
              <p role="alert" className="text-muted-foreground text-sm">
                {configurationError}
              </p>
            ) : (
              <>
                {emailEnabled && step === "email" ? (
                  <form onSubmit={sendCode} className="grid gap-3">
                    <label
                      htmlFor="sign-in-email"
                      className="text-sm font-medium"
                    >
                      Email
                    </label>
                    <Input
                      id="sign-in-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@company.com"
                    />
                    <Button type="submit" disabled={busy}>
                      {busy ? "Sending…" : "Email me a code"}
                    </Button>
                  </form>
                ) : null}
                {emailEnabled && step === "code" ? (
                  <form onSubmit={verify} className="grid gap-3">
                    <label
                      htmlFor="sign-in-code"
                      className="text-sm font-medium"
                    >
                      Code sent to {email}
                    </label>
                    <Input
                      id="sign-in-code"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      required
                      value={code}
                      onChange={(event) => setCode(event.target.value.trim())}
                      placeholder="123456"
                      className="font-mono tracking-[0.3em]"
                    />
                    <Button type="submit" disabled={busy}>
                      {busy ? "Signing in…" : "Sign in"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setStep("email");
                        setCode("");
                        setError(null);
                      }}
                    >
                      Use a different email
                    </Button>
                  </form>
                ) : null}
                {google ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      authClient.signIn.social({
                        callbackURL: destination,
                        provider: "google",
                      })
                    }
                  >
                    Continue with Google
                  </Button>
                ) : null}
              </>
            )}
            {error ? (
              <p role="alert" className="text-destructive text-sm">
                {error}
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </PageTransition>
  );
};

export const Route = createFileRoute("/_site/sign-in")({
  component: SignInPage,
  head: () => metadata,
  headers: () => ({ "Cache-Control": "private, no-store" }),
  loader: () => loadSignIn(),
  validateSearch: (search: Record<string, unknown>) => ({
    next: typeof search.next === "string" ? search.next : undefined,
  }),
});
