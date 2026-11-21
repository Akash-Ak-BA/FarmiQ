import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { serializeCrop } from "@/lib/crop-service";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let cropId: bigint;
    try {
      cropId = BigInt(params.id);
    } catch {
      return NextResponse.json({ error: "Invalid crop ID" }, { status: 400 });
    }

    const user = await getCurrentUser();

    const crop = await db.crop.findUnique({
      where: { id: cropId },
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
    });

    if (!crop) {
      return NextResponse.json({ error: "Crop not found" }, { status: 404 });
    }

    // Row-level privacy enforcement: if user is logged in, verify ownership
    if (user && crop.plot.farm.userId.toString() !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ crop: serializeCrop(crop) });
  } catch (error: any) {
    console.error("GET /api/crops/[id] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let cropId: bigint;
    try {
      cropId = BigInt(params.id);
    } catch {
      return NextResponse.json({ error: "Invalid crop ID" }, { status: 400 });
    }

    const user = await getCurrentUser();

    // Verify existing crop and ownership
    const existing = await db.crop.findUnique({
      where: { id: cropId },
      include: { plot: { include: { farm: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Crop not found" }, { status: 404 });
    }

    if (user && existing.plot.farm.userId.toString() !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await req.json();
    const { stageIndex, currentStage, status } = body;

    const updated = await db.crop.update({
      where: { id: cropId },
      data: {
        ...(stageIndex !== undefined ? { stageIndex: Number(stageIndex) } : {}),
        ...(currentStage ? { currentStage: String(currentStage) } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        plot: { include: { farm: true } },
        cropMaster: true,
        cropCheckins: { orderBy: { checkedOn: "desc" } },
        tasks: { orderBy: { dueDate: "asc" } },
      },
    });

    return NextResponse.json({ success: true, crop: serializeCrop(updated) });
  } catch (error: any) {
    console.error("PATCH /api/crops/[id] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
