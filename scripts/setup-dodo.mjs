import { chmodSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";

import DodoPayments, { APIError } from "dodopayments";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const ENV_FILE = `${ROOT}.dev.vars`;
const sameName = (a, b) =>
  typeof a === "string" && a.toLowerCase() === b.toLowerCase();

const SITE_URL = "https://transition-kit.space";
const BRAND = {
  description:
    "transition-kit by Abdullah Mukadam: animated React components built on View Transitions. transition-kit Pro unlocks every Pro component's source.",
  name: "transition-kit",
  statement_descriptor: "TRANSITIONKIT",
  support_email: "support@transition-kit.space",
  url: SITE_URL,
};
const SUMMARY =
  "transition-kit Pro: every Pro component, installed as copy-ready source with the shadcn CLI.";
const recurringPrice = (price, interval) => ({
  currency: "USD",
  payment_frequency_count: 1,
  payment_frequency_interval: interval,
  price,
  subscription_period_count: 20,
  subscription_period_interval: "Year",
  tax_inclusive: false,
  type: "recurring_price",
});
const oneTimePrice = (price) => ({
  currency: "USD",
  price,
  tax_inclusive: false,
  type: "one_time_price",
});
const PRODUCTS = [
  {
    description: `${SUMMARY} Billed annually; cancel anytime.`,
    key: "DODO_PRODUCT_PRO_ANNUAL",
    name: "transition-kit Pro — Annual",
    price: recurringPrice(17_900, "Year"),
  },
  {
    description: `${SUMMARY} Early-bird price, billed annually and kept on renewal; cancel anytime.`,
    key: "DODO_PRODUCT_PRO_ANNUAL_EARLY",
    name: "transition-kit Pro — Annual (Early bird)",
    price: recurringPrice(14_900, "Year"),
  },
  {
    description: `${SUMMARY} One-time payment; nothing renews.`,
    key: "DODO_PRODUCT_PRO_LIFETIME",
    name: "transition-kit Pro — Lifetime",
    price: oneTimePrice(24_900),
  },
  {
    description: `${SUMMARY} Early-bird price. One-time payment; nothing renews.`,
    key: "DODO_PRODUCT_PRO_LIFETIME_EARLY",
    name: "transition-kit Pro — Lifetime (Early bird)",
    price: oneTimePrice(19_900),
  },
  {
    description: `${SUMMARY} Team license base, sold with per-seat lines; members share one team API key. One-time payment; nothing renews.`,
    key: "DODO_PRODUCT_PRO_TEAM",
    name: "transition-kit Pro — Team",
    price: oneTimePrice(19_900),
  },
  {
    description: `${SUMMARY} One Team seat, bought alongside the Team license. One-time payment; nothing renews.`,
    key: "DODO_PRODUCT_PRO_TEAM_SEAT",
    name: "transition-kit Pro — Team seat",
    price: oneTimePrice(3000),
  },
];
const samePrice = (product, spec) =>
  Object.entries(spec.price).every(
    ([key, value]) => product.price?.[key] === value
  );
const WEBHOOK_EVENTS = [
  "payment.succeeded",
  "refund.succeeded",
  "dispute.opened",
  "subscription.active",
  "subscription.renewed",
  "subscription.updated",
  "subscription.plan_changed",
  "subscription.on_hold",
  "subscription.past_due",
  "subscription.paused",
  "subscription.unpaused",
  "subscription.cancelled",
  "subscription.expired",
  "subscription.failed",
];
class SetupError extends Error {
  name = "SetupError";
}
const log = (message) => console.error(message);
const readEnv = (path) =>
  existsSync(path) ? parseEnv(readFileSync(path, "utf-8")) : {};
const privateKey = (key, live) =>
  live ? key.replace(/^DODO_/u, "DODO_LIVE_") : key;

const saveEnv = (values) => {
  let content = existsSync(ENV_FILE) ? readFileSync(ENV_FILE, "utf-8") : "";
  for (const [key, value] of Object.entries(values)) {
    if (!key.startsWith("DODO_")) {
      throw new SetupError("Refusing non-Dodo env write.");
    }
    const line = `${key}=${JSON.stringify(value)}`;
    const pattern = new RegExp(`^${key}=.*$`, "mu");
    content = pattern.test(content)
      ? content.replace(pattern, () => line)
      : `${content.replace(/\n*$/u, "\n")}${line}\n`;
  }
  writeFileSync(ENV_FILE, content, { mode: 0o600 });
  chmodSync(ENV_FILE, 0o600);
};

const parseArgs = (args) => {
  const live = args.includes("--live");
  const credentialFiles = [];
  let webhookUrl;
  for (const arg of args) {
    if (arg === "--live") {
      continue;
    }
    if (arg.startsWith("--credentials-from=")) {
      credentialFiles.push(arg.slice("--credentials-from=".length));
    } else if (arg.startsWith("--webhook-url=")) {
      webhookUrl = arg.slice("--webhook-url=".length);
    } else {
      throw new SetupError(
        "Use --live, --credentials-from=<env file>, or --webhook-url=<HTTPS URL>."
      );
    }
  }
  return { credentialFiles, live, webhookUrl };
};

const resolveApiKey = (live, credentialFiles) => {
  const local = readEnv(ENV_FILE);
  const sources = [
    process.env,
    local,
    ...credentialFiles.map((path) => {
      if (!existsSync(path)) {
        throw new SetupError("The supplied credentials file does not exist.");
      }
      return readEnv(path);
    }),
  ];
  const apiKeyName = live
    ? "DODO_PAYMENTS_LIVE_API_KEY"
    : "DODO_PAYMENTS_API_KEY";
  const apiKey = sources
    .map(
      (source) =>
        source[apiKeyName] ||
        (live && source.DODO_PAYMENTS_ENVIRONMENT === "live_mode"
          ? source.DODO_PAYMENTS_API_KEY
          : undefined)
    )
    .find(Boolean);
  if (!apiKey) {
    throw new SetupError(
      `Set ${apiKeyName} in .dev.vars or provide --credentials-from=<env file>.`
    );
  }
  const environment = live ? "live_mode" : "test_mode";
  if (
    (!live && apiKey.startsWith("dodo_live_")) ||
    (live && apiKey.startsWith("dodo_test_"))
  ) {
    throw new SetupError(
      "The API key prefix does not match the selected environment."
    );
  }
  if (
    !live &&
    sources.find((source) => source.DODO_PAYMENTS_API_KEY === apiKey)
      ?.DODO_PAYMENTS_ENVIRONMENT === "live_mode"
  ) {
    throw new SetupError(
      "The active API key belongs to live mode; supply a test-mode key."
    );
  }
  return { apiKey, apiKeyName, environment };
};

const sameUrl = (url) => url?.replace(/\/+$/u, "") === SITE_URL;

const ensureBrand = async (dodo) => {
  const { items: brands } = await dodo.brands.list();
  const matches = brands.filter(
    (brand) => sameName(brand.name, BRAND.name) && sameUrl(brand.url)
  );
  if (matches.length > 1) {
    throw new SetupError(
      "Multiple transition-kit brands match; resolve the duplicate in Dodo before setup."
    );
  }
  if (
    !matches.length &&
    brands.some((brand) => sameName(brand.name, BRAND.name))
  ) {
    throw new SetupError(
      "An existing transition-kit brand has a different URL; refusing to modify it."
    );
  }
  const brand = matches[0] ?? (await dodo.brands.create(BRAND));
  log(
    `transition-kit brand ${matches.length ? "reused" : "created"}; enabled=${brand.enabled}; verification=${brand.verification_status}.`
  );
  return brand;
};

const syncProducts = async (dodo, brand, live, values) => {
  const existing = [];
  for await (const product of dodo.products.list({ archived: false })) {
    existing.push(product);
  }
  const reusable = new Map();
  for (const item of existing) {
    if (!/^transition-kit pro\b/iu.test(item.name ?? "")) {
      continue;
    }
    const spec = PRODUCTS.find((entry) => sameName(item.name, entry.name));
    const product = await dodo.products.retrieve(item.product_id);
    const keep =
      spec &&
      !reusable.has(spec.key) &&
      product.brand_id === brand.brand_id &&
      product.tax_category === "digital_products" &&
      samePrice(product, spec);
    if (keep) {
      reusable.set(spec.key, product);
    } else {
      await dodo.products.archive(product.product_id);
      log(`${product.name} archived.`);
    }
  }
  for (const spec of PRODUCTS) {
    let product = reusable.get(spec.key);
    if (!product) {
      product = await dodo.products.create({
        brand_id: brand.brand_id,
        description: spec.description,
        metadata: {
          application: "transition-kit",
          plan: spec.key.replace("DODO_PRODUCT_PRO_", "").toLowerCase(),
        },
        name: spec.name,
        price: spec.price,
        tax_category: "digital_products",
      });
    } else if (product.description !== spec.description) {
      await dodo.products.update(product.product_id, {
        description: spec.description,
      });
      log(`${spec.name} description updated.`);
    }
    values[privateKey(spec.key, live)] = product.product_id;
    saveEnv(values);
    log(`${spec.name} ${reusable.has(spec.key) ? "reused" : "created"}.`);
  }
};

const parseWebhookUrl = (webhookUrl) => {
  let url;
  try {
    url = new URL(webhookUrl);
  } catch {
    throw new SetupError("Webhook URL must be an absolute HTTPS URL.");
  }
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.pathname !== "/api/webhooks/dodo" ||
    url.search ||
    url.hash
  ) {
    throw new SetupError(
      "Webhook URL must be HTTPS with path /api/webhooks/dodo and no credentials, query, or fragment."
    );
  }
  return url;
};

