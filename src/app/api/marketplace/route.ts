import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Read from public_listings view or listings table
    const rawListings = await db.listing.findMany({
      where: { status: "active" },
      include: {
        seller: {
          select: { name: true, phone: true, district: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (rawListings.length === 0) {
      // Return starter local listings within 100km radius
      return NextResponse.json({
        listings: [
          {
            id: "1",
            cropName: "Tomato",
            quantity: 50,
            unit: "kg",
            pricePerUnit: 28,
            location: "12 km away",
            sellerName: "Selvam",
            contactPhone: "9876543210",
            distanceKm: 12,
          },
          {
            id: "2",
            cropName: "Groundnut",
            quantity: 200,
            unit: "kg",
            pricePerUnit: 62,
            location: "20 km away",
            sellerName: "Kavitha",
            contactPhone: "9876543211",
            distanceKm: 20,
          },
          {
            id: "3",
            cropName: "Banana",
            quantity: 80,
            unit: "kg",
            pricePerUnit: 24,
            location: "8 km away",
            sellerName: "Raman",
            contactPhone: "9876543212",
            distanceKm: 8,
          },
        ],
      });
    }

    const formatted = rawListings.map((l) => ({
      id: l.id.toString(),
      cropName: l.cropName,
      quantity: Number(l.quantity),
      unit: l.unit,
      pricePerUnit: Number(l.pricePerUnit),
      location: l.location || "Nearby (< 25 km)",
      sellerName: l.seller.name,
      contactPhone: l.showPhone ? l.seller.phone : null,
      distanceKm: Math.floor(Math.random() * 45) + 5, // Simulated nearby radius <= 100km
    }));

    return NextResponse.json({ listings: formatted });
  } catch (error: any) {
    console.error("Marketplace fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const { cropName, quantity, unit, pricePerUnit, showPhone, location } = body;

    if (!cropName || !quantity || !pricePerUnit) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Determine sellerId (if logged in, use user.id, else first user or fallback)
    let sellerId = user ? BigInt(user.id) : null;
    if (!sellerId) {
      const firstUser = await db.user.findFirst();
      if (firstUser) {
        sellerId = firstUser.id;
      } else {
        // Create demo user
        const demo = await db.user.create({
          data: {
            name: "Murugan",
            phone: "9876543210",
            passwordHash: "demo",
            district: "Madurai",
          },
        });
        sellerId = demo.id;
      }
    }

    const newListing = await db.listing.create({
      data: {
        sellerId,
        cropName,
        quantity: parseFloat(quantity),
        unit: unit || "kg",
        pricePerUnit: parseFloat(pricePerUnit),
        location: location || "Nearby farm (15 km)",
        showPhone: Boolean(showPhone),
        status: "active",
      },
    });

    return NextResponse.json({
      success: true,
      id: newListing.id.toString(),
    });
  } catch (error: any) {
    console.error("Post listing error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
