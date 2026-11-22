import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureDefaultNotifications, serializeNotification } from "@/lib/task-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    let user = await getCurrentUser();
    let userId: bigint;

    if (user) {
      userId = BigInt(user.id);
    } else {
      const firstUser = await db.user.findFirst();
      if (!firstUser) {
        return NextResponse.json({ notifications: [], unreadCount: 0 });
      }
      userId = firstUser.id;
    }

    // Ensure default notifications exist
    await ensureDefaultNotifications(userId);

    const notifications = await db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;
    const serialized = notifications.map(serializeNotification);

    return NextResponse.json({
      notifications: serialized,
      unreadCount,
    });
  } catch (error: any) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
