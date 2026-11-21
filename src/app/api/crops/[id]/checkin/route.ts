import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cropId = BigInt(params.id);
    const body = await req.json();
    const { checkedOn, growthStage, health, notes, photoUrl } = body;

    const checkin = await db.cropCheckin.create({
      data: {
        cropId,
        checkedOn: checkedOn ? new Date(checkedOn) : new Date(),
        growthStage: growthStage || null,
        health: (health as "good" | "average" | "poor") || "good",
        notes: notes || null,
        photoUrl: photoUrl || null,
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
