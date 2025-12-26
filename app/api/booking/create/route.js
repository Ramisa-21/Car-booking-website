import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import jwt from "jsonwebtoken";

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

export async function POST(request) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    
    console.log("POST /api/booking/create - Token present:", !!token);

    if (!token) {
      return NextResponse.json({ 
        message: "Unauthorized - Please login again" 
      }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");
      console.log("Token decoded - User ID:", decoded.id);
    } catch (err) {
      console.error("JWT verification failed:", err.message);
      return NextResponse.json({ 
        message: "Session expired. Please login again." 
      }, { status: 401 });
    }
    
    const body = await request.json();
    console.log("Request body:", body);

    const { 
      pickupLocation, 
      dropoffLocation, 
      pickupLat,
      pickupLng,
      dropoffLat,
      dropoffLng,
      distanceKm, 
      durationMin, 
      price,
      vehicleType 
    } = body;

    // Validate required fields
    if (!pickupLocation || !dropoffLocation) {
      return NextResponse.json(
        { message: "Pickup and dropoff locations are required" },
        { status: 400 }
      );
    }

    if (!pickupLat || !pickupLng) {
      return NextResponse.json(
        { message: "Pickup coordinates missing. Please search again from dashboard." },
        { status: 400 }
      );
    }

    console.log("Finding nearby drivers for coordinates:", { pickupLat, pickupLng });

    // Step 1: Find nearby online drivers (within 5km radius)
    const onlineDrivers = await prisma.driverLocation.findMany({
      where: { isOnline: true },
      include: {
        driver: {
          include: {
            user: true
          }
        }
      }
    });

    console.log(`Found ${onlineDrivers.length} online drivers`);

    // Filter drivers within radius
    const nearbyDrivers = onlineDrivers.filter(location => {
      const distance = calculateDistance(
        parseFloat(pickupLat),
        parseFloat(pickupLng),
        location.lat,
        location.lng
      );
      console.log(`Driver ${location.driver.user.name}: ${distance.toFixed(2)} km away`);
      return distance <= 5; // 5km radius
    });

    console.log(`${nearbyDrivers.length} drivers within 5km radius`);

    if (nearbyDrivers.length === 0) {
      return NextResponse.json(
        { 
          message: "No drivers available in your area right now. Please try again in a few minutes.",
          availableDrivers: 0,
          totalOnlineDrivers: onlineDrivers.length
        },
        { status: 404 }
      );
    }

    // Step 2: Create the booking with PENDING status and coordinates
    console.log("Creating booking...");
    
    const booking = await prisma.booking.create({
      data: {
        userId: decoded.id,
        pickupLocation,
        dropoffLocation,
        pickupLat: pickupLat ? parseFloat(pickupLat) : null,
        pickupLng: pickupLng ? parseFloat(pickupLng) : null,
        dropoffLat: dropoffLat ? parseFloat(dropoffLat) : null,
        dropoffLng: dropoffLng ? parseFloat(dropoffLng) : null,
        distanceKm: distanceKm ? parseFloat(distanceKm) : null,
        durationMin: durationMin ? parseFloat(durationMin) : null,
        price: price ? parseFloat(price) : null,
        status: "PENDING",
        driverId: null, // Not assigned yet - will be assigned when driver accepts
      },
    });

    console.log("Booking created successfully:", booking);

    // Step 3: Return success with number of drivers notified
    return NextResponse.json({
      success: true,
      message: `Ride request sent to ${nearbyDrivers.length} nearby driver${nearbyDrivers.length > 1 ? 's' : ''}!`,
      booking: {
        id: booking.id,
        pickupLocation: booking.pickupLocation,
        dropoffLocation: booking.dropoffLocation,
        price: booking.price,
        status: booking.status,
      },
      driversNotified: nearbyDrivers.length,
      nearbyDrivers: nearbyDrivers.map(loc => ({
        driverName: loc.driver.user.name,
        distance: calculateDistance(
          parseFloat(pickupLat), 
          parseFloat(pickupLng), 
          loc.lat, 
          loc.lng
        ).toFixed(2) + " km"
      }))
    });

  } catch (error) {
    console.error("Booking creation error:", error);
    return NextResponse.json(
      { 
        message: "Failed to create booking. Please try again.", 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
