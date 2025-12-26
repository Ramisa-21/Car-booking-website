import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(request, { params }) {
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

    // ✅ FIX: Await params in Next.js 15
    const { id } = await params;
    const bookingId = parseInt(id);

    // Fetch booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (booking.userId !== decoded.id) {
      return NextResponse.json(
        { message: "Unauthorized to cancel this booking" },
        { status: 403 }
      );
    }

    // Only allow cancellation if PENDING or ACCEPTED
    if (!["PENDING", "ACCEPTED"].includes(booking.status)) {
      return NextResponse.json(
        { message: "Cannot cancel ride in progress or completed" },
        { status: 400 }
      );
    }

    // Update status to CANCELLED
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    return NextResponse.json(
      { message: "Failed to cancel booking", error: error.message },
      { status: 500 }
    );
  }
}
