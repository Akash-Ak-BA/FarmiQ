import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { completeTaskTransaction } from "@/lib/task-service";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let taskId: bigint;
    try {
      taskId = BigInt(params.id);
    } catch {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
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

    const result = await completeTaskTransaction(taskId, userId);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error("POST /api/tasks/[id]/complete error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
