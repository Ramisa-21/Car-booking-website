import { NextResponse } from "next/server";
import prisma from "../../lib/prisma";


// POST /api/schedule
export async function POST(req) {
  try {
    const { pickupTime, customTime, pickupLocation, dropoffLocation } = await req.json();

    // Basic validation
    if (!pickupLocation || !dropoffLocation) {
      return NextResponse.json(
        { error: "Pickup and dropoff are required" },
        { status: 400 }
      );
    }

    // Create a new scheduled ride
    const savedSchedule = await prisma.scheduledRides.create({
      data: { 
        pickupTime, 
        customTime: customTime || null,
        pickupLocation, 
        dropoffLocation 
      },
    });

    console.log("SAVED:", savedSchedule);

    return NextResponse.json({ success: true, data: savedSchedule }, { status: 201 });
  } catch (err) {
    console.error("ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Optional GET /api/schedule to list all rides
export async function GET() {
  try {
    const rides = await prisma.scheduledRides.findMany();
    return NextResponse.json( rides );
  } catch (err) {
    console.error("ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
