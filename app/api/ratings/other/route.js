import prisma from "../../../lib/prisma"; 


export async function POST(req) {
  try {
    const { bookingId, userId, driverId, stars, review } = await req.json();

    // Validate required fields
    if (!bookingId || !userId || !stars) {
      return new Response(
        JSON.stringify({ error: "bookingId, userId, and stars are required" }),
        { status: 400 }
      );
    }

    // Optional: Check if booking exists
    const bookingExists = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!bookingExists) {
      return new Response(
        JSON.stringify({ error: `Booking with id ${bookingId} does not exist` }),
        { status: 404 }
      );
    }

    // Optional: Check if driver exists (if provided)
    if (driverId) {
      const driverExists = await prisma.driver.findUnique({
        where: { id: driverId },
      });

      if (!driverExists) {
        return new Response(
          JSON.stringify({ error: `Driver with id ${driverId} does not exist` }),
          { status: 404 }
        );
      }
    }

    // Create rating
    const rating = await prisma.rating.create({
      data: {
        stars,
        review: review || "",
        bookingId,
        userId,
        driverId: driverId || null,
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
