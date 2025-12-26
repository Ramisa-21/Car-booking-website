import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import jwt from "jsonwebtoken";

// GET - Fetch driver's current location
export async function GET(request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  console.log("GET /api/driver/location - userId:", userId);

  if (!userId) {
    return NextResponse.json({ message: "User ID required" }, { status: 400 });
  }

  try {
    const driver = await prisma.driver.findUnique({
      where: { userId: Number(userId) },
    });

    console.log("Driver found:", driver);

    if (!driver) {
      return NextResponse.json({ message: "Driver not found", location: null }, { status: 404 });
    }

    // Get latest location
    const location = await prisma.driverLocation.findUnique({
      where: { driverId: driver.id },
    });

    console.log("Location found:", location);

    return NextResponse.json({ location: location || null });
  } catch (err) {
    console.error("Get location error:", err);
    return NextResponse.json({ 
      message: "Server error", 
      error: err.message 
    }, { status: 500 });
  }
}

// POST - Update driver location and online status
export async function POST(request) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];

    console.log("POST /api/driver/location - Token present:", !!token);

    if (!token) {
      return NextResponse.json({ message: "Unauthorized - No token" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");
      console.log("Token decoded - User ID:", decoded.id);
    } catch (err) {
      console.error("JWT verification failed:", err.message);
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Request body:", body);

    const { lat, lng, address, isOnline } = body;

    if (!lat || !lng) {
      return NextResponse.json(
        { message: "Latitude and longitude required" },
        { status: 400 }
      );
    }

    // Get driver record
    const driver = await prisma.driver.findUnique({
      where: { userId: decoded.id },
    });

    console.log("Driver found:", driver ? `ID: ${driver.id}` : "NOT FOUND");

    if (!driver) {
      return NextResponse.json({ 
        message: "Driver profile not found. Please complete driver onboarding first." 
      }, { status: 404 });
    }

    // Upsert location (create if doesn't exist, update if exists)
    const location = await prisma.driverLocation.upsert({
      where: { driverId: driver.id },
      update: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        address: address || null,
        isOnline: isOnline !== undefined ? isOnline : false,
        updatedAt: new Date(),
      },
      create: {
        driverId: driver.id,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        address: address || null,
        isOnline: isOnline !== undefined ? isOnline : false,
      },
    });

    console.log("Location saved successfully:", location);

    return NextResponse.json({
      success: true,
      message: "Location updated successfully",
      location: {
        lat: location.lat,
        lng: location.lng,
        address: location.address,
        isOnline: location.isOnline,
      },
    });
  } catch (err) {
    console.error("Update location error:", err);
    return NextResponse.json({ 
      message: "Server error", 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }, { status: 500 });
  }
}
