import { NextResponse } from "next/server";
import prisma from "../../lib/prisma";
import jwt from "jsonwebtoken";
import { notifyUser } from "@/app/lib/notify";

// POST /api/search
export async function POST(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify JWT
    let userId;
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || "secret123");
      userId = payload.id;
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const {
      pickupTime,
      customTime,
      pickupLocation,
      dropoffLocation,
    } = await req.json();

    if (!pickupLocation || !dropoffLocation) {
      return NextResponse.json(
        { error: "Pickup and dropoff are required" },
        { status: 400 }
      );
    }

    // Save scheduled ride
    const savedSchedule = await prisma.scheduledRide.create({
      data: {
        pickupTime,
        customTime: customTime || null,
        pickupLocation,
        dropoffLocation,
        userId,
      },
    });

    // 🔔 NOTIFY NEARBY ONLINE DRIVERS

    // 1️⃣ Get online drivers with location
    const onlineDrivers = await prisma.driverLocation.findMany({
      where: { isOnline: true },
      include: { driver: true },
    });

    // 2️⃣ Distance helper
    function distanceKm(lat1, lng1, lat2, lng2) {
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLng = ((lng2 - lng1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLng / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    const MAX_DISTANCE_KM = 5;

    // 3️⃣ Notify nearby drivers (UNCHANGED LOOP STRUCTURE)
    for (const d of onlineDrivers) {
      if (!d.lat || !d.lng) continue;
      if (!pickupLocation.lat || !pickupLocation.lng) continue;

      const dist = distanceKm(
        pickupLocation.lat,
        pickupLocation.lng,
        d.lat,
        d.lng
      );

      if (dist <= MAX_DISTANCE_KM) {
        for (const d of onlineDrivers) {
          if (!d.lat || !d.lng) continue;
          if (!pickupLocation.lat || !pickupLocation.lng) continue;

          const dist = distanceKm(
            pickupLocation.lat,
            pickupLocation.lng,
            d.lat,
            d.lng
          );

          if (dist <= MAX_DISTANCE_KM) {
            // 🔔 Notify driver (DB + SSE)
            await notifyUser(
              d.driver.userId,
              "🚕 New ride request near you"
            );
          }
        }
      }
    }

    return NextResponse.json(
      { success: true, data: savedSchedule },
      { status: 201 }
    );
  } catch (err) {
    console.error("ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET /api/search
export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let userId;
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || "secret123");
      userId = payload.id;
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const rides = await prisma.scheduledRide.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(rides);
  } catch (err) {
    console.error("ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
