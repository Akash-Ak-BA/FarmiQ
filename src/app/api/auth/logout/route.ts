import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteSession, SESSION_COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
      await deleteSession(token);
    }

    // Clear session cookie
    cookieStore.delete(SESSION_COOKIE_NAME);

    return NextResponse.json({ success: true, message: "Logged out successfully" });
  } catch (error: any) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to log out" },
      { status: 500 }
    );
  }
}
