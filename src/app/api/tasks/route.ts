import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { serializeTask } from "@/lib/task-service";

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
        return NextResponse.json({ tasks: [] });
      }
      userId = firstUser.id;
    }

    const { searchParams } = new URL(req.url);
    const cropIdParam = searchParams.get("cropId");
    const statusParam = searchParams.get("status");

    const where: any = { userId };
    if (cropIdParam) {
      try {
        where.cropId = BigInt(cropIdParam);
      } catch {}
    }
    if (statusParam === "pending" || statusParam === "done") {
      where.status = statusParam;
    }

    const tasks = await db.task.findMany({
      where,
      include: {
        crop: {
          include: {
            plot: true,
          },
        },
      },
      orderBy: [
        { status: "asc" }, // 'pending' comes before 'done'
        { dueDate: "asc" },
      ],
    });

    const serialized = tasks.map(serializeTask);
    return NextResponse.json({ tasks: serialized });
  } catch (error: any) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
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

    const body = await req.json();
    const { cropId, title, dueDate, remindAt } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Task title is required" }, { status: 400 });
    }
    if (!dueDate) {
      return NextResponse.json({ error: "Due date is required" }, { status: 400 });
    }

    let parsedCropId: bigint | null = null;
    if (cropId) {
      try {
        parsedCropId = BigInt(cropId);
      } catch {}
    }

    const newTask = await db.task.create({
      data: {
        userId,
        cropId: parsedCropId,
        title: title.trim(),
        dueDate: new Date(dueDate),
        remindAt: remindAt ? new Date(remindAt) : null,
        status: "pending",
        source: "manual",
      },
      include: {
        crop: {
          include: {
            plot: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      task: serializeTask(newTask),
    });
  } catch (error: any) {
    console.error("POST /api/tasks error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
