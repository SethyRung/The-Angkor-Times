import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

interface Payload {
  userId: string;
  [key: string]: any;
}

const PUBLIC_ROUTES: { pattern: RegExp; methods: string[] }[] = [
  { pattern: /^\/api\/auth\/login$/, methods: ["POST"] },
  { pattern: /^\/api\/auth\/register$/, methods: ["POST"] },
  { pattern: /^\/api\/auth\/refresh$/, methods: ["POST"] },
  { pattern: /^\/api\/auth\/check$/, methods: ["GET"] },
  { pattern: /^\/api\/news$/, methods: ["GET"] },
  { pattern: /^\/api\/news\/[a-f0-9-]+$/, methods: ["GET"] },
  { pattern: /^\/api\/categories$/, methods: ["GET"] },
  { pattern: /^\/api\/categories\/[a-f0-9-]+$/, methods: ["GET"] },
  { pattern: /^\/api\/navigation$/, methods: ["GET"] },
  { pattern: /^\/api\/tags$/, methods: ["GET"] },
  { pattern: /^\/api\/_nuxt_icon\/.*$/, methods: ["GET"] },
];

export function isPublicRoute(path: string, method: string | undefined): boolean {
  return PUBLIC_ROUTES.some(
    (route) =>
      route.pattern.test(path) && (!method || route.methods.includes(method.toUpperCase())),
  );
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateTokens<T extends Payload>(
  payload: T,
  config: { secret: string; expiresIn: string },
) {
  return jwt.sign(payload, config.secret, {
    expiresIn: config.expiresIn as Parameters<typeof jwt.sign>[2]["expiresIn"],
  });
}

export function verifyToken<T extends Payload>(
  token: string,
  config: { secret: string },
): T | null {
  try {
    return jwt.verify(token, config.secret) as T;
  } catch {
    return null;
  }
}

export function expiresInToDate(expiresIn: string): Date {
  const now = new Date();
  const match = expiresIn.match(/^(\d+)([dhms])$/);
  if (!match) throw new Error(`Invalid expiresIn format: ${expiresIn}`);

  const value = Number.parseInt(match[1]!, 10);
  const unit = match[2];

  switch (unit) {
    case "d":
      return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
    case "h":
      return new Date(now.getTime() + value * 60 * 60 * 1000);
    case "m":
      return new Date(now.getTime() + value * 60 * 1000);
    case "s":
      return new Date(now.getTime() + value * 1000);
    default:
      throw new Error(`Invalid expiresIn unit: ${unit}`);
  }
}

export function expiresInToSeconds(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)([dhms])$/);
  if (!match) throw new Error(`Invalid expiresIn format: ${expiresIn}`);

  const [, valueStr, unit] = match;
  if (!valueStr || !unit) throw new Error(`Invalid expiresIn format: ${expiresIn}`);

  const value = Number.parseInt(valueStr, 10);
  const unitMultipliers: Record<string, number> = { d: 86400, h: 3600, m: 60, s: 1 };
  const multiplier = unitMultipliers[unit];
  if (!multiplier) throw new Error(`Invalid expiresIn unit: ${unit}`);

  return value * multiplier;
}

export function isAdmin(role: string | undefined): boolean {
  return role === "admin";
}

export function isEditorOrAdmin(role: string | undefined): boolean {
  return role === "admin" || role === "editor";
}
