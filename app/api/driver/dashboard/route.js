import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

// Haversine formula to calculate distance
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

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

        // 2. Get driver's current location
        const driverLocation = await prisma.driverLocation.findUnique({
            where: { driverId: driver.id },
        });

        // 3. Fetch bookings assigned to this driver (ACCEPTED, ONGOING, COMPLETED)
        const assignedBookings = await prisma.booking.findMany({
            where: { driverId: driver.id },
            orderBy: { createdAt: "desc" },
        });

        // 4. Fetch ALL PENDING bookings (not assigned to anyone yet)
        const allPendingBookings = await prisma.booking.findMany({
            where: { 
                status: "PENDING",
                driverId: null, // Not assigned to any driver yet
            },
            orderBy: { createdAt: "desc" },
        });

        // 5. Filter PENDING bookings based on driver's location (within 5km radius)
        let nearbyPendingBookings = [];
        
        if (driverLocation && driverLocation.isOnline) {
            nearbyPendingBookings = allPendingBookings.filter(booking => {
                // Skip bookings without coordinates
                if (!booking.pickupLat || !booking.pickupLng) {
                    return false;
                }

                const distance = calculateDistance(
                    driverLocation.lat,
                    driverLocation.lng,
                    parseFloat(booking.pickupLat),
                    parseFloat(booking.pickupLng)
                );

                // Show bookings within 5km radius
                return distance <= 5;
            });
        }

        // 6. Get ACCEPTED + ONGOING rides for this driver
        const acceptedRidesData = assignedBookings.filter((b) =>
            ["ACCEPTED", "ONGOING"].includes(b.status)
        );

        // 7. Get COMPLETED rides for this driver
        const completedRides = assignedBookings.filter(
            (b) => b.status === "COMPLETED"
        );

        // 8. Calculate total earnings from completed rides
        const totalEarnings = completedRides.reduce((sum, booking) => {
            return sum + (booking.price || 0);
        }, 0);

        // 9. Build final response
        return NextResponse.json({
            driverName: driver.user.name,
            totalEarnings: totalEarnings,
            completedRidesCount: completedRides.length,
            rideRequestsCount: nearbyPendingBookings.length,

            // Show nearby PENDING bookings (not assigned to any driver yet)
            rideRequests: nearbyPendingBookings.map(mapBookingToRideRequest),
            
            // Show this driver's ACCEPTED/ONGOING rides
            acceptedRides: acceptedRidesData.map(mapBookingToRideRequest),
            
            // Show this driver's COMPLETED rides
            rideHistory: completedRides.map(mapBookingToRideRequest),
            
            // Debug info
            driverLocation: driverLocation ? {
                lat: driverLocation.lat,
                lng: driverLocation.lng,
                isOnline: driverLocation.isOnline
            } : null,
            totalPendingInSystem: allPendingBookings.length,
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
                error: err.message,
            },
            { status: 500 }
        );
    }
}
