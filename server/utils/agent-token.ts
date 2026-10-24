import { createHash, randomBytes } from "node:crypto";
import { db, schema } from "@nuxthub/db";
import { desc } from "drizzle-orm";
import { now } from "#shared/utils/date";

export const TOKEN_EXPIRIES = ["30d", "90d", "180d", "1y", "never"] as const;
export type TokenExpiry = (typeof TOKEN_EXPIRIES)[number];

const KEY_PREFIX = "atk_";

export type PublicAgentToken = {
  id: string;
  name: string;
  key: string | null;
  createdAt: Date | null;
  expiresAt: Date | null;
};

export function createAgentToken() {
  const secret = KEY_PREFIX + randomBytes(32).toString("base64url");
  return { secret, key: `${KEY_PREFIX}...${secret.slice(-4)}` };
}

export function hashAgentToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function isTokenExpiry(value: unknown): value is TokenExpiry {
  return typeof value === "string" && (TOKEN_EXPIRIES as readonly string[]).includes(value);
}

export function expiryDate(choice: TokenExpiry): Date | null {
  if (choice === "never") return null;
  const start = now();
  if (choice === "1y") return start.add(1, "year").toDate();
  const days = { "30d": 30, "90d": 90, "180d": 180 }[choice];
  return start.add(days, "day").toDate();
}

export async function agentTokensByUser() {
  const rows = await db
    .select({
      id: schema.agentTokens.id,
      userId: schema.agentTokens.userId,
      name: schema.agentTokens.name,
      keyHint: schema.agentTokens.keyHint,
      createdAt: schema.agentTokens.createdAt,
      expiresAt: schema.agentTokens.expiresAt,
    })
    .from(schema.agentTokens)
    .orderBy(desc(schema.agentTokens.createdAt));

  const grouped = new Map<string, PublicAgentToken[]>();
  for (const row of rows) {
    const list = grouped.get(row.userId) ?? [];
    list.push({
      id: row.id,
      name: row.name,
      key: row.keyHint,
      createdAt: row.createdAt,
      expiresAt: row.expiresAt,
    });
    grouped.set(row.userId, list);
  }
  return grouped;
}
