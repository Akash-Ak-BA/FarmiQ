import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import {
  verifyPassword,
  createSession,
  serializeUser,
  SESSION_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, password } = body;

    if (!phone || !phone.trim()) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }
    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");

    // Find user in users table
    const user = await db.user.findUnique({
      where: { phone: cleanPhone },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Incorrect phone number or password" },
        { status: 401 }
      );
    }

    // Verify bcrypt hash
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Incorrect phone number or password" },
        { status: 401 }
      );
    }

    // Update last_login_at
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Create session (1 year long-lived session token)
    const userAgent = req.headers.get("user-agent") || undefined;
    const { token, expiresAt } = await createSession(user.id, userAgent);

    // Set secure HTTP-only cookie
    const cookieStore = cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DURATION_SECONDS,
      expires: expiresAt,
    });

    return NextResponse.json({
      success: true,
      user: serializeUser(user),
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sign in" },
      { status: 500 }
    );
  }
}
