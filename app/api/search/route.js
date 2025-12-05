import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { pickup, dropoff } = await req.json();

    if (!pickup || !dropoff) {
      return NextResponse.json(
        { error: "Both pickup and dropoff are required" },
        { status: 400 }
      );
    }

    const savedSearch = await prisma.rideSearch.create({
      data: { pickup, dropoff },
    });

    return NextResponse.json({ success: true, data: savedSearch });
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}