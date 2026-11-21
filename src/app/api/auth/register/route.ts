import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import {
  hashPassword,
  createSession,
  serializeUser,
  SESSION_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, password, district, language, theme } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!phone || !phone.trim()) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }
    if (!password || password.length < 4) {
      return NextResponse.json({ error: "Password must be at least 4 characters" }, { status: 400 });
    }

    // Clean phone number (strip spaces, dashes, brackets)
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");

    // Check if phone already exists
    const existing = await db.user.findUnique({
      where: { phone: cleanPhone },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this phone number already exists. Please sign in." },
        { status: 409 }
      );
    }

    // Hash password with bcrypt
    const passwordHash = await hashPassword(password);

    // Create user in MySQL
    const validLanguages = ["en", "ta", "te"] as const;
    const selectedLanguage = validLanguages.includes(language) ? language : "en";

    const validThemes = ["system", "light", "dark"] as const;
    const selectedTheme = validThemes.includes(theme) ? theme : "system";

    const newUser = await db.user.create({
      data: {
        name: name.trim(),
        phone: cleanPhone,
        passwordHash,
        district: district ? district.trim() : null,
        language: selectedLanguage,
        theme: selectedTheme,
        lastLoginAt: new Date(),
      },
    });

    // Create session (1 year "stay signed in")
    const userAgent = req.headers.get("user-agent") || undefined;
    const { token, expiresAt } = await createSession(newUser.id, userAgent);

    // Set HTTP-only cookie
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
      user: serializeUser(newUser),
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create account" },
      { status: 500 }
    );
  }
}
