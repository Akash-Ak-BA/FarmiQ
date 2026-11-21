import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureDefaultFarmAndCrops, serializeCrop } from "@/lib/crop-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate user or fallback to primary farmer
    let user = await getCurrentUser();
    let userId: bigint;

    if (user) {
      userId = BigInt(user.id);
    } else {
      const firstUser = await db.user.findFirst();
      if (!firstUser) {
        return NextResponse.json({ crops: [] });
      }
      userId = firstUser.id;
    }

    // 2. Ensure default farm, plots, and starter crops are seeded in MySQL
    await ensureDefaultFarmAndCrops(userId);

    // 3. Query all crops strictly scoped to this user
    const crops = await db.crop.findMany({
      where: {
        plot: {
          farm: {
            userId,
          },
        },
      },
      include: {
        plot: {
          include: {
            farm: true,
          },
        },
        cropMaster: true,
        cropCheckins: {
          orderBy: { checkedOn: "desc" },
        },
        tasks: {
          orderBy: { dueDate: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const serialized = crops.map(serializeCrop);
    return NextResponse.json({ crops: serialized });
  } catch (error: any) {
    console.error("GET /api/crops error:", error);
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
    const { cropName, variety, fieldSize, plotName, sowingDate } = body;

    if (!cropName || !sowingDate) {
      return NextResponse.json(
        { error: "Crop name and sowing date are required." },
        { status: 400 }
      );
    }

    // 1. Ensure user has a farm
    let farm = await db.farm.findFirst({ where: { userId } });
    if (!farm) {
      farm = await db.farm.create({
        data: {
          userId,
          name: "Main Farm",
          location: user?.district || "Thanjavur Delta",
          areaAcres: 5.0,
        },
      });
    }

    // 2. Find or create plot
    const targetPlotName = (plotName || "Plot A").trim();
    const areaAcres = parseFloat(fieldSize) || 1.0;

    let plot = await db.plot.findFirst({
      where: {
        farmId: farm.id,
        name: targetPlotName,
      },
    });

    if (!plot) {
      plot = await db.plot.create({
        data: {
          farmId: farm.id,
          name: targetPlotName,
          areaAcres,
          soilType: "Alluvial / Loam",
          irrigation: "Canal & Borewell",
        },
      });
    }

    // 3. Match crop master for duration and stage roadmap
    const allMasters = await db.cropMaster.findMany();
    const matchedMaster = allMasters.find(
      (m) => m.nameEn.toLowerCase() === cropName.toLowerCase()
    );

    const durationDays = matchedMaster ? matchedMaster.durationDays : 120;
    const stagesArray =
      matchedMaster && Array.isArray(matchedMaster.stages)
        ? (matchedMaster.stages as string[])
        : ["Sowing", "Germination", "Vegetative", "Flowering / Fruiting", "Harvest"];

    const sowingDateObj = new Date(sowingDate);
    const expectedHarvestDate = new Date(
      sowingDateObj.getTime() + durationDays * 24 * 60 * 60 * 1000
    );

    // 4. Create crop in MySQL
    const newCrop = await db.crop.create({
      data: {
        plotId: plot.id,
        cropMasterId: matchedMaster?.id || null,
        cropName,
        variety: variety ? variety.trim() : null,
        sowingDate: sowingDateObj,
        expectedHarvestDate,
        currentStage: `${stagesArray[0]} (Stage 1 of ${stagesArray.length})`,
        stageIndex: 1,
        stageTotal: stagesArray.length,
        status: "active",
      },
      include: {
        plot: {
          include: {
            farm: true,
          },
        },
        cropMaster: true,
        cropCheckins: true,
        tasks: true,
      },
    });

    // 5. Automatically schedule 5 lifecycle tasks for this new crop
    const oneDayMs = 24 * 60 * 60 * 1000;
    const t1Due = new Date(sowingDateObj.getTime() + Math.round(durationDays * 0.12) * oneDayMs);
    const t2Due = new Date(sowingDateObj.getTime() + Math.round(durationDays * 0.28) * oneDayMs);
    const t3Due = new Date(sowingDateObj.getTime() + Math.round(durationDays * 0.48) * oneDayMs);
    const t4Due = new Date(sowingDateObj.getTime() + Math.round(durationDays * 0.72) * oneDayMs);
    const t5Due = expectedHarvestDate;

    await db.task.createMany({
      data: [
        {
          userId,
          cropId: newCrop.id,
          title: `Initial weeding & moisture check for ${cropName}`,
          dueDate: t1Due,
          source: "template",
          status: "pending",
        },
        {
          userId,
          cropId: newCrop.id,
          title: `First fertilizer & nutrient booster application`,
          dueDate: t2Due,
          source: "template",
          status: "pending",
        },
        {
          userId,
          cropId: newCrop.id,
          title: `Pest inspection & preventive organic spray`,
          dueDate: t3Due,
          source: "template",
          status: "pending",
        },
        {
          userId,
          cropId: newCrop.id,
          title: `Pre-harvest field conditioning & drainage`,
          dueDate: t4Due,
          source: "template",
          status: "pending",
        },
        {
          userId,
          cropId: newCrop.id,
          title: `Harvest & produce grading for ${cropName}`,
          dueDate: t5Due,
          source: "template",
          status: "pending",
        },
      ],
    });

    // Re-fetch with newly created tasks
    const fullCrop = await db.crop.findUnique({
      where: { id: newCrop.id },
      include: {
        plot: { include: { farm: true } },
        cropMaster: true,
        cropCheckins: true,
        tasks: { orderBy: { dueDate: "asc" } },
      },
    });

    return NextResponse.json({
      success: true,
      crop: fullCrop ? serializeCrop(fullCrop) : serializeCrop(newCrop),
    });
  } catch (error: any) {
    console.error("POST /api/crops error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
