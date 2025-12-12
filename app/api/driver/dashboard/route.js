import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

// Map DB booking → UI format
const mapBookingToRideRequest = (booking) => ({
    rideId: booking.id,
    pickupLocation: booking.pickupLocation,
    dropoffLocation: booking.dropoffLocation,
    price: booking.price,
    time: booking.createdAt
        ? new Date(booking.createdAt).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
          })
        : "N/A",
    status: booking.status,
});

export async function GET(request) {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
        return NextResponse.json(
            { message: "Driver ID is required" },
            { status: 401 }
        );
    }

    try {
        // 1. Fetch the driver record
        const driver = await prisma.driver.findUnique({
            where: { userId: Number(userId) },
            include: { user: true },
        });

        if (!driver) {
            return NextResponse.json({
                driverName: null,
                totalEarnings: 0,
                completedRidesCount: 0,
                rideRequestsCount: 0,
                rideRequests: [],
                acceptedRides: [],
                rideHistory: [],
            });
        }

        // 2. Fetch all bookings for this driver
        const allBookings = await prisma.booking.findMany({
            where: { driverId: driver.id },
            orderBy: { createdAt: "desc" },
        });

        // 3. PENDING requests for this driver only
        const pendingRequests = allBookings.filter(b => b.status === "PENDING");

        // 4. Accepted + Ongoing rides
        const acceptedRidesData = allBookings.filter((b) =>
            ["ACCEPTED", "ONGOING"].includes(b.status)
        );

        // 5. Completed ride history
        const completedRides = allBookings.filter(
            (b) => b.status === "COMPLETED"
        );

        // 6. Calculate total earnings from completed rides
        const totalEarnings = completedRides.reduce((sum, booking) => {
            return sum + (booking.price || 0);
        }, 0);

        // 7. Build final response
        return NextResponse.json({
            driverName: driver.user.name,
            totalEarnings: totalEarnings,

            completedRidesCount: completedRides.length,
            rideRequestsCount: pendingRequests.length,

            // Correctly filtered sections:
            rideRequests: pendingRequests.map(mapBookingToRideRequest),
            acceptedRides: acceptedRidesData.map(mapBookingToRideRequest),
            rideHistory: completedRides.map(mapBookingToRideRequest),
        });
    } catch (err) {
        console.error("Dashboard Error:", err);
        return NextResponse.json(
            {
                driverName: "Error",
                totalEarnings: 0,
                completedRidesCount: 0,
                rideRequestsCount: 0,
                rideRequests: [],
                acceptedRides: [],
                rideHistory: [],
            },
            { status: 500 }
        );
    }
}
