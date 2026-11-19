import { getRequestHeaders } from "@tanstack/react-start/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import { hasProAccess } from "@/lib/billing";
import { getDb } from "@/lib/db";
import * as schema from "@/lib/db/schema";

const isDev = process.env.NODE_ENV !== "production";

export const isGoogleSignInEnabled = () =>
  Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export const isEmailSignInEnabled = () =>
  Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM) || isDev;

export const getAuthConfigurationError = (): string | null => {
  if (
    !process.env.BETTER_AUTH_SECRET ||
    process.env.BETTER_AUTH_SECRET.length < 32
  ) {
    return "Authentication is not configured: set BETTER_AUTH_SECRET to a random secret of at least 32 characters.";
  }
  if (!process.env.BETTER_AUTH_URL) {
    return "Authentication is not configured: set BETTER_AUTH_URL to this site's origin.";
  }
  if (!isEmailSignInEnabled() && !isGoogleSignInEnabled()) {
    return "Sign-in is not configured: add RESEND_API_KEY and EMAIL_FROM, or configure a Google OAuth client.";
  }
  if (process.env.RESEND_API_KEY && !process.env.EMAIL_FROM) {
    return "Email sign-in is not configured: set EMAIL_FROM to a verified Resend sender.";
  }
  return null;
};

const sendSignInCode = async (email: string, otp: string) => {
  if (!process.env.RESEND_API_KEY && isDev) {
    console.info(`[auth] sign-in code for ${email}: ${otp}`);
    return;
  }
  const response = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      html: `<div style="background:#f5f4ef;padding:32px;font-family:Arial,sans-serif;color:#18181b"><div style="border:1px solid #18181b;padding:32px;max-width:460px;margin:auto"><p>SHADCN LABS / TRANSITION-KIT</p><h1>Your sign-in code</h1><p style="background:#f06292;padding:20px;font-size:36px;letter-spacing:8px">${otp}</p><p>This code expires in 10 minutes. If you did not request it, you can safely ignore this email.</p></div></div>`,
      subject: `${otp} is your transition-kit sign-in code`,
      text: `Your transition-kit sign-in code is ${otp}. It expires in 10 minutes. If you did not request this code, ignore this email.\n\ntransition-kit by Shadcn Labs`,
      to: [email],
    }),
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(
      "The email provider could not deliver your code. Check the configured sender and try again."
    );
  }
};

const createAuth = () =>
  betterAuth({
    advanced: {
      ipAddress: { ipAddressHeaders: ["cf-connecting-ip"] },
    },
    appName: "transition-kit",
    baseURL: process.env.BETTER_AUTH_URL,
    database: drizzleAdapter(getDb(), { provider: "sqlite", schema }),
    plugins: [
      emailOTP({
        allowedAttempts: 5,
        expiresIn: 60 * 10,
        otpLength: 6,
        sendVerificationOTP: ({ email, otp }) => sendSignInCode(email, otp),
        storeOTP: "hashed",
      }),
      tanstackStartCookies(),
    ],
    rateLimit: {
      customRules: {
        "/email-otp/send-verification-otp": { max: 3, window: 60 },
        "/sign-in/email-otp": { max: 10, window: 60 },
      },
      enabled: true,
      storage: "database",
    },
    secret: process.env.BETTER_AUTH_SECRET,
    socialProviders: isGoogleSignInEnabled()
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
          },
        }
      : {},
    user: { deleteUser: { enabled: true } },
  });

let auth: ReturnType<typeof createAuth> | undefined;

export const getAuth = () => {
  const error = getAuthConfigurationError();
  if (error) {
    throw new Error(error);
  }
  auth ??= createAuth();
  return auth;
};

export interface Session {
  user: { id: string; email: string; emailVerified: boolean; name: string };
}

export const getSession = async (
  headers: Headers = getRequestHeaders()
): Promise<Session | null> => {
  if (getAuthConfigurationError()) {
    return null;
  }
  const session = await getAuth().api.getSession({ headers });
  if (!session) {
    return null;
  }
  const { id, email, emailVerified, name } = session.user;
  return { user: { email, emailVerified, id, name } };
};

export const getProAccess = (session: Session | null): Promise<boolean> =>
  session?.user.emailVerified
    ? hasProAccess(session.user.email)
    : Promise.resolve(false);
