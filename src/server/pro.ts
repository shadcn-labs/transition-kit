import {
  createApiKey,
  getApiKeyInfo,
  revokeApiKey,
  verifyApiKey,
} from "@/lib/api-keys";
import {
  getAuth,
  getAuthConfigurationError,
  getProAccess,
  getSession,
} from "@/lib/auth";
import {
  applyBillingEvent,
  appOrigin,
  billingCustomerId,
  createCheckout,
  getActivePlan,
  getBillingConfigurationError,
  getDodo,
  hasProAccess,
  isSameOrigin,
  missingPlanProduct,
} from "@/lib/billing";
import type { BillingEvent } from "@/lib/billing";
import { findPlan, isTeamSeatCount, TEAM } from "@/lib/plans";
import { PRO_API_KEY_ENV } from "@/lib/pro-install";
import { getProRegistryItem, ProRegistryError } from "@/lib/pro-registry";
import { isProItem } from "@/registry/pro-catalog";

const privateHeaders = { "Cache-Control": "private, no-store", Vary: "Cookie" };

export const handleAuth = (request: Request) => {
  const error = getAuthConfigurationError();
  if (error) {
    return Response.json({ error }, { status: 503 });
  }
  return getAuth().handler(request);
};

export const handleCheckout = async (request: Request) => {
  if (!isSameOrigin(request)) {
    return Response.json({ error: "Invalid request origin." }, { status: 403 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON request." }, { status: 400 });
  }
  const fields =
    body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const plan = findPlan(fields.plan);
  if (!plan) {
    return Response.json(
      { error: "Choose annual, lifetime, or team." },
      { status: 400 }
    );
  }
  const seats = isTeamSeatCount(fields.seats) ? fields.seats : undefined;
  if (plan.slug === "team" && seats === undefined) {
    return Response.json(
      {
        error: `Team needs ${TEAM.minSeats} to ${TEAM.maxSeats} seats. Larger teams: contact us.`,
      },
      { status: 400 }
    );
  }
  const configurationError = getBillingConfigurationError();
  if (configurationError) {
    return Response.json({ error: configurationError }, { status: 503 });
  }
  const missing = missingPlanProduct(plan.slug);
  if (missing) {
    return Response.json(
      { error: `Billing is not configured: ${missing} is missing.` },
      { status: 503 }
    );
  }
  const session = await getSession(request.headers);
  try {
    const checkoutUrl = await createCheckout(
      session ? { email: session.user.email, id: session.user.id } : null,
      plan.slug,
      seats
    );
    return Response.json(
      { checkoutUrl },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return Response.json(
      {
        error:
          "The payment provider could not start checkout. Please try again.",
      },
      { status: 502 }
    );
  }
};

const webhookSigningKey = () =>
  process.env.DODO_PAYMENTS_WEBHOOK_KEY ||
  (process.env.NODE_ENV !== "production" &&
  process.env.DODO_PAYMENTS_ENVIRONMENT === "test_mode"
    ? process.env.TK_LOCAL_WEBHOOK_KEY
    : undefined);

export const handleWebhookInfo = () =>
  Response.json(
    {
      configured: Boolean(process.env.DODO_PAYMENTS_WEBHOOK_KEY),
      endpoint: "transition-kit Dodo webhook",
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "x-transition-kit-webhook": "dodo",
      },
    }
  );

export const handleWebhook = async (request: Request) => {
  const key = webhookSigningKey();
  if (!key || !process.env.DODO_PAYMENTS_API_KEY) {
    return Response.json(
      { error: "Dodo webhook verification is not configured." },
      { status: 503 }
    );
  }
  const webhookId = request.headers.get("webhook-id");
  if (!webhookId) {
    return Response.json({ error: "Missing webhook-id." }, { status: 400 });
  }
  const raw = await request.text();
  let event: BillingEvent;
  try {
    event = getDodo().webhooks.unwrap(raw, {
      headers: Object.fromEntries(request.headers),
      key,
    });
  } catch {
    return Response.json(
      { error: "Invalid webhook signature." },
      { status: 401 }
    );
  }
  try {
    await applyBillingEvent(webhookId, event);
    return Response.json({ received: true });
  } catch {
    return Response.json(
      { error: "Webhook could not be persisted. Delivery should be retried." },
      { status: 503 }
    );
  }
};

export const handlePortal = async (request: Request) => {
  const session = await getSession(request.headers);
  if (!session?.user.emailVerified) {
    return Response.json(
      { error: "Sign in to manage billing." },
      { status: 401 }
    );
  }
  if (!isSameOrigin(request)) {
    return Response.json({ error: "Invalid request origin." }, { status: 403 });
  }
  const customerId = await billingCustomerId(session.user.email);
  if (!customerId) {
    return Response.json(
      { error: "No purchase exists for this email yet. Choose a plan first." },
      { status: 404 }
    );
  }
  try {
    const portal = await getDodo().customers.customerPortal.create(customerId, {
      return_url: `${appOrigin()}/pricing`,
    });
    return Response.json(
      { url: portal.link },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return Response.json(
      { error: "The billing portal is unavailable. Please try again." },
      { status: 502 }
    );
  }
};

const unauthorized = () =>
  Response.json(
    { error: "Sign in to manage your API key." },
    { headers: privateHeaders, status: 401 }
  );

export const handleApiKey = async (request: Request) => {
  const session = await getSession(request.headers);
  if (!session) {
    return unauthorized();
  }
  if (request.method === "GET") {
    const [key, pro] = await Promise.all([
      getApiKeyInfo(session.user.id),
      getProAccess(session),
    ]);
    return Response.json({ key, pro }, { headers: privateHeaders });
  }
  if (!isSameOrigin(request)) {
    return Response.json({ error: "Invalid request origin." }, { status: 403 });
  }
  if (request.method === "POST") {
    return Response.json(await createApiKey(session.user.id), {
      headers: privateHeaders,
    });
  }
  await revokeApiKey(session.user.id);
  return new Response(null, { headers: privateHeaders, status: 204 });
};

const registryHeaders = {
  "Cache-Control": "private, no-store",
  Vary: "Authorization",
};

export const handleProRegistry = async (request: Request, file: string) => {
  const token = request.headers
    .get("authorization")
    ?.match(/^Bearer\s+(?<token>\S+)$/iu)?.groups?.token;
  const owner = token ? await verifyApiKey(token) : null;
  if (!owner) {
    return Response.json(
      {
        error: `This is a transition-kit Pro component. Add your API key as ${PRO_API_KEY_ENV} and send it from the @transition-kit registry in components.json. See https://transition-kit.space/docs/registry#transition-kit-pro.`,
      },
      { headers: registryHeaders, status: 401 }
    );
  }
  if (!(owner.emailVerified && (await hasProAccess(owner.email)))) {
    return Response.json(
      { error: "An active transition-kit Pro plan is required." },
      { headers: registryHeaders, status: 403 }
    );
  }
  const name = file.endsWith(".json") ? file.slice(0, -".json".length) : "";
  try {
    if (!isProItem(name)) {
      throw new ProRegistryError("Component not found.", 404);
    }
    const item = await getProRegistryItem(name);
    return Response.json(item, { headers: registryHeaders });
  } catch (error) {
    if (error instanceof ProRegistryError) {
      return Response.json(
        { error: error.message },
        { headers: registryHeaders, status: error.status }
      );
    }
    throw error;
  }
};

export const handleMe = async (request: Request) => {
  const session = await getSession(request.headers);
  if (!session) {
    return Response.json(
      { pro: false, signedIn: false },
      { headers: privateHeaders }
    );
  }
  const verified = session.user.emailVerified;
  const [plan, key] = await Promise.all([
    verified ? getActivePlan(session.user.email) : null,
    getApiKeyInfo(session.user.id),
  ]);
  return Response.json(
    {
      email: session.user.email,
      key,
      plan,
      pro: Boolean(plan),
      signedIn: true,
    },
    { headers: privateHeaders }
  );
};
