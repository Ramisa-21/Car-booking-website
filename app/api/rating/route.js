import { NextResponse } from "next/server";
import prisma from "../../lib/prisma";

// POST: Create rating
export async function POST(req) {
  try {
    const body = await req.json();
    const { bookingId, stars, review } = body;

    if (!bookingId || !stars) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find the booking first
    const booking = await prisma.booking.findUnique({
      where: { id: Number(bookingId) },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Check if this booking already has a rating
    const existingRating = await prisma.rating.findUnique({
      where: { bookingId: Number(bookingId) },
    });

    if (existingRating) {
      return NextResponse.json(
        { error: "Rating already exists for this booking" },
        { status: 400 }
      );
    }

    // Create rating using booking info
    const rating = await prisma.rating.create({
      data: {
        bookingId: booking.id,
        userId: booking.userId,       // ✅ automatically from booking
        driverId: booking.driverId ?? null, // optional
        stars,
        review: review ?? "",
      },
    });

    return NextResponse.json(rating, { status: 201 });
  } catch (error) {
    console.error("Rating error:", error);

    return NextResponse.json(
      { error: "Failed to create rating" },
      { status: 500 }
    );
  }
}

// GET: Get ratings by driverId
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const driverId = searchParams.get("driverId");

    if (!driverId) {
      return NextResponse.json(
        { error: "driverId is required" },
        { status: 400 }
      );
    }

    const ratings = await prisma.rating.findMany({
      where: {
        driverId: parseInt(driverId),
      },
      include: {
        user: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    return NextResponse.json(ratings);
  } catch (error) {
    console.error("Fetch ratings error:", error);

    return NextResponse.json(
      { error: "Failed to fetch ratings" },
      { status: 500 }
    );
  }
}