const registerWebhook = async (dodo, webhookUrl) => {
  const url = parseWebhookUrl(webhookUrl);
  const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  const bypassHeaders = bypass ? { "x-vercel-protection-bypass": bypass } : {};
  let response;
  try {
    response = await fetch(url, {
      headers: bypassHeaders,
      redirect: "error",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new SetupError(
      "Webhook health check failed; deploy the route directly at the supplied HTTPS URL first."
    );
  }
  if (
    !response.ok ||
    response.headers.get("x-transition-kit-webhook") !== "dodo"
  ) {
    throw new SetupError(
      "Webhook route is not deployed: GET must succeed with x-transition-kit-webhook: dodo."
    );
  }
  let hook;
  for await (const candidate of dodo.webhooks.list()) {
    if (candidate.url === url.href) {
      if (!sameName(candidate.description, "transition-kit")) {
        throw new SetupError(
          "This URL belongs to a non-transition-kit webhook; refusing to modify it."
        );
      }
      hook = candidate;
    }
  }
  if (hook) {
    const filter = hook.filter_types ?? [];
    if (
      hook.disabled ||
      (filter.length && WEBHOOK_EVENTS.some((event) => !filter.includes(event)))
    ) {
      hook = await dodo.webhooks.update(hook.id, {
        disabled: false,
        filter_types: filter.length
          ? [...new Set([...filter, ...WEBHOOK_EVENTS])]
          : undefined,
      });
    }
  } else {
    hook = await dodo.webhooks.create({
      description: "transition-kit",
      filter_types: WEBHOOK_EVENTS,
      url: url.href,
    });
  }
  if (bypass) {
    await dodo.webhooks.headers.update(hook.id, { headers: bypassHeaders });
  }
  return hook;
};

const setup = async () => {
  const { credentialFiles, live, webhookUrl } = parseArgs(
    process.argv.slice(2)
  );
  const { apiKey, apiKeyName, environment } = resolveApiKey(
    live,
    credentialFiles
  );
  const dodo = new DodoPayments({ bearerToken: apiKey, environment });
  log(`transition-kit Dodo setup (${environment}).`);
  const brand = await ensureBrand(dodo);
  const values = {
    [apiKeyName]: apiKey,
    [privateKey("DODO_BRAND_ID", live)]: brand.brand_id,
  };
  if (!live) {
    values.DODO_PAYMENTS_ENVIRONMENT = "test_mode";
  }
  saveEnv(values);
  await syncProducts(dodo, brand, live, values);
  const webhookKeyName = privateKey("DODO_PAYMENTS_WEBHOOK_KEY", live);
  if (webhookUrl) {
    const hook = await registerWebhook(dodo, webhookUrl);
    const { secret } = await dodo.webhooks.retrieveSecret(hook.id);
    values[webhookKeyName] = secret;
    values[privateKey("DODO_WEBHOOK_ID", live)] = hook.id;
    log(
      "transition-kit webhook registered/reused. Signed delivery has not been exercised."
    );
  } else {
    values[webhookKeyName] = readEnv(ENV_FILE)[webhookKeyName] ?? "";
    log(
      "Webhook registration skipped. Deploy /api/webhooks/dodo on public HTTPS, then rerun with --webhook-url=<URL>. No signing key was fabricated."
    );
  }
  saveEnv(values);
  log(
    `Saved ${live ? "inactive live" : "active test"} Dodo values privately to .dev.vars; non-Dodo variables preserved.`
  );
};

try {
  await setup();
} catch (error) {
  if (error instanceof SetupError) {
    log(error.message);
  } else if (error instanceof APIError) {
    log(
      `Dodo API request failed (HTTP ${error.status ?? "unknown"}); no API response or secrets printed.`
    );
  } else {
    log(
      "Dodo setup failed; inspect local configuration and network access. Error details suppressed to protect credentials."
    );
  }
  process.exitCode = 1;
}
