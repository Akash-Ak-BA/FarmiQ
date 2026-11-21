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
    const cropId = BigInt(params.id);

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
    const cropId = BigInt(params.id);
    const body = await req.json();
    const { stageIndex, currentStage, status } = body;

    const updated = await db.crop.update({
      where: { id: cropId },
      data: {
        ...(stageIndex !== undefined ? { stageIndex: Number(stageIndex) } : {}),
        ...(currentStage ? { currentStage } : {}),
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
