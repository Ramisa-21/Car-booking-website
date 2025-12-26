import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(request) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");
    } catch (err) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    // Fetch user's bookings with driver info
    const bookings = await prisma.booking.findMany({
      where: { userId: decoded.id },
      include: {
        driver: {
          include: {
            user: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      bookings: bookings.map((booking) => ({
        id: booking.id,
        pickupLocation: booking.pickupLocation,
        dropoffLocation: booking.dropoffLocation,
        price: booking.price,
        status: booking.status,
        createdAt: booking.createdAt,
        driver: booking.driver
          ? {
              name: booking.driver.user.name,
              vehicleModel: booking.driver.vehicleModel,
              vehiclePlate: booking.driver.vehiclePlate,
            }
          : null,
      })),
    });
  } catch (error) {
    console.error("Fetch bookings error:", error);
    return NextResponse.json(
      { message: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
