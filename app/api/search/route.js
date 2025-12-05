import { NextResponse } from "next/server";
import prisma from "../../lib/prisma";



// POST /api/search
export async function POST(req) {
  try {
    const { pickup, dropoff } = await req.json();

    // Validation
    if (!pickup || !dropoff) {
      return NextResponse.json(
        { error: "Both pickup and dropoff are required" },
        { status: 400 }
      );
    }

    // Create a new RideSearch entry
    const savedSearch = await prisma.rideSearch.create({
      data: { pickup, dropoff },
    });

    return NextResponse.json({ success: true, data: savedSearch }, { status: 201 });
  } catch (err) {
    console.error("ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Optional GET endpoint to list all searches
export async function GET() {
  try {
    const searches = await prisma.rideSearch.findMany();
    return NextResponse.json({ success: true, data: searches }, { status: 200 });
  } catch (err) {
    console.error("ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
