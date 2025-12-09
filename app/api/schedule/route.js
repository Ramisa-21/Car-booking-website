import { NextResponse } from "next/server";
import prisma from "../../lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const authHeader = req.headers.get("authorization"); // read token
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1]; // Bearer <token>
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify token
    let userId;
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || "secret123");
      userId = payload.id;
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { pickupTime, customTime, pickupLocation, dropoffLocation } = await req.json();

    if (!pickupLocation || !dropoffLocation) {
      return NextResponse.json({ error: "Pickup and dropoff are required" }, { status: 400 });
    }

    // Save ride with userId
    const savedSchedule = await prisma.scheduledRides.create({
      data: {
        pickupTime,
        customTime: customTime || null,
        pickupLocation,
        dropoffLocation,
        userId,  // <--- link ride to logged-in user
      },
    });

    return NextResponse.json({ success: true, data: savedSchedule }, { status: 201 });
  } catch (err) {
    console.error("ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    let userId;
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || "secret123");
      userId = payload.id;
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const rides = await prisma.scheduledRides.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json( {trips: rides});
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
