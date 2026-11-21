import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { language, theme } = body;

    const dataToUpdate: any = {};

    if (language && ["en", "ta", "te"].includes(language)) {
      dataToUpdate.language = language;
    }
    if (theme && ["system", "light", "dark"].includes(theme)) {
      dataToUpdate.theme = theme;
    }

    if (Object.keys(dataToUpdate).length > 0) {
      await db.user.update({
        where: { id: BigInt(user.id) },
        data: dataToUpdate,
      });
    }

    return NextResponse.json({ success: true, updated: dataToUpdate });
  } catch (error: any) {
    console.error("Preferences update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update preferences" },
      { status: 500 }
    );
  }
}
