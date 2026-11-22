import { db } from "./db";
import { formatDueDate } from "./crop-service";

export type ActivityType =
  | "sowing"
  | "watering"
  | "fertilizer"
  | "pesticide"
  | "weeding"
  | "labour"
  | "harvest"
  | "other";

export function mapActivityTypeFromTitle(title: string): ActivityType {
  const t = title.toLowerCase();
  if (t.includes("fertilizer") || t.includes("urea") || t.includes("potash") || t.includes("nutrient")) {
    return "fertilizer";
  }
  if (t.includes("spray") || t.includes("pesticide") || t.includes("neem") || t.includes("pest")) {
    return "pesticide";
  }
  if (t.includes("weed") || t.includes("hoeing")) {
    return "weeding";
  }
  if (t.includes("water") || t.includes("drain") || t.includes("irrigation") || t.includes("moisture")) {
    return "watering";
  }
  if (t.includes("harvest") || t.includes("threshing") || t.includes("picking")) {
    return "harvest";
  }
  if (t.includes("sowing") || t.includes("seed") || t.includes("planting")) {
    return "sowing";
  }
  return "other";
}

export function serializeTask(task: any) {
  return {
    id: task.id.toString(),
    userId: task.userId.toString(),
    cropId: task.cropId ? task.cropId.toString() : null,
    cropName: task.crop?.cropName || "General Crop",
    plotName: task.crop?.plot?.name || "Main Plot",
    title: task.title,
    dueDate: task.dueDate instanceof Date ? task.dueDate.toISOString().split("T")[0] : String(task.dueDate),
    dueFormatted: task.dueDate instanceof Date ? formatDueDate(task.dueDate) : String(task.dueDate),
    remindAt: task.remindAt ? (task.remindAt instanceof Date ? task.remindAt.toISOString() : String(task.remindAt)) : null,
    status: task.status as "pending" | "done",
    completedAt: task.completedAt ? (task.completedAt instanceof Date ? task.completedAt.toISOString() : String(task.completedAt)) : null,
    confirmedBy: task.confirmedBy ? task.confirmedBy.toString() : null,
    source: task.source,
    createdAt: task.createdAt instanceof Date ? task.createdAt.toISOString() : String(task.createdAt),
  };
}

export function serializeNotification(notif: any) {
  return {
    id: notif.id.toString(),
    userId: notif.userId.toString(),
    type: notif.type,
    title: notif.title,
    body: notif.body,
    link: notif.link,
    isRead: Boolean(notif.isRead),
    createdAt: notif.createdAt instanceof Date ? notif.createdAt.toISOString() : String(notif.createdAt),
  };
}

/**
 * Completes a task in a database transaction:
 * 1. Updates task status to 'done', completed_at to NOW(), confirmed_by to userId
 * 2. Automatically logs an activity into activities table
 * 3. Creates a notification for the farmer
 */
export async function completeTaskTransaction(taskId: bigint, userId: bigint) {
  return await db.$transaction(async (tx) => {
    // 1. Fetch task with linked crop & plot
    const task = await tx.task.findUnique({
      where: { id: taskId },
      include: {
        crop: {
          include: {
            plot: true,
          },
        },
      },
    });

    if (!task) {
      throw new Error("Task not found");
    }

    if (task.userId !== userId) {
      throw new Error("Access denied: You do not own this task");
    }

    const now = new Date();

    // 2. Update task
    const updatedTask = await tx.task.update({
      where: { id: taskId },
      data: {
        status: "done",
        completedAt: now,
        confirmedBy: userId,
      },
      include: {
        crop: {
          include: {
            plot: true,
          },
        },
      },
    });

    // 3. Auto-insert into activities table
    const actType = mapActivityTypeFromTitle(task.title);
    const newActivity = await tx.activity.create({
      data: {
        userId,
        cropId: task.cropId,
        plotId: task.crop?.plotId || null,
        activityDate: now,
        type: actType,
        notes: `Completed scheduled task: ${task.title}`,
        cost: 0,
      },
    });

    // 4. Auto-create a task completion notification
    const newNotification = await tx.notification.create({
      data: {
        userId,
        type: "task",
        title: `Task Completed: ${task.title}`,
        body: `Logged into Daily Log for ${task.crop?.cropName || "your farm"}.`,
        link: "/daily-log",
        isRead: false,
      },
    });

    return {
      task: serializeTask(updatedTask),
      activityId: newActivity.id.toString(),
      notificationId: newNotification.id.toString(),
    };
  });
}

/**
 * Seeds starter notifications for a farmer if none exist yet.
 */
export async function ensureDefaultNotifications(userId: bigint): Promise<void> {
  const count = await db.notification.count({
    where: { userId },
  });

  if (count > 0) return;

  await db.notification.createMany({
    data: [
      {
        userId,
        type: "weather",
        title: "Rain Forecast Alert",
        body: "Rain expected tomorrow afternoon (70% probability). Avoid spraying chemicals today.",
        link: "/weather",
        isRead: false,
      },
      {
        userId,
        type: "task",
        title: "Fertilizer Schedule Due",
        body: "Apply Urea & Potash on Paddy (Plot A) before tillering stage.",
        link: "/crops/detail",
        isRead: false,
      },
      {
        userId,
        type: "stock",
        title: "Inventory Low Stock",
        body: "Neem oil stock is running low. Tap to view inventory.",
        link: "/inventory",
        isRead: false,
      },
      {
        userId,
        type: "price",
        title: "Mandi Price Update",
        body: "Tomato prices surged by ₹4/kg at Madurai APMC mandi today.",
        link: "/market-prices",
        isRead: true,
      },
    ],
  });
}
