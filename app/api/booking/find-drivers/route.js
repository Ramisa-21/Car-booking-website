import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance; // in kilometers
}

export async function POST(request) {
  try {
    const { pickupLat, pickupLng, radiusKm = 5 } = await request.json();

    if (!pickupLat || !pickupLng) {
      return NextResponse.json(
        { error: "Pickup coordinates required" },
        { status: 400 }
      );
    }

    // Get all online drivers with their locations
    const driversWithLocations = await prisma.driverLocation.findMany({
      where: {
        isOnline: true, // Only online drivers
      },
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

    // Filter drivers within radius
    const nearbyDrivers = driversWithLocations
      .map((location) => {
        const distance = calculateDistance(
          pickupLat,
          pickupLng,
          location.lat,
          location.lng
        );

        return {
          driverId: location.driver.id,
          driverUserId: location.driver.userId,
          driverName: location.driver.user.name,
          driverPhone: location.driver.user.phone,
          vehicleModel: location.driver.vehicleModel,
          vehiclePlate: location.driver.vehiclePlate,
          location: {
            lat: location.lat,
            lng: location.lng,
            address: location.address,
          },
          distance: parseFloat(distance.toFixed(2)),
        };
      })
      .filter((driver) => driver.distance <= radiusKm) // Within radius
      .sort((a, b) => a.distance - b.distance); // Sort by nearest first

    return NextResponse.json({
      success: true,
      count: nearbyDrivers.length,
      drivers: nearbyDrivers,
      searchRadius: radiusKm,
      pickupCoords: { lat: pickupLat, lng: pickupLng },
    });
  } catch (error) {
    console.error("Matchmaking error:", error);
    return NextResponse.json(
      { error: "Failed to find drivers" },
      { status: 500 }
    );
  }
}
