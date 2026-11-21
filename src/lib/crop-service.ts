import { db } from "./db";

export interface SerializedCrop {
  id: string;
  cropName: string;
  variety: string | null;
  plotId: string;
  plotName: string;
  farmId: string;
  farmName: string;
  areaAcres: number | null;
  sowingDate: string;
  expectedHarvestDate: string | null;
  actualHarvestDate: string | null;
  currentStage: string | null;
  stageIndex: number;
  stageTotal: number;
  status: "active" | "harvested" | "failed";
  daysRemaining: number;
  harvestDateFormatted: string;
  progressPercent: number;
  nextTask: string;
  tasks: Array<{
    id: string;
    cropId: string | null;
    cropName: string;
    plotName: string;
    title: string;
    dueDate: string;
    status: "pending" | "done";
    dueFormatted: string;
  }>;
  checkins: Array<{
    id: string;
    checkedOn: string;
    growthStage: string | null;
    health: "good" | "average" | "poor";
    notes: string | null;
    photoUrl: string | null;
    createdAt: string;
  }>;
}

export function formatDueDate(date: Date): string {
  const now = new Date();
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays > 1 && diffDays <= 7) {
    return date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  }
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function formatHarvestDate(date: Date | null): string {
  if (!date) return "TBD";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * Ensures the user has a default farm, 3 starter plots, and 3 active crops
 * with realistic schedules in MySQL if no crops exist yet.
 */
export async function ensureDefaultFarmAndCrops(userId: bigint): Promise<void> {
  // Check if user has any farm
  let farm = await db.farm.findFirst({
    where: { userId },
  });

  if (!farm) {
    const user = await db.user.findUnique({ where: { id: userId } });
    farm = await db.farm.create({
      data: {
        userId,
        name: "Main Farm",
        location: user?.district || "Thanjavur Delta",
        areaAcres: 5.0,
      },
    });
  }

  // Check if user has plots
  const existingPlots = await db.plot.findMany({
    where: { farmId: farm.id },
  });

  let plotA = existingPlots.find((p) => p.name === "Plot A");
  let plotB = existingPlots.find((p) => p.name === "Plot B");
  let plotC = existingPlots.find((p) => p.name === "Plot C");

  if (!plotA) {
    plotA = await db.plot.create({
      data: {
        farmId: farm.id,
        name: "Plot A",
        areaAcres: 2.5,
        soilType: "Clay Loam",
        irrigation: "Canal",
      },
    });
  }

  if (!plotB) {
    plotB = await db.plot.create({
      data: {
        farmId: farm.id,
        name: "Plot B",
        areaAcres: 1.0,
        soilType: "Red Sandy Loam",
        irrigation: "Drip",
      },
    });
  }

  if (!plotC) {
    plotC = await db.plot.create({
      data: {
        farmId: farm.id,
        name: "Plot C",
        areaAcres: 1.5,
        soilType: "Alluvial",
        irrigation: "Borewell",
      },
    });
  }

  // Check if user has crops in these plots
  const plotIds = [plotA.id, plotB.id, plotC.id];
  const existingCropsCount = await db.crop.count({
    where: { plotId: { in: plotIds } },
  });

  if (existingCropsCount > 0) {
    return; // Already initialized!
  }

  // Fetch crop masters
  const cropMasters = await db.cropMaster.findMany();
  const paddyMaster = cropMasters.find((m) => m.nameEn.toLowerCase() === "paddy");
  const tomatoMaster = cropMasters.find((m) => m.nameEn.toLowerCase() === "tomato");
  const groundnutMaster = cropMasters.find((m) => m.nameEn.toLowerCase() === "groundnut");

  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;

  // 1. Paddy (Plot A): 120 days total, 64 days passed, 56 days remaining
  const paddySowing = new Date(now - 64 * oneDayMs);
  const paddyHarvest = new Date(paddySowing.getTime() + 120 * oneDayMs);
  const paddyCrop = await db.crop.create({
    data: {
      plotId: plotA.id,
      cropMasterId: paddyMaster?.id || null,
      cropName: "Paddy",
      variety: "BPT 5204",
      sowingDate: paddySowing,
      expectedHarvestDate: paddyHarvest,
      currentStage: "Flowering (Stage 3 of 5)",
      stageIndex: 3,
      stageTotal: 5,
      status: "active",
    },
  });

  // Paddy tasks
  await db.task.createMany({
    data: [
      {
        userId,
        cropId: paddyCrop.id,
        title: "Apply fertilizer (Urea & Potash)",
        dueDate: new Date(now + 1 * oneDayMs),
        source: "template",
        status: "pending",
      },
      {
        userId,
        cropId: paddyCrop.id,
        title: "Check for leaf blast and stem pests",
        dueDate: new Date(now + 3 * oneDayMs),
        source: "template",
        status: "pending",
      },
      {
        userId,
        cropId: paddyCrop.id,
        title: "Drain field water for tillering aerate",
        dueDate: new Date(now + 6 * oneDayMs),
        source: "template",
        status: "pending",
      },
      {
        userId,
        cropId: paddyCrop.id,
        title: "Panicle initiation foliar spray",
        dueDate: new Date(now + 24 * oneDayMs),
        source: "template",
        status: "pending",
      },
      {
        userId,
        cropId: paddyCrop.id,
        title: "Final grain harvest & threshing",
        dueDate: paddyHarvest,
        source: "template",
        status: "pending",
      },
    ],
  });

  // Paddy check-in
  await db.cropCheckin.create({
    data: {
      cropId: paddyCrop.id,
      checkedOn: new Date(),
      growthStage: "Flowering",
      health: "good",
      notes: "Uniform flowering observed across Plot A. Moisture level optimal.",
    },
  });

  // 2. Tomato (Plot B): 100 days total, 82 days passed, 18 days remaining
  const tomatoSowing = new Date(now - 82 * oneDayMs);
  const tomatoHarvest = new Date(tomatoSowing.getTime() + 100 * oneDayMs);
  const tomatoCrop = await db.crop.create({
    data: {
      plotId: plotB.id,
      cropMasterId: tomatoMaster?.id || null,
      cropName: "Tomato",
      variety: "PKM-1",
      sowingDate: tomatoSowing,
      expectedHarvestDate: tomatoHarvest,
      currentStage: "Fruiting (Stage 4 of 5)",
      stageIndex: 4,
      stageTotal: 5,
      status: "active",
    },
  });

  // Tomato tasks
  await db.task.createMany({
    data: [
      {
        userId,
        cropId: tomatoCrop.id,
        title: "Spray neem oil on leaves",
        dueDate: new Date(now + 2 * oneDayMs),
        source: "template",
        status: "pending",
      },
      {
        userId,
        cropId: tomatoCrop.id,
        title: "Tying and stake support check",
        dueDate: new Date(now + 4 * oneDayMs),
        source: "template",
        status: "pending",
      },
      {
        userId,
        cropId: tomatoCrop.id,
        title: "Potassium micronutrient booster",
        dueDate: new Date(now + 7 * oneDayMs),
        source: "template",
        status: "pending",
      },
      {
        userId,
        cropId: tomatoCrop.id,
        title: "First selective picking & grading",
        dueDate: new Date(now + 14 * oneDayMs),
        source: "template",
        status: "pending",
      },
      {
        userId,
        cropId: tomatoCrop.id,
        title: "Main harvest & crate packing",
        dueDate: tomatoHarvest,
        source: "template",
        status: "pending",
      },
    ],
  });

  // Tomato checkin
  await db.cropCheckin.create({
    data: {
      cropId: tomatoCrop.id,
      checkedOn: new Date(),
      growthStage: "Fruiting",
      health: "good",
      notes: "Heavy fruit set on trellis lines. No significant whitefly pressure.",
    },
  });

  // 3. Groundnut (Plot C): 110 days total, 12 days passed, 98 days remaining
  const groundnutSowing = new Date(now - 12 * oneDayMs);
  const groundnutHarvest = new Date(groundnutSowing.getTime() + 110 * oneDayMs);
  const groundnutCrop = await db.crop.create({
    data: {
      plotId: plotC.id,
      cropMasterId: groundnutMaster?.id || null,
      cropName: "Groundnut",
      variety: "TMV-7",
      sowingDate: groundnutSowing,
      expectedHarvestDate: groundnutHarvest,
      currentStage: "Germination (Stage 1 of 5)",
      stageIndex: 1,
      stageTotal: 5,
      status: "active",
    },
  });

  // Groundnut tasks
  await db.task.createMany({
    data: [
      {
        userId,
        cropId: groundnutCrop.id,
        title: "Field weeding & inter-row hoeing",
        dueDate: new Date(now + 4 * oneDayMs),
        source: "template",
        status: "pending",
      },
      {
        userId,
        cropId: groundnutCrop.id,
        title: "Gypsum application around root zone",
        dueDate: new Date(now + 20 * oneDayMs),
        source: "template",
        status: "pending",
      },
      {
        userId,
        cropId: groundnutCrop.id,
        title: "Pod pegging moisture check",
        dueDate: new Date(now + 35 * oneDayMs),
        source: "template",
        status: "pending",
      },
      {
        userId,
        cropId: groundnutCrop.id,
        title: "Foliar nutrient booster spray",
        dueDate: new Date(now + 55 * oneDayMs),
        source: "template",
        status: "pending",
      },
      {
        userId,
        cropId: groundnutCrop.id,
        title: "Harvest digging & pod sun-drying",
        dueDate: groundnutHarvest,
        source: "template",
        status: "pending",
      },
    ],
  });

  // Groundnut checkin
  await db.cropCheckin.create({
    data: {
      cropId: groundnutCrop.id,
      checkedOn: new Date(),
      growthStage: "Germination",
      health: "good",
      notes: "Emergence rate > 92%. Soil aerated after initial irrigation.",
    },
  });
}

/**
 * Serializes a raw Prisma crop record into a clean JSON-friendly object.
 */
export function serializeCrop(crop: any): SerializedCrop {
  const now = new Date();
  const harvestDate = crop.expectedHarvestDate ? new Date(crop.expectedHarvestDate) : null;
  const daysRemaining = harvestDate
    ? Math.max(0, Math.ceil((harvestDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const stageIndex = crop.stageIndex || 1;
  const stageTotal = crop.stageTotal || 5;
  const progressPercent = Math.min(100, Math.round((stageIndex / stageTotal) * 100));

  const tasksList = Array.isArray(crop.tasks) ? crop.tasks : [];
  const checkinsList = Array.isArray(crop.cropCheckins) ? crop.cropCheckins : [];

  const serializedTasks = tasksList.map((t: any) => ({
    id: t.id.toString(),
    cropId: t.cropId ? t.cropId.toString() : null,
    cropName: crop.cropName,
    plotName: crop.plot?.name || "Plot",
    title: t.title,
    dueDate: t.dueDate instanceof Date ? t.dueDate.toISOString().split("T")[0] : String(t.dueDate),
    status: t.status as "pending" | "done",
    dueFormatted: t.dueDate instanceof Date ? formatDueDate(t.dueDate) : String(t.dueDate),
  }));

  const pendingTasks = serializedTasks.filter((t: any) => t.status === "pending");
  const nextTaskTitle = pendingTasks.length > 0 ? pendingTasks[0].title : "Field inspection";

  const serializedCheckins = checkinsList.map((c: any) => ({
    id: c.id.toString(),
    checkedOn: c.checkedOn instanceof Date ? c.checkedOn.toISOString().split("T")[0] : String(c.checkedOn),
    growthStage: c.growthStage,
    health: c.health,
    notes: c.notes,
    photoUrl: c.photoUrl,
    createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : String(c.createdAt),
  }));

  return {
    id: crop.id.toString(),
    cropName: crop.cropName,
    variety: crop.variety,
    plotId: crop.plotId.toString(),
    plotName: crop.plot?.name || "Main Plot",
    farmId: crop.plot?.farm?.id ? crop.plot.farm.id.toString() : "",
    farmName: crop.plot?.farm?.name || "Main Farm",
    areaAcres: crop.plot?.areaAcres ? Number(crop.plot.areaAcres) : null,
    sowingDate: crop.sowingDate instanceof Date ? crop.sowingDate.toISOString().split("T")[0] : String(crop.sowingDate),
    expectedHarvestDate: harvestDate ? harvestDate.toISOString().split("T")[0] : null,
    actualHarvestDate: crop.actualHarvestDate
      ? crop.actualHarvestDate instanceof Date
        ? crop.actualHarvestDate.toISOString().split("T")[0]
        : String(crop.actualHarvestDate)
      : null,
    currentStage: crop.currentStage || "Growing",
    stageIndex,
    stageTotal,
    status: crop.status,
    daysRemaining,
    harvestDateFormatted: formatHarvestDate(harvestDate),
    progressPercent,
    nextTask: nextTaskTitle,
    tasks: serializedTasks,
    checkins: serializedCheckins,
  };
}
