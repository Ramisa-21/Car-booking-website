import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(request, { params }) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");
    } catch (err) {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      );
    }

    // ✅ FIX: Await params in Next.js 15
    const { id } = await params;
    const bookingId = parseInt(id);

    // Fetch booking with driver info
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        driver: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }

    // Verify user owns this booking
    if (booking.userId !== decoded.id) {
      return NextResponse.json(
        { message: "Unauthorized to view this booking" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        pickupLocation: booking.pickupLocation,
        dropoffLocation: booking.dropoffLocation,
        price: booking.price,
        status: booking.status,
        createdAt: booking.createdAt,
        driver: booking.driver
          ? {
              id: booking.driver.id,
              vehicleModel: booking.driver.vehicleModel,
              vehiclePlate: booking.driver.vehiclePlate,
              user: {
                name: booking.driver.user.name,
                phone: booking.driver.user.phone,
              },
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Booking status error:", error);
    return NextResponse.json(
      { message: "Failed to fetch booking status", error: error.message },
      { status: 500 }
    );
  }
}
