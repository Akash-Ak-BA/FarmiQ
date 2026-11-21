import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const masters = await db.cropMaster.findMany({
      orderBy: { id: "asc" },
    });

    const formatted = masters.map((m) => ({
      id: m.id,
      nameEn: m.nameEn,
      nameTa: m.nameTa,
      nameTe: m.nameTe,
      durationDays: m.durationDays,
      stages: Array.isArray(m.stages) ? m.stages : [],
    }));

    return NextResponse.json({ cropMasters: formatted });
  } catch (error: any) {
    console.error("GET /api/crop-master error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
