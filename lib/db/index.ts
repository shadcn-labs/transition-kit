import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import type { DrizzleD1Database } from "drizzle-orm/d1";

import * as schema from "@/lib/db/schema";

export type Db = DrizzleD1Database<typeof schema>;

export const getDb = (): Db => drizzle(env.DB, { schema });
