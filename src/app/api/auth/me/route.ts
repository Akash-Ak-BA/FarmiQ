import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }
    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Auth check error:", error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
