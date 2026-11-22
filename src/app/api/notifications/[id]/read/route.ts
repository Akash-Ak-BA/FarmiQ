import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let notifId: bigint;
    try {
      notifId = BigInt(params.id);
    } catch {
      return NextResponse.json({ error: "Invalid notification ID" }, { status: 400 });
    }

    let user = await getCurrentUser();
    let userId: bigint;

    if (user) {
      userId = BigInt(user.id);
    } else {
      const firstUser = await db.user.findFirst();
      if (!firstUser) {
        return NextResponse.json({ error: "User not found" }, { status: 401 });
      }
      userId = firstUser.id;
    }

    await db.notification.updateMany({
      where: {
        id: notifId,
        userId,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("POST /api/notifications/[id]/read error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
