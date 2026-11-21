import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(
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

    // Verify crop exists and check ownership if logged in
    const crop = await db.crop.findUnique({
      where: { id: cropId },
      include: { plot: { include: { farm: true } } },
    });

    if (!crop) {
      return NextResponse.json({ error: "Crop not found" }, { status: 404 });
    }

    if (user && crop.plot.farm.userId.toString() !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await req.json();
    const { checkedOn, growthStage, health, notes, photoUrl } = body;

    const validHealths = ["good", "average", "poor"] as const;
    const sanitizedHealth = validHealths.includes(health) ? health : "good";

    const checkin = await db.cropCheckin.create({
      data: {
        cropId,
        checkedOn: checkedOn ? new Date(checkedOn) : new Date(),
        growthStage: growthStage ? String(growthStage).slice(0, 50) : null,
        health: sanitizedHealth,
        notes: notes ? String(notes).slice(0, 2000) : null,
        photoUrl: photoUrl ? String(photoUrl).slice(0, 500) : null,
      },
    });

    return NextResponse.json({
      success: true,
      checkin: {
        id: checkin.id.toString(),
        cropId: checkin.cropId.toString(),
        checkedOn: checkin.checkedOn.toISOString().split("T")[0],
        growthStage: checkin.growthStage,
        health: checkin.health,
        notes: checkin.notes,
        photoUrl: checkin.photoUrl,
        createdAt: checkin.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("POST /api/crops/[id]/checkin error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
