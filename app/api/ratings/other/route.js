import prisma from "../../../lib/prisma";

export async function POST(req) {
  try {
    const { bookingId, stars, review } = await req.json();

    // Validate required fields
    if (!bookingId || !stars) {
      return new Response(
        JSON.stringify({ error: "bookingId and stars are required" }),
        { status: 400 }
      );
    }

    // Find the booking to get userId and driverId
    const booking = await prisma.booking.findUnique({
      where: { id: Number(bookingId) },
    });

    if (!booking) {
      return new Response(
        JSON.stringify({ error: `Booking with id ${bookingId} does not exist` }),
        { status: 404 }
      );
    }

    // Prevent duplicate rating (bookingId is unique in Rating)
    const existingRating = await prisma.rating.findUnique({
      where: { bookingId: Number(bookingId) },
    });

    if (existingRating) {
      return new Response(
        JSON.stringify({ error: "Rating already exists for this booking" }),
        { status: 400 }
      );
    }

    // Create rating
    const rating = await prisma.rating.create({
      data: {
        stars,
        review: review || "",
        bookingId: booking.id,
        userId: booking.userId,               // ✅ get userId from booking
        driverId: booking.driverId || null,   // optional
      },
    });

    return new Response(JSON.stringify(rating), { status: 201 });
  } catch (err) {
    console.error("Prisma error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to save rating", details: err.message }),
      { status: 500 }
    );
  }
}
