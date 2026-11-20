import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { apiKey, user } from "@/lib/db/schema";

const KEY_PREFIX = "tk_";

const hashKey = async (key: string) => {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(key)
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
};

const randomSecret = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCodePoint(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/u, "");
};

export interface ApiKeyInfo {
  prefix: string;
  createdAt: number;
}

export const getApiKeyInfo = async (
  userId: string
): Promise<ApiKeyInfo | null> => {
  const [row] = await getDb()
    .select({ createdAt: apiKey.createdAt, prefix: apiKey.prefix })
    .from(apiKey)
    .where(eq(apiKey.userId, userId))
    .limit(1);
  return row ?? null;
};

export const createApiKey = async (
  userId: string
): Promise<ApiKeyInfo & { key: string }> => {
  const secret = randomSecret();
  const key = `${KEY_PREFIX}${secret}`;
  const prefix = `${KEY_PREFIX}${secret.slice(0, 8)}`;
  const createdAt = Date.now();
  const values = { createdAt, keyHash: await hashKey(key), prefix };
  await getDb()
    .insert(apiKey)
    .values({ ...values, userId })
    .onConflictDoUpdate({ set: values, target: apiKey.userId });
  return { createdAt, key, prefix };
};

export const revokeApiKey = async (userId: string) => {
  await getDb().delete(apiKey).where(eq(apiKey.userId, userId));
};

export interface ApiKeyOwner {
  email: string;
  emailVerified: boolean;
}

export const verifyApiKey = async (
  token: string
): Promise<ApiKeyOwner | null> => {
  if (!token.startsWith(KEY_PREFIX) || token.length > 128) {
    return null;
  }
  const [owner] = await getDb()
    .select({ email: user.email, emailVerified: user.emailVerified })
    .from(apiKey)
    .innerJoin(user, eq(user.id, apiKey.userId))
    .where(eq(apiKey.keyHash, await hashKey(token)))
    .limit(1);
  return owner ?? null;
};
