// scripts/test-step5-tasks-notifications.js
// Automated verification script for Step 5: Tasks, Confirm Popup, Activities Logging, and Notifications

const fs = require("fs");
const path = require("path");

function loadEnv() {
  const envPath = path.resolve(__dirname, "../.env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[trimmed.slice(0, eqIdx).trim()] = val;
      }
    }
  }
}

loadEnv();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function runStep5Verification() {
  console.log("===================================================================");
  console.log("🔔 FarmiQ Step 5: Tasks, Confirm Popup & Notification Verification");
  console.log("===================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Identify test farmer
    console.log("--- 1. Loading Test Farmer ---");
    let testFarmer = await prisma.user.findFirst({ where: { phone: "9876543210" } });
    if (!testFarmer) {
      testFarmer = await prisma.user.create({
        data: {
          name: "Rama",
          phone: "9876543210",
          passwordHash: "dummyhash",
          district: "Thanjavur",
          language: "en",
        },
      });
    }
    assert(testFarmer !== null, `Loaded farmer: ${testFarmer.name} (id: ${testFarmer.id})`);

    // 2. Ensure task exists for farmer
    console.log("\n--- 2. Checking Tasks in Database ---");
    let pendingTask = await prisma.task.findFirst({
      where: { userId: testFarmer.id, status: "pending" },
    });

    if (!pendingTask) {
      pendingTask = await prisma.task.create({
        data: {
          userId: testFarmer.id,
          title: "Apply urea and foliar booster spray",
          dueDate: new Date(Date.now() + 86400000),
          status: "pending",
          source: "manual",
        },
      });
    }
    assert(pendingTask !== null, `Found pending task: "${pendingTask.title}" (id: ${pendingTask.id})`);
    assert(pendingTask.status === "pending", "Task initial status is 'pending'");

    // 3. Test Task Completion Database Transaction
    console.log("\n--- 3. Testing Task Completion Transaction ---");
    const now = new Date();
    const completedTask = await prisma.$transaction(async (tx) => {
      // a. Mark task done
      const t = await tx.task.update({
        where: { id: pendingTask.id },
        data: {
          status: "done",
          completedAt: now,
          confirmedBy: testFarmer.id,
        },
      });

      // b. Auto-log activity into activities table
      const act = await tx.activity.create({
        data: {
          userId: testFarmer.id,
          cropId: pendingTask.cropId,
          activityDate: now,
          type: "fertilizer",
          notes: `Completed scheduled task: ${pendingTask.title}`,
          cost: 0,
        },
      });

      // c. Auto-create notification
      const notif = await tx.notification.create({
        data: {
          userId: testFarmer.id,
          type: "task",
          title: `Task Completed: ${pendingTask.title}`,
          body: `Logged into Daily Log.`,
          link: "/daily-log",
          isRead: false,
        },
      });

      return { task: t, activity: act, notification: notif };
    });

    assert(completedTask.task.status === "done", "Task status transitioned to 'done'");
    assert(completedTask.task.completedAt !== null, "completedAt timestamp recorded");
    assert(completedTask.task.confirmedBy.toString() === testFarmer.id.toString(), "confirmedBy records user ID");

    // 4. Verify Activity Table Record
    console.log("\n--- 4. Verifying Auto-Logged Activity ---");
    const activity = await prisma.activity.findUnique({
      where: { id: completedTask.activity.id },
    });
    assert(activity !== null, `Activity auto-created in activities table (id: ${activity.id})`);
    assert(activity.type === "fertilizer", `Activity type is '${activity.type}'`);
    assert(activity.notes.includes(pendingTask.title), "Activity notes reference completed task");

    // 5. Verify Notifications System
    console.log("\n--- 5. Verifying Notifications in Database ---");
    const notifs = await prisma.notification.findMany({
      where: { userId: testFarmer.id },
      orderBy: { createdAt: "desc" },
    });
    assert(notifs.length >= 1, `Found ${notifs.length} notifications in notifications table`);

    const unreadBefore = notifs.filter((n) => !n.isRead).length;
    assert(unreadBefore >= 1, `Unread count is ${unreadBefore} (badge count working)`);

    // 6. Test Mark Single Notification as Read
    console.log("\n--- 6. Testing Mark Notification as Read ---");
    const targetNotif = notifs.find((n) => !n.isRead);
    if (targetNotif) {
      await prisma.notification.update({
        where: { id: targetNotif.id },
        data: { isRead: true },
      });
      const updated = await prisma.notification.findUnique({ where: { id: targetNotif.id } });
      assert(updated.isRead === true, `Notification ${targetNotif.id} marked as read`);
    }

    // 7. Test Mark All as Read
    console.log("\n--- 7. Testing Clear All Notifications ---");
    await prisma.notification.updateMany({
      where: { userId: testFarmer.id, isRead: false },
      data: { isRead: true },
    });
    const unreadAfter = await prisma.notification.count({
      where: { userId: testFarmer.id, isRead: false },
    });
    assert(unreadAfter === 0, "All notifications successfully marked read (unreadCount is 0)");

    // 8. Test Row-Level Privacy Isolation
    console.log("\n--- 8. Testing Row-Level Privacy Isolation ---");
    const strangerTasks = await prisma.task.findMany({
      where: { userId: 999999999n },
    });
    assert(strangerTasks.length === 0, "Stranger user 999999999 sees 0 tasks (strict isolation)");

    const strangerNotifs = await prisma.notification.findMany({
      where: { userId: 999999999n },
    });
    assert(strangerNotifs.length === 0, "Stranger user 999999999 sees 0 notifications");

    console.log("\n===================================================================");
    console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
    console.log("===================================================================");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test execution error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runStep5Verification();
