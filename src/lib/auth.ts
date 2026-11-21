import crypto from "crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { db } from "./db";

export const SESSION_COOKIE_NAME = "farmiq_session";
export const SESSION_DURATION_SECONDS = 365 * 24 * 60 * 60; // 1 year ("stay signed in")

export interface SafeUser {
  id: string;
  phone: string;
  name: string;
  district: string | null;
  language: "en" | "ta" | "te";
  theme: "system" | "light" | "dark";
  isAdmin: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export function serializeUser(user: any): SafeUser {
  return {
    id: user.id.toString(),
    phone: user.phone,
    name: user.name,
    district: user.district || null,
    language: user.language,
    theme: user.theme,
    isAdmin: Boolean(user.isAdmin),
    createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : String(user.createdAt),
    lastLoginAt: user.lastLoginAt instanceof Date ? user.lastLoginAt.toISOString() : (user.lastLoginAt ? String(user.lastLoginAt) : null),
  };
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: bigint, userAgent?: string): Promise<{ token: string; expiresAt: Date }> {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_SECONDS * 1000);

  await db.session.create({
    data: {
      userId,
      tokenHash,
      userAgent: userAgent ? userAgent.substring(0, 255) : null,
      expiresAt,
    },
  });

  return { token, expiresAt };
}

export async function validateSessionToken(token: string): Promise<SafeUser | null> {
  if (!token || token.length < 32) return null;

  const tokenHash = hashToken(token);
  const session = await db.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!session) return null;

  // Check expiration
  if (new Date() > session.expiresAt) {
    // Delete expired session
    await db.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  return serializeUser(session.user);
}

export async function deleteSession(token: string): Promise<void> {
  if (!token) return;
  const tokenHash = hashToken(token);
  await db.session.deleteMany({
    where: { tokenHash },
  });
}

/**
 * Reads the session cookie and returns the authenticated user or null.
 * Works inside Next.js Server Components, Server Actions, and Route Handlers.
 */
export async function getCurrentUser(): Promise<SafeUser | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return await validateSessionToken(token);
  } catch {
    return null;
  }
}

/**
 * Shared Privacy Helper: Ensures that every private database operation
 * is strictly filtered by the authenticated user's ID.
 */
export function scopeToUser<T extends object>(userId: string | bigint, whereClause: T = {} as T): T & { userId: bigint } {
  const parsedId = typeof userId === "string" ? BigInt(userId) : userId;
  return {
    ...whereClause,
    userId: parsedId,
  };
}
